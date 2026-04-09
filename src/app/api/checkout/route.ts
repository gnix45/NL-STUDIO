import { type NextRequest } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { checkoutSchema, detectCarrier, carrierToMedium, sanitizePhone } from '@/lib/validation'
import { initiateDirectPay } from '@/lib/fapshi'
import { logActivity, maskPhone, maskEmail } from '@/lib/logger'
import { getClientIP, getUserAgent, verifyCsrf, errorResponse, rateLimitResponse } from '@/lib/security'
import { checkoutLimiter } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // CSRF check
  if (!verifyCsrf(request)) {
    return errorResponse('Requete invalide.', 403)
  }

  // Rate limit
  const ip = await getClientIP()
  const { success } = checkoutLimiter.check(ip)
  if (!success) {
    await logActivity({
      type: 'rate_limit_hit',
      message: `Rate limit hit on checkout from ${ip}`,
      severity: 'warning',
      metadata: { ip },
    })
    return rateLimitResponse()
  }

  try {
    const body = await request.json()
    const parsed = checkoutSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Donnees invalides.'
      return errorResponse(firstError, 400)
    }

    const { name, email, phone, productId } = parsed.data
    const cleanPhone = sanitizePhone(phone)
    const carrier = detectCarrier(cleanPhone)

    if (!carrier) {
      return errorResponse('Numero de telephone non supporte.', 400)
    }

    const supabase = createServiceRoleClient()

    // Fetch product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, price, product_link, active')
      .eq('id', productId)
      .eq('active', true)
      .single()

    if (productError || !product) {
      return errorResponse('Produit introuvable ou indisponible.', 404)
    }

    const ua = await getUserAgent()
    const totalAmount = Math.ceil(product.price * 1.05)

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        product_id: product.id,
        product_name: product.name,
        product_link: product.product_link,
        buyer_name: name,
        buyer_email: email,
        buyer_phone: cleanPhone,
        amount: totalAmount,
        carrier,
        status: 'pending',
        client_ip: ip,
        user_agent: ua,
      })
      .select('id')
      .single()

    if (orderError || !order) {
      console.error('[checkout] Order creation failed:', orderError)
      return errorResponse('Erreur lors de la creation de la commande.', 500)
    }

    await logActivity({
      type: 'payment_initiated',
      message: `Paiement initie: ${product.name} - ${totalAmount} XAF`,
      metadata: {
        orderId: order.id,
        productName: product.name,
        amount: totalAmount,
        phone: maskPhone(cleanPhone),
        carrier,
        ip,
      },
    })

    // Call payment gateway
    const medium = carrierToMedium(carrier)
    const fapshiResponse = await initiateDirectPay({
      amount: totalAmount,
      phone: cleanPhone,
      medium: medium as 'mobile money' | 'orange money',
      name,
      email,
      externalId: order.id,
      message: `Achat: ${product.name} -- NL.studio`,
    })

    // Update order with transaction ID
    await supabase
      .from('orders')
      .update({ fapshi_trans_id: fapshiResponse.transId })
      .eq('id', order.id)

    return Response.json({
      orderId: order.id,
      transId: fapshiResponse.transId,
      message: fapshiResponse.message,
    })
  } catch (err) {
    console.error('[checkout] Unexpected error:', err)
    return errorResponse('Une erreur est survenue. Veuillez reessayer.', 500)
  }
}
