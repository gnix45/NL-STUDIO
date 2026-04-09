'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  IconDashboard,
  IconPackage,
  IconClipboard,
  IconEdit,
  IconBarChart,
  IconActivity,
  IconSettings,
  IconLogOut,
  IconMenu,
  IconClose,
  IconLayers,
  IconSend,
} from '@/components/icons'

const navItems = [
  { href: '/admin', label: 'Tableau de bord', icon: IconDashboard },
  { href: '/admin/orders', label: 'Commandes', icon: IconClipboard },
  { href: '/admin/products', label: 'Produits', icon: IconPackage },
  { href: '/admin/works', label: 'Portfolio', icon: IconLayers },
  { href: '/admin/withdrawals', label: 'Retraits', icon: IconSend },
  { href: '/admin/content', label: 'Contenu', icon: IconEdit },
  { href: '/admin/analytics', label: 'Analytique', icon: IconBarChart },
  { href: '/admin/activity', label: 'Activite', icon: IconActivity },
  { href: '/admin/settings', label: 'Parametres', icon: IconSettings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: '#0C0C0C' }}>
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 40,
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}
        style={{
          width: '240px',
          background: '#0C0C0C',
          borderRight: '1px solid rgba(248, 247, 244, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: sidebarOpen ? 0 : -260,
          bottom: 0,
          zIndex: 50,
          transition: 'left 0.2s ease',
          paddingTop: 'env(safe-area-inset-top, 0)',
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '24px 20px',
            borderBottom: '1px solid rgba(248, 247, 244, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            href="/admin"
            className="font-display"
            style={{ color: '#F8F7F4', textDecoration: 'none', fontSize: '18px', fontWeight: 800 }}
          >
            NL.studio
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="sidebar-close"
            aria-label="Fermer"
            style={{
              background: 'none',
              border: 'none',
              padding: '4px',
              minWidth: '44px',
              minHeight: '44px',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconClose size={20} color="#6B6B6B" />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  color: isActive ? '#F8F7F4' : '#6B6B6B',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: isActive ? 500 : 400,
                  background: isActive ? 'rgba(212, 43, 43, 0.1)' : 'transparent',
                  borderLeft: isActive ? '2px solid #D42B2B' : '2px solid transparent',
                  transition: 'all 0.15s ease',
                  minHeight: '40px',
                }}
              >
                <Icon size={18} color={isActive ? '#D42B2B' : '#6B6B6B'} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div
          style={{
            padding: '16px 12px',
            borderTop: '1px solid rgba(248, 247, 244, 0.06)',
            paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0))',
          }}
        >
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              color: '#6B6B6B',
              background: 'none',
              border: 'none',
              fontSize: '14px',
              cursor: 'pointer',
              minHeight: '40px',
            }}
          >
            <IconLogOut size={18} color="#6B6B6B" />
            Deconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="admin-main">
        {/* Mobile header */}
        <header
          className="admin-mobile-header"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            background: '#0C0C0C',
            borderBottom: '1px solid rgba(248, 247, 244, 0.06)',
            padding: '12px 16px',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 'calc(12px + env(safe-area-inset-top, 0))',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Menu"
            style={{
              background: 'none',
              border: 'none',
              padding: '8px',
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconMenu size={22} color="#F8F7F4" />
          </button>
          <span
            className="font-display"
            style={{ color: '#F8F7F4', fontSize: '16px', fontWeight: 800 }}
          >
            NL.studio
          </span>
          <div style={{ width: '44px' }} />
        </header>

        {/* Content area */}
        <main
          style={{
            flex: 1,
            padding: 'clamp(16px, 3vw, 32px)',
            overflowY: 'auto',
          }}
        >
          {children}
        </main>
      </div>

    </div>
  )
}
