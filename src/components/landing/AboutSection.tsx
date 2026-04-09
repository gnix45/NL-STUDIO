interface AboutProps {
  content: Record<string, string>
}

export function AboutSection({ content }: AboutProps) {
  const c = content

  return (
    <section
      id="about"
      style={{
        background: '#F8F7F4',
        padding: 'clamp(60px, 8vw, 120px) clamp(24px, 5vw, 80px)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
        className="about-grid"
      >
        {/* Left: Text */}
        <div>
          <span
            className="text-label"
            style={{ color: '#D42B2B', marginBottom: '16px', display: 'block' }}
          >
            {c.label || 'A PROPOS'}
          </span>

          <h2
            className="font-display text-display-md"
            style={{
              color: '#0C0C0C',
              margin: '0 0 32px',
            }}
          >
            {c.title || 'Un regard creatif sur chaque projet'}
          </h2>

          <p
            className="text-body-lg"
            style={{
              color: '#6B6B6B',
              maxWidth: '520px',
              margin: '0 0 20px',
            }}
          >
            {c.paragraph1 || 'NL.studio est un studio de design visuel fonde sur la conviction que chaque marque merite une identite forte et memorable.'}
          </p>

          <p
            className="text-body-lg"
            style={{
              color: '#6B6B6B',
              maxWidth: '520px',
              margin: '0 0 32px',
            }}
          >
            {c.paragraph2 || 'Notre approche combine rigueur strategique et sensibilite artistique pour livrer des resultats qui depassent les attentes.'}
          </p>

          {/* Red divider bar */}
          <div
            style={{
              width: '60px',
              height: '4px',
              background: '#D42B2B',
            }}
          />
        </div>

        {/* Right: Quote box */}
        <div
          style={{
            position: 'relative',
          }}
        >
          <div
            style={{
              background: '#EFEFEC',
              padding: 'clamp(32px, 4vw, 56px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              height: '100%',
              position: 'relative',
            }}
          >
            <p
              className="font-display"
              style={{
                fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
                color: '#0C0C0C',
                margin: 0,
                lineHeight: 1.4,
                fontWeight: 700,
              }}
            >
              {c.quote || '"Le design est la methode silencieuse de parler a votre audience."'}
            </p>

            {/* Red bottom bar */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: '#D42B2B',
              }}
            />
          </div>

          {/* NL badge top-right */}
          <div
            style={{
              position: 'absolute',
              top: '-16px',
              right: '-16px',
              width: '56px',
              height: '56px',
              background: '#0C0C0C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              className="font-display"
              style={{
                color: '#F8F7F4',
                fontSize: '16px',
                fontWeight: 800,
              }}
            >
              NL
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
