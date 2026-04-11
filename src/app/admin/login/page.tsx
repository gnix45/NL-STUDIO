'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { IconSpinner } from '@/components/icons'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError('Identifiants invalides.')
        setLoading(false)
        return
      }

      // Notify asynchronously for admin security event tracking 
      fetch('/api/admin/notify-login', { method: 'POST' }).catch(() => {})

      router.push('/admin')
      router.refresh()
    } catch {
      setError('Erreur de connexion.')
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0C0C0C',
        padding: '24px',
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: '100%',
          maxWidth: '400px',
          background: '#1A1A1A',
          padding: '40px 32px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span
            className="font-display"
            style={{ color: '#F8F7F4', fontSize: '24px', fontWeight: 800 }}
          >
            NL.studio
          </span>
          <p style={{ color: '#6B6B6B', fontSize: '14px', marginTop: '8px' }}>
            Administration
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label
              htmlFor="admin-email"
              style={{ color: '#6B6B6B', fontSize: '13px', display: 'block', marginBottom: '6px' }}
            >
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #333',
                background: '#0C0C0C',
                color: '#F8F7F4',
                fontSize: '16px',
                outline: 'none',
                minHeight: '44px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              style={{ color: '#6B6B6B', fontSize: '13px', display: 'block', marginBottom: '6px' }}
            >
              Mot de passe
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #333',
                background: '#0C0C0C',
                color: '#F8F7F4',
                fontSize: '16px',
                outline: 'none',
                minHeight: '44px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <p style={{ color: '#D42B2B', fontSize: '13px', margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#D42B2B',
              color: '#F8F7F4',
              border: 'none',
              padding: '14px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {loading ? <IconSpinner size={18} color="#F8F7F4" /> : 'Connexion'}
          </button>
        </div>
      </form>
    </div>
  )
}
