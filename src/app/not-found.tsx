import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0C0C0C',
        color: '#F8F7F4',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <span
        className="font-display"
        style={{
          fontSize: 'clamp(6rem, 15vw, 12rem)',
          color: '#D42B2B',
          lineHeight: 1,
        }}
      >
        404
      </span>
      <h1
        className="font-display"
        style={{
          fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
          margin: '16px 0 12px',
        }}
      >
        Page introuvable
      </h1>
      <p
        style={{
          color: '#6B6B6B',
          fontSize: 'clamp(0.875rem, 1vw, 1rem)',
          maxWidth: '400px',
          margin: '0 0 32px',
          lineHeight: 1.6,
        }}
      >
        La page que vous recherchez n&apos;existe pas ou a ete deplacee.
      </p>
      <Link
        href="/"
        style={{
          display: 'inline-block',
          background: '#D42B2B',
          color: '#F8F7F4',
          padding: '14px 32px',
          fontSize: '14px',
          fontWeight: 600,
          textDecoration: 'none',
          letterSpacing: '0.5px',
          transition: 'opacity 0.2s',
        }}
      >
        Retour a l&apos;accueil
      </Link>
    </div>
  )
}
