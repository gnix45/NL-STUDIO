'use client'

import { useState, useEffect } from 'react'
import { getWorks, createWork, updateWork, deleteWork } from './actions'
import { IconSpinner, IconPlus, IconTrash, IconEdit } from '@/components/icons'

// Add missing icon components if needed, or stick to what exists

export default function WorksAdminPage() {
  const [works, setWorks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingWork, setEditingWork] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchWorks = async () => {
    setLoading(true)
    try {
      const data = await getWorks()
      setWorks(data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchWorks()
  }, [])

  const handleOpenModal = (work: any | null = null) => {
    setEditingWork(work)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Etes-vous sur de vouloir supprimer ce projet ?')) return
    try {
      await deleteWork(id)
      await fetchWorks()
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la suppression')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const formData = new FormData(e.currentTarget)
    try {
      if (editingWork) {
        await updateWork(editingWork.id, formData)
      } else {
        await createWork(formData)
      }
      setIsModalOpen(false)
      await fetchWorks()
    } catch (err: any) {
      alert(err.message)
    }
    setSubmitting(false)
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="font-display" style={{ color: '#F8F7F4', fontSize: '24px', margin: 0 }}>
          Portfolio
        </h1>
        <button
          onClick={() => handleOpenModal()}
          style={{
            background: '#D42B2B',
            color: '#F8F7F4',
            border: 'none',
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Nouveau projet
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <IconSpinner size={32} color="#D42B2B" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {works.map((work) => (
            <div key={work.id} style={{ background: '#1A1A1A', border: '1px solid rgba(248, 247, 244, 0.1)', padding: '16px' }}>
              <div style={{ height: '150px', background: work.image_url ? `url(${work.image_url}) center/cover` : work.color, marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', ...(!work.image_url && { color: '#ffffff', fontSize: '2rem' }) }}>
                {!work.image_url && work.title.charAt(0)}
              </div>
              <h3 style={{ color: '#F8F7F4', margin: '0 0 4px', fontSize: '16px' }}>{work.title}</h3>
              <p style={{ color: '#6B6B6B', margin: '0 0 16px', fontSize: '13px' }}>{work.label}</p>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => handleOpenModal(work)}
                  style={{ background: 'transparent', border: '1px solid #6B6B6B', color: '#F8F7F4', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(work.id)}
                  style={{ background: 'transparent', border: '1px solid #D42B2B', color: '#D42B2B', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <form
            onSubmit={handleSubmit}
            style={{ background: '#1A1A1A', padding: '32px', width: '100%', maxWidth: '500px', border: '1px solid rgba(248, 247, 244, 0.1)', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <h2 style={{ color: '#F8F7F4', marginTop: 0, marginBottom: '24px' }}>
              {editingWork ? 'Modifier' : 'Nouveau'} Projet
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#6B6B6B', fontSize: '13px', marginBottom: '8px' }}>Titre</label>
                <input name="title" defaultValue={editingWork?.title} required style={{ width: '100%', padding: '12px', background: '#0C0C0C', color: '#FFF', border: '1px solid #333' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', color: '#6B6B6B', fontSize: '13px', marginBottom: '8px' }}>Label (ex: Branding, Web Design)</label>
                <input name="label" defaultValue={editingWork?.label} required style={{ width: '100%', padding: '12px', background: '#0C0C0C', color: '#FFF', border: '1px solid #333' }} />
              </div>

              <div>
                <label style={{ display: 'block', color: '#6B6B6B', fontSize: '13px', marginBottom: '8px' }}>Description</label>
                <textarea name="description" defaultValue={editingWork?.description} rows={3} style={{ width: '100%', padding: '12px', background: '#0C0C0C', color: '#FFF', border: '1px solid #333' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', color: '#6B6B6B', fontSize: '13px', marginBottom: '8px' }}>Image URL</label>
                <input name="image_url" defaultValue={editingWork?.image_url} placeholder="https://..." style={{ width: '100%', padding: '12px', background: '#0C0C0C', color: '#FFF', border: '1px solid #333' }} />
              </div>

              <div>
                <label style={{ display: 'block', color: '#6B6B6B', fontSize: '13px', marginBottom: '8px' }}>Fallback Color</label>
                <input name="color" type="color" defaultValue={editingWork?.color || '#1A1A1A'} style={{ width: '100%', height: '40px', background: '#0C0C0C', border: '1px solid #333' }} />
              </div>

              <div>
                <label style={{ display: 'block', color: '#6B6B6B', fontSize: '13px', marginBottom: '8px' }}>Ordre (0, 1, 2...)</label>
                <input name="order_index" type="number" defaultValue={editingWork?.order_index || 0} style={{ width: '100%', padding: '12px', background: '#0C0C0C', color: '#FFF', border: '1px solid #333' }} />
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid #6B6B6B', color: '#FFF', cursor: 'pointer' }}>
                  Annuler
                </button>
                <button type="submit" disabled={submitting} style={{ flex: 1, padding: '12px', background: '#D42B2B', border: 'none', color: '#FFF', cursor: 'pointer' }}>
                  {submitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
