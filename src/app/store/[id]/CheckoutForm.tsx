'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { IconSpinner, IconCheckCircle, IconXCircle } from '@/components/icons'
import { sanitizePhone, detectCarrier } from '@/lib/validation'

interface ProductVariant {
  name: string
  price: number
}

interface CheckoutFormProps {
  productId: string
  productName: string
  price: number
  isPhysical: boolean
  variants: ProductVariant[]
}

type FormState = 'form' | 'pending' | 'success' | 'error'

function formatXAF(amount: number) {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' XAF'
}

export function CheckoutForm({ productId, productName, price, isPhysical, variants }: CheckoutFormProps) {
  const [state, setState] = useState<FormState>('form')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [carrier, setCarrier] = useState<'mtn' | 'orange' | null>(null)
  const [transId, setTransId] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [pollCount, setPollCount] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<string>(variants.length > 0 ? variants[0].name : '')
  const [deliveryAddress, setDeliveryAddress] = useState('')

  // Compute the active price based on variant selection
  const activePrice = variants.length > 0
    ? (variants.find(v => v.name === selectedVariant)?.price ?? price)
    : price
  const fee = Math.ceil(activePrice * 0.03)
  const totalAmount = activePrice + fee

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

    if (isPhysical && deliveryAddress.trim().length < 5) {
      setErrorMsg("L'adresse de livraison est requise (minimum 5 caracteres).")
      setSubmitting(false)
      return
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          whatsapp,
          productId,
          variantName: variants.length > 0 ? selectedVariant : undefined,
          deliveryAddress: isPhysical ? deliveryAddress : undefined,
        }),
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

        {/* Variant selector */}
        {variants.length > 0 && (
          <div>
            <label
              htmlFor="checkout-variant"
              style={{ color: '#6B6B6B', fontSize: '13px', display: 'block', marginBottom: '6px' }}
            >
              Choisir une variante
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {variants.map((v) => (
                <button
                  key={v.name}
                  type="button"
                  onClick={() => setSelectedVariant(v.name)}
                  style={{
                    padding: '10px 16px',
                    border: selectedVariant === v.name ? '2px solid #D42B2B' : '1px solid #EFEFEC',
                    background: selectedVariant === v.name ? 'rgba(212,43,43,0.05)' : '#FFFFFF',
                    color: '#0C0C0C',
                    fontSize: '14px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    transition: 'all 0.2s',
                    minHeight: '44px',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{v.name}</span>
                  <span style={{ display: 'block', fontSize: '12px', color: '#6B6B6B', marginTop: '2px' }}>
                    {formatXAF(v.price)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

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

        <div>
          <label
            htmlFor="checkout-whatsapp"
            style={{ color: '#6B6B6B', fontSize: '13px', display: 'block', marginBottom: '6px' }}
          >
            Numero WhatsApp <span style={{ color: '#D42B2B' }}>*</span>
          </label>
          <input
            id="checkout-whatsapp"
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            required
            minLength={8}
            placeholder="Ex: 6XX XXX XXX"
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

        {/* Delivery address for physical products */}
        {isPhysical && (
          <div>
            <label
              htmlFor="checkout-address"
              style={{ color: '#6B6B6B', fontSize: '13px', display: 'block', marginBottom: '6px' }}
            >
              Adresse de livraison <span style={{ color: '#D42B2B' }}>*</span>
            </label>
            <textarea
              id="checkout-address"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              required
              minLength={5}
              rows={3}
              placeholder="Ville, quartier, repere..."
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #EFEFEC',
                background: '#FFFFFF',
                fontSize: '16px',
                color: '#0C0C0C',
                outline: 'none',
                transition: 'border-color 0.2s',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        {errorMsg && (
          <p style={{ color: '#D42B2B', fontSize: '13px', margin: 0 }}>{errorMsg}</p>
        )}

        <div style={{ marginTop: '8px', padding: '16px', background: '#F8F7F4', border: '1px solid #EFEFEC' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#6B6B6B' }}>
            <span>Prix{selectedVariant ? ` (${selectedVariant})` : ''}</span>
            <span>{formatXAF(activePrice)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#6B6B6B' }}>
            <span>Frais (3%)</span>
            <span>{formatXAF(fee)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 600, color: '#0C0C0C', borderTop: '1px solid #EFEFEC', paddingTop: '8px' }}>
            <span>Total</span>
            <span>{formatXAF(totalAmount)}</span>
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
            `Payer ${formatXAF(totalAmount)}`
          )}
        </button>
      </div>
    </form>
  )
}
