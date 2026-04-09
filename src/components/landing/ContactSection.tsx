import { IconInstagram, IconBehance, IconMail } from '@/components/icons'

interface ContactProps {
  content: Record<string, string>
}

export function ContactSection({ content }: ContactProps) {
  const c = content
  const whatsappUrl = `https://wa.me/${(c.whatsapp || '+237677000000').replace(/[^0-9]/g, '')}`

  return (
    <section
      id="contact"
      style={{
        background: '#0C0C0C',
        padding: 'clamp(60px, 8vw, 120px) clamp(24px, 5vw, 80px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* TALK watermark */}
      <span
        className="font-display"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 'clamp(8rem, 20vw, 25rem)',
          color: '#F8F7F4',
          opacity: 0.03,
          pointerEvents: 'none',
          userSelect: 'none',
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
      >
        TALK
      </span>

      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <span
          className="text-label"
          style={{ color: '#D42B2B', display: 'block', marginBottom: '16px' }}
        >
          CONTACT
        </span>

        <h2
          className="font-display text-display-lg"
          style={{ color: '#F8F7F4', margin: '0 0 24px' }}
        >
          {c.title || 'Discutons de votre projet'}
        </h2>

        <p
          className="text-body-lg"
          style={{
            color: '#6B6B6B',
            maxWidth: '500px',
            margin: '0 auto 40px',
          }}
        >
          Pret a donner vie a votre vision? Contactez-moi pour en discuter.
        </p>

        {/* WhatsApp CTA */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background: '#25D366',
            color: '#FFFFFF',
            padding: '16px 36px',
            fontSize: '15px',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'opacity 0.2s',
            minHeight: '44px',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFFFFF">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Discuter sur WhatsApp
        </a>

        {/* Social links row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            marginTop: '48px',
          }}
        >
          <a
            href={c.instagram || 'https://instagram.com/nl.studio'}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hover-underline"
            style={{
              color: '#6B6B6B',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              minWidth: '44px',
              minHeight: '44px',
              transition: 'color 0.2s',
            }}
          >
            <IconInstagram size={18} color="#6B6B6B" />
            Instagram
          </a>

          <a
            href={c.behance || 'https://behance.net/nlstudio'}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Behance"
            className="hover-underline"
            style={{
              color: '#6B6B6B',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              minWidth: '44px',
              minHeight: '44px',
              transition: 'color 0.2s',
            }}
          >
            <IconBehance size={18} color="#6B6B6B" />
            Behance
          </a>

          <a
            href={`mailto:${c.email || 'tectrib@gmail.com'}`}
            aria-label="Email"
            className="hover-underline"
            style={{
              color: '#6B6B6B',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              minWidth: '44px',
              minHeight: '44px',
              transition: 'color 0.2s',
            }}
          >
            <IconMail size={18} color="#6B6B6B" />
            Email
          </a>
        </div>
      </div>
    </section>
  )
}
