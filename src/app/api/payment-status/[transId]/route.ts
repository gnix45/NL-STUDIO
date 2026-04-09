import { type NextRequest } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { transIdSchema } from '@/lib/validation'
import { getPaymentStatus } from '@/lib/fapshi'
import { sendSuccessEmail, sendFailureEmail } from '@/lib/email'
import { logActivity, maskEmail } from '@/lib/logger'
import { getClientIP, errorResponse, rateLimitResponse } from '@/lib/security'
import { statusLimiter } from '@/lib/rate-limit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ transId: string }> }
) {
  const { transId } = await params

  // Validate transId format
  const validTransId = transIdSchema.safeParse(transId)
  if (!validTransId.success) {
    return errorResponse('Identifiant invalide.', 400)
  }

  // Rate limit
  const ip = await getClientIP()
  const { success } = statusLimiter.check(ip)
  if (!success) {
    return rateLimitResponse()
  }

  try {
    const supabase = createServiceRoleClient()

    // Get order by transaction ID
    const { data: order } = await supabase
      .from('orders')
      .select('id, product_name, product_link, buyer_name, buyer_email, buyer_phone, amount, status, email_sent, failure_email_sent, poll_count')
      .eq('fapshi_trans_id', transId)
      .single()

    if (!order) {
      return errorResponse('Transaction introuvable.', 404)
    }

    // Increment poll count
    await supabase
      .from('orders')
      .update({
        poll_count: (order.poll_count || 0) + 1,
        last_polled_at: new Date().toISOString(),
      })
      .eq('id', order.id)

    // If already finalized, return cached status
    if (order.status === 'successful' || order.status === 'failed') {
      return Response.json({ status: order.status.toUpperCase() })
    }

    // Check payment gateway status
    const paymentStatus = await getPaymentStatus(transId)

    if (paymentStatus.status === 'SUCCESSFUL' && !order.email_sent) {
      // Update order
      await supabase
        .from('orders')
        .update({ status: 'successful', email_sent: true, updated_at: new Date().toISOString() })
        .eq('id', order.id)

      // Send success email
      try {
        await sendSuccessEmail({
          buyerName: order.buyer_name,
          buyerEmail: order.buyer_email,
          productName: order.product_name,
          productLink: order.product_link,
          amount: order.amount,
          transId,
        })

        await logActivity({
          type: 'email_sent',
          message: `Email de confirmation envoye a ${maskEmail(order.buyer_email)}`,
          metadata: { orderId: order.id, type: 'success' },
        })
      } catch (emailErr) {
        console.error('[payment-status] Email send failed:', emailErr)
        await logActivity({
          type: 'email_failed',
          message: `Echec envoi email a ${maskEmail(order.buyer_email)}`,
          severity: 'error',
          metadata: { orderId: order.id, error: String(emailErr) },
        })
      }

      await logActivity({
        type: 'payment_success',
        message: `Paiement reussi: ${order.product_name} - ${order.amount} XAF`,
        metadata: { orderId: order.id, transId, amount: order.amount },
      })

      return Response.json({ status: 'SUCCESSFUL' })
    }

    if (paymentStatus.status === 'FAILED') {
      await supabase
        .from('orders')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', order.id)

      // Send failure email
      if (!order.failure_email_sent) {
        try {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
          await sendFailureEmail({
            buyerName: order.buyer_name,
            buyerEmail: order.buyer_email,
            productName: order.product_name,
            productPageUrl: `${appUrl}/store`,
            amount: order.amount,
            transId,
          })

          await supabase
            .from('orders')
            .update({ failure_email_sent: true })
            .eq('id', order.id)

          await logActivity({
            type: 'email_sent',
            message: `Email d'echec envoye a ${maskEmail(order.buyer_email)}`,
            metadata: { orderId: order.id, type: 'failure' },
          })
        } catch (emailErr) {
          console.error('[payment-status] Failure email send failed:', emailErr)
          await logActivity({
            type: 'email_failed',
            message: `Echec envoi email d'echec a ${maskEmail(order.buyer_email)}`,
            severity: 'error',
            metadata: { orderId: order.id },
          })
        }
      }

      await logActivity({
        type: 'payment_failed',
        message: `Paiement echoue: ${order.product_name} - ${order.amount} XAF`,
        severity: 'warning',
        metadata: { orderId: order.id, transId },
      })

      return Response.json({ status: 'FAILED' })
    }

    // Still pending
    return Response.json({ status: 'PENDING' })
  } catch (err) {
    console.error('[payment-status] Unexpected error:', err)
    return errorResponse('Erreur lors de la verification.', 500)
  }
}
