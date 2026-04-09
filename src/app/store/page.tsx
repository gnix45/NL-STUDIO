import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { FooterSection } from '@/components/landing/FooterSection'
import { WhatsAppButton } from '@/components/WhatsAppButton'

import { IconShoppingBag, IconArrowRight } from '@/components/icons'

export const revalidate = 60

async function getStoreContent() {
  try {
    const supabase = createServiceRoleClient()
    const { data } = await supabase
      .from('page_content')
      .select('key, value')
      .eq('section', 'store')
    const content: Record<string, string> = {}
    if (data) data.forEach((r) => (content[r.key] = r.value))
    return content
  } catch {
    return {}
  }
}

async function getProducts() {
  try {
    const supabase = createServiceRoleClient()
    const { data } = await supabase
      .from('products')
      .select('id, name, description, price, image_url, category')
      .eq('active', true)
      .order('created_at', { ascending: false })
    return data || []
  } catch {
    return []
  }
}

function formatXAF(amount: number) {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' XAF'
}

export default async function StorePage() {
  const [content, products] = await Promise.all([
    getStoreContent(),
    getProducts(),
  ])

  return (
    <>
      <Navbar />

      {/* Header */}
      <section
        style={{
          background: '#0C0C0C',
          padding: 'clamp(120px, 15vw, 180px) clamp(24px, 5vw, 80px) clamp(60px, 8vw, 100px)',
          textAlign: 'center',
        }}
      >
        <h1
          className="font-display text-display-lg"
          style={{ color: '#F8F7F4', margin: '0 0 16px' }}
        >
          {content.title || 'Boutique'}
        </h1>
        <p
          className="text-body-lg"
          style={{ color: '#6B6B6B', maxWidth: '500px', margin: '0 auto' }}
        >
          {content.subtitle || 'Ressources et templates premium pour vos projets creatifs.'}
        </p>
      </section>

      {/* Product Grid */}
      <section
        style={{
          background: '#F8F7F4',
          padding: 'clamp(40px, 5vw, 80px) clamp(24px, 5vw, 80px)',
          minHeight: '40vh',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {products.length === 0 ? (
            /* Empty state */
            <div
              style={{
                textAlign: 'center',
                padding: '80px 24px',
                color: '#6B6B6B',
              }}
            >
              <IconShoppingBag size={48} color="#EFEFEC" />
              <p className="text-body-lg" style={{ marginTop: '16px' }}>
                Aucun produit disponible pour le moment.
              </p>
            </div>
          ) : (
            <div className="store-grid">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/store/${product.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <article className="hover-border-top" style={{ background: '#FFFFFF' }}>
                    {/* Image */}
                    <div
                      style={{
                        aspectRatio: '4/3',
                        background: '#0C0C0C',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <span
                          className="font-display"
                          style={{
                            color: 'rgba(248, 247, 244, 0.1)',
                            fontSize: 'clamp(4rem, 8vw, 6rem)',
                            userSelect: 'none',
                          }}
                        >
                          {product.name.charAt(0)}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ padding: '20px' }}>
                      <span
                        className="text-label"
                        style={{ color: '#D42B2B', marginBottom: '8px', display: 'block' }}
                      >
                        {product.category}
                      </span>
                      <h3
                        className="font-display"
                        style={{
                          fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
                          margin: '0 0 8px',
                          color: '#0C0C0C',
                          fontWeight: 700,
                        }}
                      >
                        {product.name}
                      </h3>
                      <p
                        style={{
                          color: '#6B6B6B',
                          fontSize: '14px',
                          lineHeight: 1.5,
                          margin: '0 0 16px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {product.description}
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span
                          className="font-display"
                          style={{ color: '#0C0C0C', fontSize: '16px', fontWeight: 700 }}
                        >
                          {formatXAF(product.price)}
                        </span>
                        <span
                          style={{
                            color: '#D42B2B',
                            fontSize: '13px',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          Acheter <IconArrowRight size={14} color="#D42B2B" />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <FooterSection />
      <WhatsAppButton phone="+237677000000" />
    </>
  )
}
