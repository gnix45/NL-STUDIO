import { createServiceRoleClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { FooterSection } from '@/components/landing/FooterSection'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 60

export default async function PortfolioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const id = resolvedParams.id
  const supabase = createServiceRoleClient()

  if (!id) return notFound()

  const { data: work, error } = await supabase
    .from('works')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !work || !work.active) {
    return notFound()
  }

  const images = work.image_url ? work.image_url.split(',').map((u: string) => u.trim()).filter(Boolean) : []

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#EFEFEC', paddingTop: '120px' }}>
        <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(24px, 5vw, 80px) 100px' }}>
          
          <Link 
            href="/portfolio"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#6B6B6B', textDecoration: 'none', marginBottom: '40px', fontSize: '14px', fontWeight: 500 }}
          >
            &#8592; Retour au portfolio
          </Link>

          <header style={{ marginBottom: '64px', maxWidth: '800px' }}>
            <span className="text-label" style={{ color: '#D42B2B', display: 'block', marginBottom: '16px' }}>
              {work.label}
            </span>
            <h1 className="font-display text-display" style={{ color: '#0C0C0C', margin: '0 0 24px', lineHeight: 1.1 }}>
              {work.title}
            </h1>
            {work.description && (
              <p style={{ color: '#6B6B6B', fontSize: '18px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {work.description}
              </p>
            )}
          </header>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {images.length > 0 ? (
              images.map((img: string, i: number) => (
                <div key={i} style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', backgroundColor: work.color }}>
                  <img 
                    src={img} 
                    alt={`${work.title} - image ${i + 1}`} 
                    style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain', maxHeight: '100vh', margin: '0 auto' }} 
                  />
                </div>
              ))
            ) : (
                <div style={{ 
                  width: '100%', 
                  aspectRatio: '16/9', 
                  backgroundColor: work.color, 
                  borderRadius: '16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <span className="font-display" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 'clamp(4rem, 10vw, 10rem)' }}>
                    {work.title.charAt(0)}
                  </span>
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
