'use server'

import { createServiceRoleClient } from '@/lib/supabase/server'
import { verifyAdminSession } from '@/lib/security'
import { revalidatePath } from 'next/cache'
import { initiatePayout } from '@/lib/fapshi'
import { logActivity } from '@/lib/logger'

export async function getWithdrawalData() {
  const admin = await verifyAdminSession()
  if (!admin) throw new Error('Unauthorized')

  const supabase = createServiceRoleClient()

  // 1. Calculate Gross Revenue (all successful orders)
  const { data: orders } = await supabase
    .from('orders')
    .select('amount')
    .eq('status', 'successful')

  const grossRevenue = (orders || []).reduce((sum, order) => sum + (order.amount || 0), 0)

  // 2. Calculate Total Withdrawn
  const { data: withdrawals } = await supabase
    .from('withdrawals')
    .select('amount, status, created_at, net_amount, fee, phone')
    .order('created_at', { ascending: false })

  const totalWithdrawn = (withdrawals || [])
    .filter(w => w.status !== 'failed')
    .reduce((sum, w) => sum + (w.amount || 0), 0)

  const availableBalance = grossRevenue - totalWithdrawn

  return {
    grossRevenue,
    availableBalance,
    totalWithdrawn,
    history: withdrawals || []
  }
}

export async function requestWithdrawal(formData: FormData) {
  const admin = await verifyAdminSession()
  if (!admin) throw new Error('Unauthorized')

  const amountStr = formData.get('amount') as string
  const phone = formData.get('phone') as string
  
  const amount = parseInt(amountStr)
  if (isNaN(amount) || amount <= 0) throw new Error('Montant invalide')
  if (!phone || phone.length < 9) throw new Error('Numero de telephone invalide')

  const { availableBalance } = await getWithdrawalData()
  if (amount > availableBalance) {
    throw new Error('Solde insuffisant')
  }

  const fee = Math.ceil(amount * 0.02)
  const net_amount = amount - fee

  if (net_amount <= 0) {
    throw new Error('Le montant net apres les frais est negatif ou nul')
  }

  const supabase = createServiceRoleClient()

  // 1. Record the pending withdrawal in DB
  const { data: withdrawal, error } = await supabase
    .from('withdrawals')
    .insert({
      amount,
      fee,
      net_amount,
      phone,
      status: 'pending',
      created_by: admin.id
    })
    .select('id')
    .single()

  if (error || !withdrawal) {
    throw new Error('Erreur lors de la creation de la demande de retrait')
  }

  // 2. Call Fapshi Payout API
  try {
    const payoutRes = await initiatePayout({ amount: net_amount, phone })
    
    // Update DB with success
    await supabase.from('withdrawals').update({
      fapshi_trans_id: payoutRes.transId,
      status: 'successful'
    }).eq('id', withdrawal.id)

    await logActivity({
      type: 'admin_withdrawal',
      message: `Retrait reussi: ${net_amount} XAF au ${phone}`,
      metadata: { adminId: admin.id, net_amount, fee, transId: payoutRes.transId }
    })

  } catch (err: any) {
    // Update DB with failure
    await supabase.from('withdrawals').update({
      status: 'failed'
    }).eq('id', withdrawal.id)

    await logActivity({
      type: 'admin_withdrawal_failed',
      message: `Echec du retrait admin au ${phone}`,
      severity: 'error',
      metadata: { adminId: admin.id, error: err.message }
    })

    throw new Error('La requete de paiement a Fapshi a echoue: ' + err.message)
  }

  revalidatePath('/admin/withdrawals')
}
