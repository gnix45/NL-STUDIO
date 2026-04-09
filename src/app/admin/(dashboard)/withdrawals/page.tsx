'use client'

import { useState, useEffect } from 'react'
import { getWithdrawalData, requestWithdrawal } from './actions'
import { IconSpinner, IconRefresh, IconCheckCircle, IconXCircle, IconClock } from '@/components/icons'

function formatXAF(amount: number) {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' XAF'
}

export default function WithdrawalsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getWithdrawalData()
      setData(res)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')
    const formData = new FormData(e.currentTarget)
    try {
      await requestWithdrawal(formData)
      alert("Retrait traite avec succes !")
      // Reset form
      e.currentTarget.reset()
      await loadData()
    } catch (err: any) {
      setErrorMsg(err.message)
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
        <IconSpinner size={32} color="#D42B2B" />
      </div>
    )
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 className="font-display" style={{ color: '#F8F7F4', fontSize: '24px', margin: 0 }}>
          Retraits Fapshi
        </h1>
        <button
          onClick={loadData}
          style={{ background: 'transparent', border: '1px solid rgba(248, 247, 244, 0.2)', padding: '8px', color: '#F8F7F4', cursor: 'pointer', borderRadius: '4px' }}
        >
          <IconRefresh size={18} />
        </button>
      </div>

      {/* Balances */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#1A1A1A', border: '1px solid rgba(248, 247, 244, 0.06)', padding: '24px' }}>
          <span style={{ color: '#6B6B6B', fontSize: '12px', display: 'block', marginBottom: '8px' }}>SOLDE DISPONIBLE</span>
          <span className="font-display" style={{ color: '#F8F7F4', fontSize: '32px', fontWeight: 600 }}>{formatXAF(data?.availableBalance || 0)}</span>
        </div>
        <div style={{ background: '#0C0C0C', border: '1px solid rgba(248, 247, 244, 0.06)', padding: '24px' }}>
          <span style={{ color: '#6B6B6B', fontSize: '12px', display: 'block', marginBottom: '8px' }}>REVENU BRUT TOTAL</span>
          <span className="font-display" style={{ color: '#F8F7F4', fontSize: '24px', fontWeight: 600 }}>{formatXAF(data?.grossRevenue || 0)}</span>
        </div>
      </div>

      {/* Withdrawal Form */}
      <div style={{ background: '#1A1A1A', border: '1px solid rgba(248, 247, 244, 0.06)', padding: '24px', marginBottom: '32px' }}>
        <h2 style={{ color: '#F8F7F4', fontSize: '16px', marginTop: 0, marginBottom: '24px' }}>Demander un retrait</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: '#6B6B6B', fontSize: '13px', marginBottom: '8px' }}>Montant a retirer (XAF)</label>
              <input 
                name="amount" 
                type="number" 
                required 
                max={data?.availableBalance} 
                style={{ width: '100%', padding: '12px', background: '#0C0C0C', color: '#FFF', border: '1px solid #333' }} 
              />
              <span style={{ color: '#6B6B6B', fontSize: '12px', marginTop: '4px', display: 'block' }}>Frais de 2% applicables.</span>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: '#6B6B6B', fontSize: '13px', marginBottom: '8px' }}>Numero de reception (Mobile Money / Orange Money)</label>
              <input 
                name="phone" 
                type="tel" 
                required 
                placeholder="6XX XXX XXX"
                style={{ width: '100%', padding: '12px', background: '#0C0C0C', color: '#FFF', border: '1px solid #333' }} 
              />
            </div>
          </div>

          {errorMsg && <p style={{ color: '#D42B2B', fontSize: '13px', margin: 0 }}>{errorMsg}</p>}

          <button 
            type="submit" 
            disabled={submitting || data?.availableBalance <= 0}
            style={{
              background: '#D42B2B',
              color: '#F8F7F4',
              border: 'none',
              padding: '14px 24px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: submitting || (data?.availableBalance <= 0) ? 'not-allowed' : 'pointer',
              opacity: submitting || (data?.availableBalance <= 0) ? 0.7 : 1,
              marginTop: '8px'
            }}
          >
            {submitting ? 'Traitement en cours...' : 'Initier le retrait'}
          </button>
        </form>
      </div>

      {/* History */}
      <div>
        <h2 style={{ color: '#F8F7F4', fontSize: '16px', marginTop: 0, marginBottom: '16px' }}>Historique des retraits</h2>
        {data?.history?.length === 0 ? (
          <p style={{ color: '#6B6B6B', fontSize: '14px' }}>Aucun retrait pour le moment.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data?.history?.map((w: any) => (
              <div key={w.created_at} style={{ background: '#0C0C0C', border: '1px solid rgba(248, 247, 244, 0.06)', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ color: '#F8F7F4', fontSize: '15px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    {formatXAF(w.amount)}
                  </span>
                  <span style={{ color: '#6B6B6B', fontSize: '12px' }}>
                    Net: {formatXAF(w.net_amount)} | Frais: {formatXAF(w.fee)} | Tel: {w.phone}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {w.status === 'successful' && <><IconCheckCircle size={16} color="#25D366"/><span style={{ color: '#25D366', fontSize: '12px' }}>Succes</span></>}
                  {w.status === 'pending' && <><IconClock size={16} color="#FFCC00"/><span style={{ color: '#FFCC00', fontSize: '12px' }}>En attente</span></>}
                  {w.status === 'failed' && <><IconXCircle size={16} color="#D42B2B"/><span style={{ color: '#D42B2B', fontSize: '12px' }}>Echoue</span></>}
                  <span style={{ color: '#6B6B6B', fontSize: '11px', marginLeft: '12px' }}>
                    {new Date(w.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
