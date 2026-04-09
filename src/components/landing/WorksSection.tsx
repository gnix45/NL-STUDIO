import { createServiceRoleClient } from '@/lib/supabase/server'

export async function WorksSection() {
  const supabase = createServiceRoleClient()
  const { data: works } = await supabase
    .from('works')
    .select('label, title, color, image_url')
    .eq('active', true)
    .order('order_index', { ascending: true })
    .limit(6)

  // Fallback if empty database
  const displayWorks = works && works.length > 0 ? works : [
    { label: 'Branding', title: 'Identite Visuelle Luxe', color: '#1a1a2e', image_url: null },
    { label: 'Logo Design', title: 'Marque Artisanale', color: '#16213e', image_url: null },
    { label: 'Packaging', title: 'Gamme Cosmetique', color: '#0f3460', image_url: null },
    { label: 'Web Design', title: 'Portfolio Creatif', color: '#2c2c34', image_url: null },
    { label: 'Direction Artistique', title: 'Campagne Visuelle', color: '#1b1b2f', image_url: null },
    { label: 'Branding', title: 'Startup Tech', color: '#162447', image_url: null },
  ]

  return (
    <section
      id="works"
      style={{
        background: '#EFEFEC',
        padding: 'clamp(60px, 8vw, 120px) clamp(24px, 5vw, 80px)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <span
          className="text-label"
          style={{ color: '#D42B2B', display: 'block', marginBottom: '16px' }}
        >
          PORTFOLIO
        </span>
        <h2
          className="font-display text-display-md"
          style={{ color: '#0C0C0C', margin: '0 0 clamp(40px, 5vw, 64px)' }}
        >
          Travaux recents
        </h2>

        <div className="works-grid">
          {displayWorks.map((work, i) => (
            <div
              key={i}
              className="img-overlay"
              style={{
                aspectRatio: i < 2 ? '4/3' : i < 4 ? '1/1' : '4/3',
                background: work.image_url ? `url(${work.image_url}) center/cover` : work.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Placeholder initial si pas d'image */}
              {!work.image_url && (
                <span
                  className="font-display"
                  style={{
                    color: 'rgba(248, 247, 244, 0.08)',
                    fontSize: 'clamp(4rem, 8vw, 8rem)',
                    userSelect: 'none',
                    lineHeight: 1,
                  }}
                >
                  {work.title.charAt(0)}
                </span>
              )}

              {/* Hover overlay content */}
              <div className="overlay-content">
                <span
                  className="text-label"
                  style={{ color: '#D42B2B', marginBottom: '8px' }}
                >
                  {work.label}
                </span>
                <span
                  className="font-display"
                  style={{
                    color: '#F8F7F4',
                    fontSize: 'clamp(1rem, 2vw, 1.5rem)',
                    fontWeight: 700,
                  }}
                >
                  {work.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
