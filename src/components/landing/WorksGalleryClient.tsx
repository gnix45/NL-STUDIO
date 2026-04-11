'use client'

import { useState } from 'react'

interface Work {
  title: string
  label: string
  color: string
  image_url: string | null
}

export function WorksGalleryClient({ works }: { works: Work[] }) {
  const [selectedWork, setSelectedWork] = useState<Work | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handleOpen = (work: Work) => {
    setSelectedWork(work)
    setCurrentImageIndex(0)
  }

  const handleClose = () => {
    setSelectedWork(null)
    setCurrentImageIndex(0)
  }

  // Parse images if stored as a comma-separated string
  const getImages = (urlStr: string | null) => {
    if (!urlStr) return []
    return urlStr.split(',').map(u => u.trim()).filter(Boolean)
  }

  const handleNext = (e: React.MouseEvent, imagesLength: number) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % imagesLength)
  }

  const handlePrev = (e: React.MouseEvent, imagesLength: number) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + imagesLength) % imagesLength)
  }

  return (
    <>
      <div className="works-grid">
        {works.map((work, i) => {
          const images = getImages(work.image_url)
          const firstImage = images.length > 0 ? images[0] : null

          return (
            <div
              key={i}
              className="img-overlay"
              onClick={() => handleOpen(work)}
              style={{
                aspectRatio: i < 2 ? '4/3' : i < 4 ? '1/1' : '4/3',
                background: firstImage ? `url(${firstImage}) center/cover` : work.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
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
                  }}
                >
                  {work.title}
                </span>
                {images.length > 1 && (
                  <span style={{color: '#F8F7F4', fontSize: '12px', marginTop: '8px'}}>View {images.length} photos</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Lightbox / Gallery Modal */}
      {selectedWork && (
        <div
          onClick={handleClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div style={{ position: 'absolute', top: 24, right: 24 }}>
            <button
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#FFF',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '8px',
              }}
            >
              Fermer (X)
            </button>
          </div>

          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '1200px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {getImages(selectedWork.image_url).length > 0 ? (
              <>
                <img
                  src={getImages(selectedWork.image_url)[currentImageIndex]}
                  alt={selectedWork.title}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '80vh',
                    objectFit: 'contain',
                  }}
                />
                
                {/* Navigation Controls */}
                {getImages(selectedWork.image_url).length > 1 && (
                  <>
                    <button
                      onClick={(e) => handleNext(e, getImages(selectedWork.image_url).length)}
                      style={{
                        position: 'absolute',
                        right: '-2rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: '#D42B2B',
                        border: 'none',
                        color: '#FFF',
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        fontSize: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      &#8594;
                    </button>
                    <button
                      onClick={(e) => handlePrev(e, getImages(selectedWork.image_url).length)}
                      style={{
                        position: 'absolute',
                        left: '-2rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: '#D42B2B',
                        border: 'none',
                        color: '#FFF',
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        fontSize: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      &#8592;
                    </button>
                    <div style={{ color: '#FFF', marginTop: '16px', fontSize: '14px' }}>
                      {currentImageIndex + 1} / {getImages(selectedWork.image_url).length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div style={{ color: '#FFF', fontSize: '24px' }}>{selectedWork.title} (Aucune image)</div>
            )}
            
            <div style={{ color: '#F8F7F4', marginTop: '16px', textAlign: 'center' }}>
              <h3 className="font-display" style={{ margin: '0 0 4px', fontSize: '24px' }}>{selectedWork.title}</h3>
              <p style={{ color: '#D42B2B', margin: 0, fontSize: '14px' }}>{selectedWork.label}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
