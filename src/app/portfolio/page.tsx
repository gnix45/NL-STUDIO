import { createServiceRoleClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { WorksGalleryClient } from '@/components/landing/WorksGalleryClient'
import { FooterSection } from '@/components/landing/FooterSection'
import { WhatsAppButton } from '@/components/WhatsAppButton'

export const revalidate = 60

export default async function PortfolioPage() {
  const supabase = createServiceRoleClient()
  
  // Fetch all active portfolio elements unconditionally ordered by creation date
  const { data: works } = await supabase
    .from('works')
    .select('label, title, color, image_url')
    .eq('active', true)
    .order('created_at', { ascending: false })

  const displayWorks = works && works.length > 0 ? works : []

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#EFEFEC', paddingTop: '100px' }}>
        <section
          style={{
            padding: 'clamp(60px, 8vw, 120px) clamp(24px, 5vw, 80px)',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
             <div style={{ marginBottom: 'clamp(40px, 5vw, 64px)' }}>
                <span className="text-label" style={{ color: '#D42B2B', display: 'block', marginBottom: '16px' }}>
                  NOTRE EXPERTISE
                </span>
                <h1 className="font-display text-display" style={{ color: '#0C0C0C', margin: 0 }}>
                  Portfolio Complet
                </h1>
                <p style={{ color: '#6B6B6B', marginTop: '24px', maxWidth: '600px', lineHeight: 1.6 }}>
                  Découvrez l'ensemble de nos réalisations visuelles. Chaque projet illustre notre engagement envers une identité de marque puissante.
                </p>
             </div>
             
             {displayWorks.length > 0 ? (
                <WorksGalleryClient works={displayWorks} />
             ) : (
                <div style={{ textAlign: 'center', padding: '100px 0', color: '#6B6B6B' }}>
                  Aucun projet publié pour le moment.
                </div>
             )}
          </div>
        </section>
      </main>
      <FooterSection />
      <WhatsAppButton phone="+237691239985" />
    </>
  )
}
