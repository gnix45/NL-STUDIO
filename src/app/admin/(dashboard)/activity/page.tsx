import { createServiceRoleClient } from '@/lib/supabase/server'
import { verifyAdminSession } from '@/lib/security'
import { redirect } from 'next/navigation'

export default async function AdminActivityPage() {
  const user = await verifyAdminSession()
  if (!user) redirect('/admin/login')

  const supabase = createServiceRoleClient()
  const { data: logs } = await supabase
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  function severityColor(severity: string) {
    switch (severity) {
      case 'error':
      case 'critical':
        return '#D42B2B'
      case 'warning':
        return '#FFCC00'
      default:
        return '#25D366'
    }
  }

  return (
    <div>
      <h1 className="font-display" style={{ color: '#F8F7F4', fontSize: '20px', margin: '0 0 24px' }}>
        Journal d&apos;activite
      </h1>

      <div style={{ background: '#1A1A1A' }}>
        {(!logs || logs.length === 0) ? (
          <p style={{ color: '#6B6B6B', padding: '32px', textAlign: 'center', fontSize: '14px' }}>
            Aucune activite enregistree.
          </p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid rgba(248,247,244,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    marginTop: '5px',
                    background: severityColor(log.severity),
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span
                      style={{
                        color: '#F8F7F4',
                        fontSize: '13px',
                        fontWeight: 500,
                      }}
                    >
                      {log.message}
                    </span>
                    <span
                      style={{
                        color: '#6B6B6B',
                        fontSize: '11px',
                        border: '1px solid rgba(248,247,244,0.06)',
                        padding: '1px 6px',
                      }}
                    >
                      {log.type}
                    </span>
                  </div>
                  <span style={{ color: '#6B6B6B', fontSize: '11px' }}>
                    {new Date(log.created_at).toLocaleString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
