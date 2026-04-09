import { verifyAdminSession } from '@/lib/security'
import { redirect } from 'next/navigation'

export default async function AdminSettingsPage() {
  const user = await verifyAdminSession()
  if (!user) redirect('/admin/login')

  return (
    <div>
      <h1 className="font-display" style={{ color: '#F8F7F4', fontSize: '20px', margin: '0 0 24px' }}>
        Parametres
      </h1>

      <div style={{ background: '#1A1A1A', padding: '24px' }}>
        <h2
          className="font-display"
          style={{ color: '#F8F7F4', fontSize: '16px', margin: '0 0 16px', fontWeight: 700 }}
        >
          Compte administrateur
        </h2>
        <div style={{ marginBottom: '16px' }}>
          <span style={{ color: '#6B6B6B', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
            Email
          </span>
          <span style={{ color: '#F8F7F4', fontSize: '14px' }}>
            {user.email}
          </span>
        </div>
        <div>
          <span style={{ color: '#6B6B6B', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
            ID
          </span>
          <span style={{ color: '#6B6B6B', fontSize: '13px', fontFamily: 'monospace' }}>
            {user.id}
          </span>
        </div>
      </div>

      <div style={{ background: '#1A1A1A', padding: '24px', marginTop: '16px' }}>
        <h2
          className="font-display"
          style={{ color: '#F8F7F4', fontSize: '16px', margin: '0 0 16px', fontWeight: 700 }}
        >
          Informations systeme
        </h2>
        <div style={{ display: 'grid', gap: '12px' }}>
          {[
            { label: 'Plateforme', value: 'Next.js 16' },
            { label: 'Version', value: '1.0.0' },
            { label: 'Environnement', value: process.env.NODE_ENV || 'development' },
          ].map((item) => (
            <div key={item.label}>
              <span style={{ color: '#6B6B6B', fontSize: '12px', display: 'block', marginBottom: '2px' }}>
                {item.label}
              </span>
              <span style={{ color: '#F8F7F4', fontSize: '14px' }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
