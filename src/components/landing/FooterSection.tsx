import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function FooterSection() {
  const supabase = createServiceRoleClient()
  const year = new Date().getFullYear()

  // Fetch social links and email
  const { data: pageContent } = await supabase
    .from('page_content')
    .select('section, key, value')
    .in('section', ['social', 'contact'])

  const getVal = (section: string, key: string, fallback: string) => {
    const item = pageContent?.find(c => c.section === section && c.key === key)
    return item ? item.value : fallback
  }

  const instagramLink = getVal('social', 'instagram', 'https://instagram.com/nl.studio')
  const facebookLink = getVal('social', 'facebook', 'https://facebook.com/nlstudio')
  const contactEmail = getVal('contact', 'email', 'nlstudio203@gmail.com')

  return (
    <footer
      style={{
        background: '#0C0C0C',
        borderTop: '1px solid rgba(248, 247, 244, 0.06)',
        padding: '64px clamp(24px, 5vw, 80px) 32px',
        paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 0))',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '48px',
          paddingBottom: '48px',
          borderBottom: '1px solid rgba(248, 247, 244, 0.06)',
        }}
      >
        {/* Brand Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Link
            href="/"
            className="font-display"
            style={{
              color: '#F8F7F4',
              textDecoration: 'none',
              fontSize: '24px',
              fontWeight: 800,
              letterSpacing: '-0.5px',
            }}
          >
            NL.studio
          </Link>
          <p style={{ color: '#6B6B6B', fontSize: '13px', maxWidth: '250px' }}>
            Studio de design graphique spécialisé en branding, direction artistique et solutions visuelles sur mesure.
          </p>
        </div>

        {/* Navigation Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ color: '#F8F7F4', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Navigation</span>
          <Link href="/#about" style={{ color: '#6B6B6B', textDecoration: 'none', fontSize: '13px', transition: 'color 0.2s' }}>A propos</Link>
          <Link href="/#works" style={{ color: '#6B6B6B', textDecoration: 'none', fontSize: '13px', transition: 'color 0.2s' }}>Travaux</Link>
          <Link href="/#contact" style={{ color: '#6B6B6B', textDecoration: 'none', fontSize: '13px', transition: 'color 0.2s' }}>Contact</Link>
          <Link href="/store" style={{ color: '#D42B2B', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>Boutique</Link>
        </div>

        {/* Admin & Store */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ color: '#F8F7F4', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Ressources</span>
          <Link href="/store" style={{ color: '#6B6B6B', textDecoration: 'none', fontSize: '13px', transition: 'color 0.2s' }}>Produits digitaux</Link>
          <Link href="/admin/login" style={{ color: '#6B6B6B', textDecoration: 'none', fontSize: '13px', transition: 'color 0.2s' }}>Espace admin</Link>
        </div>

        {/* Social Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ color: '#F8F7F4', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Réseaux sociaux</span>
          {instagramLink && <a href={instagramLink} target="_blank" rel="noopener noreferrer" style={{ color: '#6B6B6B', textDecoration: 'none', fontSize: '13px', transition: 'color 0.2s' }}>Instagram</a>}
          {facebookLink && <a href={facebookLink} target="_blank" rel="noopener noreferrer" style={{ color: '#6B6B6B', textDecoration: 'none', fontSize: '13px', transition: 'color 0.2s' }}>Facebook</a>}
          {contactEmail && <a href={`mailto:${contactEmail}`} style={{ color: '#6B6B6B', textDecoration: 'none', fontSize: '13px', transition: 'color 0.2s' }}>Email</a>}
        </div>
      </div>

      <div
        style={{
          maxWidth: '1200px',
          margin: '32px auto 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <span style={{ color: '#6B6B6B', fontSize: '12px' }}>
          &copy; {year} NL.studio. Tous droits réservés.
        </span>
        <span style={{ color: '#6B6B6B', fontSize: '12px' }}>
          Fait avec passion au Cameroun
        </span>
      </div>
    </footer>
  )
}
