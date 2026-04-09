import { createServiceRoleClient } from '@/lib/supabase/server'
import { verifyAdminSession } from '@/lib/security'
import { redirect } from 'next/navigation'

function formatXAF(amount: number) {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' XAF'
}

export default async function AdminAnalyticsPage() {
  const user = await verifyAdminSession()
  if (!user) redirect('/admin/login')

  const supabase = createServiceRoleClient()

  // Get all successful orders
  const { data: successfulOrders } = await supabase
    .from('orders')
    .select('amount, carrier, product_name, created_at')
    .eq('status', 'successful')

  const allOrders = successfulOrders || []
  const totalRevenue = allOrders.reduce((sum, o) => sum + o.amount, 0)
  const avgOrderValue = allOrders.length > 0 ? Math.round(totalRevenue / allOrders.length) : 0

  // By carrier
  const mtnOrders = allOrders.filter((o) => o.carrier === 'mtn')
  const orangeOrders = allOrders.filter((o) => o.carrier === 'orange')
  const mtnRevenue = mtnOrders.reduce((sum, o) => sum + o.amount, 0)
  const orangeRevenue = orangeOrders.reduce((sum, o) => sum + o.amount, 0)

  // Top products
  const productRevenue: Record<string, { count: number; revenue: number }> = {}
  allOrders.forEach((o) => {
    if (!productRevenue[o.product_name]) {
      productRevenue[o.product_name] = { count: 0, revenue: 0 }
    }
    productRevenue[o.product_name].count++
    productRevenue[o.product_name].revenue += o.amount
  })
  const topProducts = Object.entries(productRevenue)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 10)

  // Conversion rate
  const { count: totalOrderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })

  const conversionRate =
    (totalOrderCount || 0) > 0
      ? ((allOrders.length / (totalOrderCount || 1)) * 100).toFixed(1)
      : '0'

  const statsData = [
    { label: 'Revenu total', value: formatXAF(totalRevenue) },
    { label: 'Commandes reussies', value: String(allOrders.length) },
    { label: 'Valeur moyenne', value: formatXAF(avgOrderValue) },
    { label: 'Taux de conversion', value: `${conversionRate}%` },
  ]

  return (
    <div>
      <h1 className="font-display" style={{ color: '#F8F7F4', fontSize: '20px', margin: '0 0 24px' }}>
        Analytique
      </h1>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1px',
          background: 'rgba(248,247,244,0.04)',
          marginBottom: '32px',
        }}
      >
        {statsData.map((stat) => (
          <div key={stat.label} style={{ background: '#1A1A1A', padding: '20px' }}>
            <span className="text-label" style={{ color: '#6B6B6B', display: 'block', marginBottom: '8px' }}>
              {stat.label}
            </span>
            <span className="font-display" style={{ color: '#F8F7F4', fontSize: '20px' }}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Carrier breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1px',
          background: 'rgba(248,247,244,0.04)',
          marginBottom: '32px',
        }}
      >
        <div style={{ background: '#1A1A1A', padding: '20px' }}>
          <span style={{ color: '#FFCC00', fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
            MTN Mobile Money
          </span>
          <span className="font-display" style={{ color: '#F8F7F4', fontSize: '18px', display: 'block' }}>
            {formatXAF(mtnRevenue)}
          </span>
          <span style={{ color: '#6B6B6B', fontSize: '12px' }}>
            {mtnOrders.length} commande{mtnOrders.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div style={{ background: '#1A1A1A', padding: '20px' }}>
          <span style={{ color: '#FF6600', fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
            Orange Money
          </span>
          <span className="font-display" style={{ color: '#F8F7F4', fontSize: '18px', display: 'block' }}>
            {formatXAF(orangeRevenue)}
          </span>
          <span style={{ color: '#6B6B6B', fontSize: '12px' }}>
            {orangeOrders.length} commande{orangeOrders.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Top products */}
      <h2 className="font-display" style={{ color: '#F8F7F4', fontSize: '16px', margin: '0 0 16px', fontWeight: 700 }}>
        Produits les plus vendus
      </h2>
      <div style={{ background: '#1A1A1A' }}>
        {topProducts.length === 0 ? (
          <p style={{ color: '#6B6B6B', padding: '32px', textAlign: 'center', fontSize: '14px' }}>
            Aucune donnee disponible.
          </p>
        ) : (
          topProducts.map(([name, data], i) => (
            <div
              key={name}
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid rgba(248,247,244,0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                <span style={{ color: '#6B6B6B', fontSize: '14px', fontWeight: 600, width: '24px', flexShrink: 0 }}>
                  {i + 1}.
                </span>
                <span style={{ color: '#F8F7F4', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {name}
                </span>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ color: '#F8F7F4', fontSize: '14px', fontWeight: 600, display: 'block' }}>
                  {formatXAF(data.revenue)}
                </span>
                <span style={{ color: '#6B6B6B', fontSize: '11px' }}>
                  {data.count} vente{data.count !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
