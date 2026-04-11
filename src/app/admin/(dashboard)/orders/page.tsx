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
    .select('id, product_name, buyer_name, buyer_email, buyer_phone, buyer_whatsapp, amount, carrier, status, fapshi_trans_id, email_sent, created_at, variant_name, delivery_address')
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
            minWidth: '900px',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(248,247,244,0.06)' }}>
              {['Produit', 'Client', 'Contact', 'Montant', 'Carrier', 'Statut', 'Date'].map((h) => (
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
                  <td style={{ padding: '10px 14px', color: '#F8F7F4', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{order.product_name}</div>
                    {order.variant_name && (
                      <div style={{ color: '#888', fontSize: '11px', display: 'inline-block', background: 'rgba(248,247,244,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                        Variante: {order.variant_name}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '10px 14px', verticalAlign: 'top' }}>
                    <span style={{ color: '#F8F7F4', display: 'block', fontWeight: 500 }}>{order.buyer_name}</span>
                    {order.delivery_address ? (
                      <div style={{ color: '#D42B2B', fontSize: '11px', background: 'rgba(212,43,43,0.1)', padding: '2px 4px', borderRadius: '4px', display: 'inline-flex', marginTop: '4px', maxWidth: '200px' }}>
                        Livraison: {order.delivery_address}
                      </div>
                    ) : (
                      <span style={{ color: '#6B6B6B', fontSize: '11px', display: 'block' }}>Livraison N.</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 14px', verticalAlign: 'top', minWidth: '150px' }}>
                    <span style={{ color: '#6B6B6B', fontSize: '11px', display: 'block' }}>Email: {order.buyer_email}</span>
                    <span style={{ color: '#25D366', fontSize: '11px', display: 'block' }}>WA: +{order.buyer_whatsapp}</span>
                    <span style={{ color: '#6B6B6B', fontSize: '11px', display: 'block' }}>Tel: +{order.buyer_phone}</span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#F8F7F4', fontWeight: 600, verticalAlign: 'top' }}>
                    {formatXAF(order.amount)}
                  </td>
                  <td style={{ padding: '10px 14px', verticalAlign: 'top' }}>
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
                  <td style={{ padding: '10px 14px', verticalAlign: 'top' }}>
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
                  <td style={{ padding: '10px 14px', color: '#6B6B6B', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
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
