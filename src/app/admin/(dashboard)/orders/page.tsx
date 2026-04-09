import { createServiceRoleClient } from '@/lib/supabase/server'
import { verifyAdminSession } from '@/lib/security'
import { redirect } from 'next/navigation'

function formatXAF(amount: number) {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' XAF'
}

function statusLabel(status: string) {
  switch (status) {
    case 'successful': return 'Reussi'
    case 'failed': return 'Echoue'
    default: return 'En attente'
  }
}

function statusColor(status: string) {
  switch (status) {
    case 'successful': return '#25D366'
    case 'failed': return '#D42B2B'
    default: return '#FFCC00'
  }
}

export default async function AdminOrdersPage() {
  const user = await verifyAdminSession()
  if (!user) redirect('/admin/login')

  const supabase = createServiceRoleClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('id, product_name, buyer_name, buyer_email, amount, carrier, status, fapshi_trans_id, email_sent, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div>
      <h1 className="font-display" style={{ color: '#F8F7F4', fontSize: '20px', margin: '0 0 24px' }}>
        Commandes
      </h1>

      {/* Desktop table */}
      <div className="orders-table-wrapper" style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: '#1A1A1A',
            fontSize: '13px',
            minWidth: '700px',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(248,247,244,0.06)' }}>
              {['Produit', 'Client', 'Montant', 'Carrier', 'Statut', 'Email', 'Date'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '12px 14px',
                    textAlign: 'left',
                    color: '#6B6B6B',
                    fontWeight: 500,
                    fontSize: '12px',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(!orders || orders.length === 0) ? (
              <tr>
                <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#6B6B6B' }}>
                  Aucune commande.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  style={{ borderBottom: '1px solid rgba(248,247,244,0.03)' }}
                >
                  <td style={{ padding: '10px 14px', color: '#F8F7F4' }}>
                    {order.product_name}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ color: '#F8F7F4', display: 'block' }}>{order.buyer_name}</span>
                    <span style={{ color: '#6B6B6B', fontSize: '11px' }}>{order.buyer_email}</span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#F8F7F4', fontWeight: 600 }}>
                    {formatXAF(order.amount)}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span
                      style={{
                        color: order.carrier === 'mtn' ? '#FFCC00' : '#FF6600',
                        fontSize: '12px',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                      }}
                    >
                      {order.carrier}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span
                      style={{
                        color: statusColor(order.status),
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      {statusLabel(order.status)}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#6B6B6B' }}>
                    {order.email_sent ? 'Oui' : 'Non'}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#6B6B6B', whiteSpace: 'nowrap' }}>
                    {new Date(order.created_at).toLocaleString('fr-FR')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
