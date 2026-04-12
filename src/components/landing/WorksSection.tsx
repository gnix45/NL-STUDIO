import { createServiceRoleClient } from '@/lib/supabase/server'
import { WorksGalleryClient } from './WorksGalleryClient'
import { PortfolioLink } from './PortfolioLink'

export async function WorksSection() {
  const supabase = createServiceRoleClient()
  const { data: works } = await supabase
    .from('works')
    .select('id, label, title, description, color, image_url')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(5)

  // Fallback if empty database
  const displayWorks = works && works.length > 0 ? works : [
    { id: '1', label: 'Branding', title: 'Identité Visuelle Luxe', description: '', color: '#1a1a2e', image_url: null },
    { id: '2', label: 'Logo Design', title: 'Marque Artisanale', description: '', color: '#16213e', image_url: null },
    { id: '3', label: 'Packaging', title: 'Gamme Cosmétique', description: '', color: '#0f3460', image_url: null },
    { id: '4', label: 'Web Design', title: 'Portfolio Créatif', description: '', color: '#2c2c34', image_url: null },
    { id: '5', label: 'Direction Artistique', title: 'Campagne Visuelle', description: '', color: '#1b1b2f', image_url: null }
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
          Travaux récents
        </h2>

        <WorksGalleryClient works={displayWorks} />

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '64px' }}>
          <PortfolioLink />
        </div>
      </div>
    </section>
  )
}
