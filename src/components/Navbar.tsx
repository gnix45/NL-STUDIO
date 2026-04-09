'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { IconMenu, IconClose } from '@/components/icons'

const navLinks = [
  { label: 'Accueil', href: '/' },
  { label: 'A propos', href: '/#about' },
  { label: 'Travaux', href: '/#works' },
  { label: 'Contact', href: '/#contact' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
  }, [menuOpen])

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled ? 'rgba(12, 12, 12, 0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(8px)' : 'none',
        transition: 'background 0.3s ease, backdrop-filter 0.3s ease',
        paddingTop: 'env(safe-area-inset-top, 0)',
      }}
    >
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="font-display"
          style={{
            color: '#F8F7F4',
            textDecoration: 'none',
            fontSize: '20px',
            fontWeight: 800,
            letterSpacing: '-0.5px',
          }}
        >
          NL.studio
        </Link>

        {/* Desktop links */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover-underline"
              style={{
                color: '#F8F7F4',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 400,
                letterSpacing: '0.02em',
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/store"
            style={{
              background: '#D42B2B',
              color: '#F8F7F4',
              textDecoration: 'none',
              padding: '10px 24px',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.5px',
              transition: 'opacity 0.2s',
            }}
          >
            Boutique
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="mobile-nav-btn"
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px',
            minWidth: '44px',
            minHeight: '44px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {menuOpen ? (
            <IconClose size={24} color="#F8F7F4" />
          ) : (
            <IconMenu size={24} color="#F8F7F4" />
          )}
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(12, 12, 12, 0.98)',
            zIndex: 99,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '32px',
            paddingBottom: 'env(safe-area-inset-bottom, 0)',
          }}
        >
          {/* Close button in overlay */}
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Fermer le menu"
            style={{
              position: 'absolute',
              top: '20px',
              right: '24px',
              background: 'none',
              border: 'none',
              padding: '8px',
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 'env(safe-area-inset-top, 0)',
            }}
          >
            <IconClose size={28} color="#F8F7F4" />
          </button>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="font-display"
              style={{
                color: '#F8F7F4',
                textDecoration: 'none',
                fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/store"
            onClick={() => setMenuOpen(false)}
            style={{
              background: '#D42B2B',
              color: '#F8F7F4',
              textDecoration: 'none',
              padding: '14px 40px',
              fontSize: '16px',
              fontWeight: 600,
              marginTop: '16px',
            }}
          >
            Boutique
          </Link>
        </div>
      )}

    </header>
  )
}
