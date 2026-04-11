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

    const { name, email, phone, whatsapp, productId, variantName, deliveryAddress } = parsed.data
    const cleanPhone = sanitizePhone(phone)
    const carrier = detectCarrier(cleanPhone)

    if (!carrier) {
      return errorResponse('Numero de telephone non supporte.', 400)
    }

    const supabase = createServiceRoleClient()

    // Fetch product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, price, product_link, active, is_physical, variants')
      .eq('id', productId)
      .eq('active', true)
      .single()

    if (productError || !product) {
      return errorResponse('Produit introuvable ou indisponible.', 404)
    }

    if (product.is_physical && (!deliveryAddress || deliveryAddress.trim() === '')) {
      return errorResponse('L\'adresse de livraison est requise pour ce produit.', 400)
    }

    let basePrice = product.price
    let matchedVariantName = null

    if (variantName && product.variants && Array.isArray(product.variants)) {
      const variant = product.variants.find((v: any) => v.name === variantName)
      if (variant) {
        basePrice = variant.price
        matchedVariantName = variant.name
      } else {
        return errorResponse('Variante selectionnee introuvable.', 400)
      }
    } else if (product.variants && product.variants.length > 0 && !variantName) {
      return errorResponse('Veuillez selectionner une variante du produit.', 400)
    }

    const ua = await getUserAgent()
    const totalAmount = Math.ceil(basePrice * 1.03)

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
        buyer_whatsapp: whatsapp,
        amount: totalAmount,
        carrier,
        status: 'pending',
        client_ip: ip,
        user_agent: ua,
        variant_name: matchedVariantName,
        delivery_address: product.is_physical ? deliveryAddress : null,
      })
      .select('id')
      .single()

    if (orderError || !order) {
      console.error('[checkout] Order creation failed:', orderError)
      return errorResponse('Erreur lors de la creation de la commande.', 500)
    }

    await logActivity({
      type: 'payment_initiated',
      message: `Paiement initie: ${product.name}${matchedVariantName ? ' ('+matchedVariantName+')' : ''} - ${totalAmount} XAF`,
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
    const fapshiRes = await initiateDirectPay({
      amount: totalAmount,
      email,
      phone: cleanPhone,
      medium,
    })

    // Save transaction ID
    await supabase
      .from('orders')
      .update({ fapshi_trans_id: fapshiRes.transId })
      .eq('id', order.id)

    return Response.json({ transId: fapshiRes.transId })
  } catch (err) {
    console.error('[checkout] Error:', err)
    return errorResponse('Erreur interne. Veuillez reessayer.', 500)
  }
}
