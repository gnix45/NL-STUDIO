import Link from 'next/link'

interface HeroProps {
  content: Record<string, string>
}

export function HeroSection({ content }: HeroProps) {
  const c = content

  return (
    <section
      id="hero"
      style={{
        minHeight: '100dvh',
        display: 'grid',
        gridTemplateColumns: '1fr',
      }}
    >
      {/* Mobile: single column / Desktop: two columns */}
      <div className="hero-grid">
        {/* Left: Dark panel */}
        <div
          style={{
            background: '#0C0C0C',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: 'clamp(80px, 10vw, 120px) clamp(24px, 5vw, 80px) clamp(40px, 5vw, 80px)',
          }}
        >
          {/* NL watermark */}
          <span
            className="font-display"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: 'clamp(15rem, 30vw, 40rem)',
              color: '#F8F7F4',
              opacity: 0.03,
              pointerEvents: 'none',
              userSelect: 'none',
              lineHeight: 1,
            }}
          >
            NL
          </span>

          {/* Tagline */}
          <span
            className="text-label"
            style={{ color: '#D42B2B', marginBottom: '24px' }}
          >
            {c.tagline || 'DESIGN & BRANDING STUDIO'}
          </span>

          {/* Title */}
          <h1 className="font-display text-display-xl" style={{ color: '#F8F7F4', margin: '0 0 24px' }}>
            {c.title_line1 || 'Nous créons des '}
            <br />
            <span style={{ color: '#D42B2B' }}>
              {c.title_line2 || 'identités'}
            </span>
            <br />
            {c.title_line3 || 'visuelles uniques'}
          </h1>

          {/* Subtitle */}
          <p
            className="text-body-lg"
            style={{
              color: '#6B6B6B',
              maxWidth: '500px',
              margin: '0 0 40px',
              lineHeight: 1.7,
            }}
          >
            {c.subtitle || 'Studio de design graphique spécialisé en branding, direction artistique et solutions visuelles sur mesure.'}
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a
              href="#works"
              style={{
                background: 'transparent',
                color: '#F8F7F4',
                border: '1px solid #F8F7F4',
                padding: '14px 28px',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'background 0.2s, color 0.2s',
                minWidth: '44px',
                minHeight: '44px',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              Voir nos travaux
            </a>
            <Link
              href="/store"
              style={{
                background: '#D42B2B',
                color: '#F8F7F4',
                padding: '14px 28px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                minWidth: '44px',
                minHeight: '44px',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              Boutique
            </Link>
          </div>
        </div>

        {/* Right: Stat grid (hidden on mobile) */}
        <div className="hero-stats-panel">
          {/* 2x2 grid of stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr 1fr',
              height: '100%',
              gap: '1px',
              background: '#EFEFEC',
            }}
          >
            <StatCell
              value={c.stat_projects || '50+'}
              label="Projets"
              bg="#F8F7F4"
            />
            <StatCell
              value={c.stat_years || '5+'}
              label="Années"
              bg="#F8F7F4"
            />
            <StatCell
              value={c.stat_clients || '30+'}
              label="Clients"
              bg="#F8F7F4"
            />
            <StatCell
              value={c.stat_passion || '100%'}
              label="Passion"
              bg="#D42B2B"
              textColor="#F8F7F4"
            />
          </div>
        </div>
      </div>


    </section>
  )
}

function StatCell({
  value,
  label,
  bg,
  textColor = '#0C0C0C',
}: {
  value: string
  label: string
  bg: string
  textColor?: string
}) {
  return (
    <div
      style={{
        background: bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
      }}
    >
      <span
        className="font-display"
        style={{
          fontSize: 'clamp(2rem, 4vw, 3.5rem)',
          color: textColor,
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span
        className="text-label"
        style={{
          color: textColor === '#F8F7F4' ? 'rgba(248,247,244,0.7)' : '#6B6B6B',
          marginTop: '12px',
        }}
      >
        {label}
      </span>
    </div>
  )
}
