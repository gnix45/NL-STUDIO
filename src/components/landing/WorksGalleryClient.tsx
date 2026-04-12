'use client'

import Link from 'next/link'

interface Work {
  id?: string
  title: string
  label: string
  description?: string
  color: string
  image_url: string | null
}

export function WorksGalleryClient({ works }: { works: Work[] }) {
  // Parse images if stored as a comma-separated string
  const getImages = (urlStr: string | null) => {
    if (!urlStr) return []
    return urlStr.split(',').map(u => u.trim()).filter(Boolean)
  }

  return (
    <div className="works-grid">
      {works.map((work, i) => {
        const images = getImages(work.image_url)
        const firstImage = images.length > 0 ? images[0] : null
        
        // Navigation destination
        const destination = work.id ? `/portfolio/${work.id}` : '#works'

        return (
          <Link
            key={i}
            href={destination}
            className="img-overlay"
            style={{
              aspectRatio: i < 2 ? '4/3' : i < 4 ? '1/1' : '4/3',
              backgroundImage: firstImage ? `url("${firstImage}")` : 'none',
              backgroundColor: work.color,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              textDecoration: 'none',
            }}
          >
            {/* Fallback pattern */}
            {!firstImage && (
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
                  display: 'block'
                }}
              >
                {work.title}
              </span>
              {images.length > 1 && (
                <span style={{color: '#F8F7F4', fontSize: '12px', marginTop: '8px', display: 'block'}}>View {images.length} photos</span>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
