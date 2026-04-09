'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { IconSpinner, IconCheckCircle, IconXCircle } from '@/components/icons'
import { sanitizePhone, detectCarrier } from '@/lib/validation'

interface CheckoutFormProps {
  productId: string
  productName: string
  price: number
}

type FormState = 'form' | 'pending' | 'success' | 'error'

function formatXAF(amount: number) {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' XAF'
}

export function CheckoutForm({ productId, productName, price }: CheckoutFormProps) {
  const [state, setState] = useState<FormState>('form')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [carrier, setCarrier] = useState<'mtn' | 'orange' | null>(null)
  const [transId, setTransId] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [pollCount, setPollCount] = useState(0)

  // Auto-detect carrier on phone input
  useEffect(() => {
    const cleaned = sanitizePhone(phone)
    if (cleaned.length >= 3) {
      setCarrier(detectCarrier(cleaned))
    } else {
      setCarrier(null)
    }
  }, [phone])

  // Submit checkout
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ name, email, phone, productId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || 'Erreur lors du paiement.')
        setSubmitting(false)
        return
      }

      setTransId(data.transId)
      setState('pending')
      setPollCount(0)
    } catch {
      setErrorMsg('Erreur de connexion. Veuillez reessayer.')
    }
    setSubmitting(false)
  }

  // Poll payment status
  const pollStatus = useCallback(async () => {
    if (!transId || state !== 'pending') return

    try {
      const res = await fetch(`/api/payment-status/${transId}`, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      })
      const data = await res.json()

      if (data.status === 'SUCCESSFUL') {
        setState('success')
        return
      }
      if (data.status === 'FAILED') {
        setState('error')
        setErrorMsg('Le paiement a echoue. Veuillez reessayer.')
        return
      }

      // Still pending
      setPollCount((prev) => prev + 1)
    } catch {
      // Network error, keep polling
      setPollCount((prev) => prev + 1)
    }
  }, [transId, state])

  useEffect(() => {
    if (state !== 'pending' || !transId) return

    // Max 60 polls (5 minutes)
    if (pollCount >= 60) {
      setState('error')
      setErrorMsg('Delai d\'attente depasse. Verifiez votre telephone ou contactez-nous.')
      return
    }

    const timer = setTimeout(pollStatus, 5000)
    return () => clearTimeout(timer)
  }, [state, transId, pollCount, pollStatus])

  if (state === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <IconCheckCircle size={48} color="#25D366" />
        <h3
          className="font-display"
          style={{ color: '#0C0C0C', margin: '16px 0 8px', fontSize: '1.25rem' }}
        >
          Paiement confirme
        </h3>
        <p style={{ color: '#6B6B6B', fontSize: '14px', marginBottom: '24px' }}>
          Consultez votre email pour acceder a votre produit.
        </p>
        <Link
          href="/admin"
          style={{
            display: 'inline-block',
            background: '#0C0C0C',
            color: '#F8F7F4',
            textDecoration: 'none',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 600,
            marginTop: '8px',
          }}
        >
          Aller au Tableau de bord
        </Link>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <IconXCircle size={48} color="#D42B2B" />
        <h3
          className="font-display"
          style={{ color: '#0C0C0C', margin: '16px 0 8px', fontSize: '1.25rem' }}
        >
          Paiement echoue
        </h3>
        <p style={{ color: '#6B6B6B', fontSize: '14px', marginBottom: '24px' }}>
          {errorMsg}
        </p>
        <button
          onClick={() => {
            setState('form')
            setErrorMsg('')
            setTransId('')
            setPollCount(0)
          }}
          style={{
            background: '#0C0C0C',
            color: '#F8F7F4',
            border: 'none',
            padding: '14px 32px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            minHeight: '44px',
          }}
        >
          Reessayer
        </button>
      </div>
    )
  }

  if (state === 'pending') {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <IconSpinner size={40} color="#D42B2B" />
        <h3
          className="font-display"
          style={{ color: '#0C0C0C', margin: '16px 0 8px', fontSize: '1.25rem' }}
        >
          En attente de paiement
        </h3>
        <p style={{ color: '#6B6B6B', fontSize: '14px', maxWidth: '350px', margin: '0 auto' }}>
          Verifiez votre telephone et confirmez le paiement {carrier === 'mtn' ? 'Mobile Money' : 'Orange Money'}.
        </p>
        <p style={{ color: '#6B6B6B', fontSize: '12px', marginTop: '16px' }}>
          Verification en cours... ({pollCount}/60)
        </p>
      </div>
    )
  }

  // Form state
  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label
            htmlFor="checkout-name"
            style={{ color: '#6B6B6B', fontSize: '13px', display: 'block', marginBottom: '6px' }}
          >
            Nom complet
          </label>
          <input
            id="checkout-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            placeholder="Votre nom"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #EFEFEC',
              background: '#FFFFFF',
              fontSize: '16px',
              color: '#0C0C0C',
              outline: 'none',
              transition: 'border-color 0.2s',
              minHeight: '44px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label
            htmlFor="checkout-email"
            style={{ color: '#6B6B6B', fontSize: '13px', display: 'block', marginBottom: '6px' }}
          >
            Email
          </label>
          <input
            id="checkout-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="votre@email.com"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #EFEFEC',
              background: '#FFFFFF',
              fontSize: '16px',
              color: '#0C0C0C',
              outline: 'none',
              transition: 'border-color 0.2s',
              minHeight: '44px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label
            htmlFor="checkout-phone"
            style={{ color: '#6B6B6B', fontSize: '13px', display: 'block', marginBottom: '6px' }}
          >
            Telephone
          </label>
          <input
            id="checkout-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="6XX XXX XXX"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #EFEFEC',
              background: '#FFFFFF',
              fontSize: '16px',
              color: '#0C0C0C',
              outline: 'none',
              transition: 'border-color 0.2s',
              minHeight: '44px',
              boxSizing: 'border-box',
            }}
          />
          {carrier && (
            <span
              style={{
                fontSize: '12px',
                color: carrier === 'mtn' ? '#FFCC00' : '#FF6600',
                marginTop: '4px',
                display: 'block',
                fontWeight: 500,
              }}
            >
              {carrier === 'mtn' ? 'MTN Mobile Money' : 'Orange Money'}
            </span>
          )}
        </div>

        {errorMsg && (
          <p style={{ color: '#D42B2B', fontSize: '13px', margin: 0 }}>{errorMsg}</p>
        )}

        <div style={{ marginTop: '8px', padding: '16px', background: '#F8F7F4', border: '1px solid #EFEFEC' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#6B6B6B' }}>
            <span>Prix (Net)</span>
            <span>{formatXAF(price)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#6B6B6B' }}>
            <span>Frais (3%)</span>
            <span>{formatXAF(Math.ceil(price * 0.03))}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 600, color: '#0C0C0C', borderTop: '1px solid #EFEFEC', paddingTop: '8px' }}>
            <span>Total</span>
            <span>{formatXAF(Math.ceil(price * 1.03))}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            background: '#D42B2B',
            color: '#F8F7F4',
            border: 'none',
            padding: '16px 24px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1,
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            transition: 'opacity 0.2s',
          }}
        >
          {submitting ? (
            <IconSpinner size={18} color="#F8F7F4" />
          ) : (
            `Payer ${formatXAF(Math.ceil(price * 1.05))}`
          )}
        </button>
      </div>
    </form>
  )
}
