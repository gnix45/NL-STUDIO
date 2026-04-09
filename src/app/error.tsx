'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error('[NL.studio] Page error:', error)
  }, [error])

  return (
    <div
      style={{
        minHeight: '60dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F8F7F4',
        color: '#0C0C0C',
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      <span
        className="font-display"
        style={{
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          color: '#D42B2B',
          lineHeight: 1,
        }}
      >
        Oops
      </span>
      <h2
        className="font-display"
        style={{
          fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
          margin: '16px 0 12px',
        }}
      >
        Quelque chose s&apos;est mal passe
      </h2>
      <p
        style={{
          color: '#6B6B6B',
          fontSize: 'clamp(0.875rem, 1vw, 1rem)',
          maxWidth: '400px',
          margin: '0 0 32px',
          lineHeight: 1.6,
        }}
      >
        Une erreur est survenue lors du chargement de cette page.
      </p>
      <button
        onClick={() => unstable_retry()}
        style={{
          background: '#0C0C0C',
          color: '#F8F7F4',
          border: 'none',
          padding: '14px 32px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          letterSpacing: '0.5px',
        }}
      >
        Reessayer
      </button>
    </div>
  )
}
