'use client'

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0C0C0C',
          color: '#F8F7F4',
          fontFamily: "'DM Sans', sans-serif",
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(4rem, 10vw, 8rem)',
            color: '#D42B2B',
            lineHeight: 1,
            letterSpacing: '-0.04em',
          }}
        >
          500
        </span>
        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(1.25rem, 2.5vw, 2rem)',
            margin: '16px 0 12px',
            letterSpacing: '-0.02em',
          }}
        >
          Erreur inattendue
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
          Une erreur est survenue. Veuillez reessayer.
        </p>
        <button
          onClick={() => unstable_retry()}
          style={{
            background: '#D42B2B',
            color: '#F8F7F4',
            border: 'none',
            padding: '14px 32px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '0.5px',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Reessayer
        </button>
        {error.digest && (
          <p
            style={{
              color: '#6B6B6B',
              fontSize: '11px',
              marginTop: '24px',
            }}
          >
            Ref: {error.digest}
          </p>
        )}
      </body>
    </html>
  )
}
