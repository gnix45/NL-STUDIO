import { createServiceRoleClient } from '@/lib/supabase/server'
import { verifyAdminSession } from '@/lib/security'
import { redirect } from 'next/navigation'
import { IconShoppingBag, IconClipboard, IconCheckCircle, IconClock } from '@/components/icons'

function formatXAF(amount: number) {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' XAF'
}

export default async function AdminDashboard() {
  const user = await verifyAdminSession()
  if (!user) redirect('/admin/login')

  const supabase = createServiceRoleClient()

  // Fetch stats
  const [
    { count: totalProducts },
    { count: totalOrders },
    { count: successfulOrders },
    { count: pendingOrders },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'successful'),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  // Revenue
  const { data: revenueData } = await supabase
    .from('orders')
    .select('amount')
    .eq('status', 'successful')

  const totalRevenue = revenueData?.reduce((sum, o) => sum + (o.amount || 0), 0) || 0

  // Recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, product_name, buyer_name, amount, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  // Recent activity
  const { data: recentActivity } = await supabase
    .from('activity_log')
    .select('id, type, message, severity, created_at')
    .order('created_at', { ascending: false })
    .limit(8)

  const stats = [
    { label: 'Produits', value: String(totalProducts || 0), icon: IconShoppingBag, color: '#D42B2B' },
    { label: 'Commandes', value: String(totalOrders || 0), icon: IconClipboard, color: '#0C0C0C' },
    { label: 'Reussies', value: String(successfulOrders || 0), icon: IconCheckCircle, color: '#25D366' },
    { label: 'En attente', value: String(pendingOrders || 0), icon: IconClock, color: '#FFCC00' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1
          className="font-display"
          style={{ color: '#F8F7F4', fontSize: 'clamp(1.25rem, 2vw, 1.75rem)', margin: '0 0 8px' }}
        >
          Tableau de bord
        </h1>
        <p style={{ color: '#6B6B6B', fontSize: '14px', margin: 0 }}>
          Bienvenue dans l&apos;espace administration
        </p>
      </div>

      {/* Revenue banner */}
      <div
        style={{
          background: '#D42B2B',
          padding: 'clamp(20px, 3vw, 32px)',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <span className="text-label" style={{ color: 'rgba(248,247,244,0.7)', marginBottom: '8px' }}>
          REVENU TOTAL
        </span>
        <span className="font-display" style={{ color: '#F8F7F4', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}>
          {formatXAF(totalRevenue)}
        </span>
      </div>

      {/* Stats grid */}
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              style={{
                background: '#1A1A1A',
                padding: 'clamp(16px, 2vw, 24px)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  background: 'rgba(248, 247, 244, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={20} color={stat.color} />
              </div>
              <div>
                <span
                  className="font-display"
                  style={{ color: '#F8F7F4', fontSize: '20px', display: 'block', lineHeight: 1 }}
                >
                  {stat.value}
                </span>
                <span style={{ color: '#6B6B6B', fontSize: '12px' }}>{stat.label}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Two columns: Recent orders + Activity */}
      <div className="dashboard-cols">
        {/* Recent orders */}
        <div>
          <h2
            className="font-display"
            style={{ color: '#F8F7F4', fontSize: '16px', margin: '0 0 16px', fontWeight: 700 }}
          >
            Commandes recentes
          </h2>
          <div style={{ background: '#1A1A1A' }}>
            {(!recentOrders || recentOrders.length === 0) ? (
              <p style={{ color: '#6B6B6B', padding: '24px', fontSize: '14px' }}>
                Aucune commande pour le moment.
              </p>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid rgba(248, 247, 244, 0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span
                      style={{
                        color: '#F8F7F4',
                        fontSize: '14px',
                        fontWeight: 500,
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {order.product_name}
                    </span>
                    <span style={{ color: '#6B6B6B', fontSize: '12px' }}>
                      {order.buyer_name}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span
                      style={{
                        color: '#F8F7F4',
                        fontSize: '13px',
                        fontWeight: 600,
                        display: 'block',
                      }}
                    >
                      {formatXAF(order.amount)}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 500,
                        color:
                          order.status === 'successful'
                            ? '#25D366'
                            : order.status === 'failed'
                            ? '#D42B2B'
                            : '#FFCC00',
                      }}
                    >
                      {order.status === 'successful'
                        ? 'Reussi'
                        : order.status === 'failed'
                        ? 'Echoue'
                        : 'En attente'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <h2
            className="font-display"
            style={{ color: '#F8F7F4', fontSize: '16px', margin: '0 0 16px', fontWeight: 700 }}
          >
            Activite recente
          </h2>
          <div style={{ background: '#1A1A1A' }}>
            {(!recentActivity || recentActivity.length === 0) ? (
              <p style={{ color: '#6B6B6B', padding: '24px', fontSize: '14px' }}>
                Aucune activite enregistree.
              </p>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid rgba(248, 247, 244, 0.04)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        background:
                          activity.severity === 'error' || activity.severity === 'critical'
                            ? '#D42B2B'
                            : activity.severity === 'warning'
                            ? '#FFCC00'
                            : '#25D366',
                        display: 'inline-block',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        color: '#F8F7F4',
                        fontSize: '13px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {activity.message}
                    </span>
                  </div>
                  <span style={{ color: '#6B6B6B', fontSize: '11px', marginLeft: '14px' }}>
                    {new Date(activity.created_at).toLocaleString('fr-FR')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
