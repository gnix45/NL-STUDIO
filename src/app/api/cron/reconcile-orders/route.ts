import { type NextRequest } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getPaymentStatus } from '@/lib/fapshi'
import { sendSuccessEmail, sendFailureEmail } from '@/lib/email'
import { logActivity, maskEmail } from '@/lib/logger'
import { verifyCronSecret, errorResponse } from '@/lib/security'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // Verify cron secret
  if (!verifyCronSecret(request)) {
    return errorResponse('Non autorise.', 401)
  }

  try {
    const supabase = createServiceRoleClient()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Get pending orders older than 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    const { data: pendingOrders } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'pending')
      .not('fapshi_trans_id', 'is', null)
      .lt('created_at', tenMinutesAgo)
      .limit(50)

    if (!pendingOrders || pendingOrders.length === 0) {
      return Response.json({ reconciled: 0 })
    }

    let reconciledCount = 0

    for (const order of pendingOrders) {
      try {
        const status = await getPaymentStatus(order.fapshi_trans_id)

        if (status.status === 'SUCCESSFUL' && !order.email_sent) {
          await supabase
            .from('orders')
            .update({
              status: 'successful',
              email_sent: true,
              updated_at: new Date().toISOString(),
            })
            .eq('id', order.id)

          try {
            await sendSuccessEmail({
              buyerName: order.buyer_name,
              buyerEmail: order.buyer_email,
              productName: order.product_name,
              productLink: order.product_link,
              amount: order.amount,
              transId: order.fapshi_trans_id,
            })
          } catch {
            console.error(`[reconcile] Email failed for order ${order.id}`)
          }

          await logActivity({
            type: 'order_reconciled',
            message: `Commande reconciliee (succes): ${order.product_name}`,
            metadata: {
              orderId: order.id,
              newStatus: 'successful',
              email: maskEmail(order.buyer_email),
            },
          })
          reconciledCount++
        } else if (status.status === 'FAILED') {
          await supabase
            .from('orders')
            .update({
              status: 'failed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', order.id)

          if (!order.failure_email_sent) {
            try {
              await sendFailureEmail({
                buyerName: order.buyer_name,
                buyerEmail: order.buyer_email,
                productName: order.product_name,
                productPageUrl: `${appUrl}/store`,
                amount: order.amount,
                transId: order.fapshi_trans_id,
              })

              await supabase
                .from('orders')
                .update({ failure_email_sent: true })
                .eq('id', order.id)
            } catch {
              console.error(`[reconcile] Failure email failed for order ${order.id}`)
            }
          }

          await logActivity({
            type: 'order_reconciled',
            message: `Commande reconciliee (echec): ${order.product_name}`,
            severity: 'warning',
            metadata: { orderId: order.id, newStatus: 'failed' },
          })
          reconciledCount++
        }
      } catch (err) {
        console.error(`[reconcile] Failed to reconcile order ${order.id}:`, err)
      }
    }

    return Response.json({ reconciled: reconciledCount, total: pendingOrders.length })
  } catch (err) {
    console.error('[reconcile] Unexpected error:', err)
    return errorResponse('Erreur interne.', 500)
  }
}
