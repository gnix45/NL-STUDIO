import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { FooterSection } from '@/components/landing/FooterSection'
import { WhatsAppButton } from '@/components/WhatsAppButton'

import { CheckoutForm } from './CheckoutForm'
import { IconArrowLeft } from '@/components/icons'
import Link from 'next/link'

export const revalidate = 60

function formatXAF(amount: number) {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' XAF'
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let product
  try {
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from('products')
      .select('id, name, description, price, image_url, category')
      .eq('id', id)
      .eq('active', true)
      .single()

    if (error || !data) notFound()
    product = data
  } catch {
    notFound()
  }

  return (
    <>
      <Navbar />

      <main
        style={{
          minHeight: '100dvh',
          paddingTop: 'clamp(80px, 10vw, 100px)',
        }}
      >
        {/* Back link */}
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 clamp(24px, 5vw, 80px) 24px',
          }}
        >
          <Link
            href="/store"
            className="hover-underline"
            style={{
              color: '#6B6B6B',
              textDecoration: 'none',
              fontSize: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              minHeight: '44px',
            }}
          >
            <IconArrowLeft size={16} color="#6B6B6B" />
            Retour a la boutique
          </Link>
        </div>

        <div className="product-layout">
          {/* Left: Image */}
          <div
            style={{
              background: '#0C0C0C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 'clamp(250px, 40vw, 500px)',
              overflow: 'hidden',
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
                  color: 'rgba(248, 247, 244, 0.08)',
                  fontSize: 'clamp(6rem, 12vw, 12rem)',
                  userSelect: 'none',
                }}
              >
                {product.name.charAt(0)}
              </span>
            )}
          </div>

          {/* Right: Details + Checkout */}
          <div
            style={{
              padding: 'clamp(24px, 4vw, 48px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <span
              className="text-label"
              style={{ color: '#D42B2B', marginBottom: '12px', display: 'block' }}
            >
              {product.category}
            </span>

            <h1
              className="font-display text-display-sm"
              style={{ color: '#0C0C0C', margin: '0 0 16px' }}
            >
              {product.name}
            </h1>

            <p
              className="text-body-lg"
              style={{
                color: '#6B6B6B',
                margin: '0 0 24px',
                lineHeight: 1.7,
              }}
            >
              {product.description}
            </p>

            {/* Price divider */}
            <div
              style={{
                borderTop: '1px solid #EFEFEC',
                borderBottom: '1px solid #EFEFEC',
                padding: '16px 0',
                marginBottom: '32px',
              }}
            >
              <span
                className="font-display"
                style={{ color: '#0C0C0C', fontSize: 'clamp(1.25rem, 2vw, 1.75rem)' }}
              >
                {formatXAF(product.price)}
              </span>
            </div>

            {/* Checkout form */}
            <CheckoutForm
              productId={product.id}
              productName={product.name}
              price={product.price}
            />
          </div>
        </div>
      </main>

      <FooterSection />
      <WhatsAppButton phone="+237677000000" />
    </>
  )
}
