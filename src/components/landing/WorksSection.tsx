import { createServiceRoleClient } from '@/lib/supabase/server'
import { WorksGalleryClient } from './WorksGalleryClient'

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

        <WorksGalleryClient works={displayWorks} />
      </div>
    </section>
  )
}
