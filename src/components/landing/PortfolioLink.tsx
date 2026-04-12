'use client'

import Link from 'next/link'

export function PortfolioLink() {
  return (
    <Link
      href="/portfolio"
      style={{
        display: 'inline-block',
        background: '#D42B2B',
        color: '#F8F7F4',
        padding: '16px 32px',
        fontSize: '14px',
        fontWeight: 600,
        textDecoration: 'none',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        transition: 'background 0.3s ease',
      }}
      onMouseOver={(e) => { e.currentTarget.style.background = '#0C0C0C' }}
      onMouseOut={(e) => { e.currentTarget.style.background = '#D42B2B' }}
    >
      Voir Tout Le Portfolio
    </Link>
  )
}
