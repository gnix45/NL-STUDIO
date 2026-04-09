'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { IconSpinner, IconEdit } from '@/components/icons'

interface ContentRow {
  id: string
  section: string
  key: string
  value: string
}

export default function AdminContentPage() {
  const [rows, setRows] = useState<ContentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchContent = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('page_content')
      .select('*')
      .order('section')
      .order('key')
    setRows(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  const handleSave = async (row: ContentRow) => {
    setSaving(true)
    try {
      await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          section: row.section,
          key: row.key,
          value: editValue,
        }),
      })
      setEditingId(null)
      fetchContent()
    } catch {
      // silently fail
    }
    setSaving(false)
  }

  // Group by section
  const sections: Record<string, ContentRow[]> = {}
  rows.forEach((r) => {
    if (!sections[r.section]) sections[r.section] = []
    sections[r.section].push(r)
  })

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <IconSpinner size={32} color="#D42B2B" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-display" style={{ color: '#F8F7F4', fontSize: '20px', margin: '0 0 24px' }}>
        Gestion du contenu
      </h1>

      {Object.keys(sections).length === 0 ? (
        <p style={{ color: '#6B6B6B', fontSize: '14px' }}>
          Aucun contenu configure. Les valeurs par defaut seront utilisees.
        </p>
      ) : (
        Object.entries(sections).map(([section, items]) => (
          <div key={section} style={{ marginBottom: '24px' }}>
            <h2
              className="text-label"
              style={{ color: '#D42B2B', marginBottom: '12px' }}
            >
              {section.toUpperCase()}
            </h2>
            <div style={{ background: '#1A1A1A' }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid rgba(248,247,244,0.04)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ color: '#6B6B6B', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                        {item.key}
                      </span>
                      {editingId === item.id ? (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            rows={2}
                            style={{
                              flex: 1,
                              minWidth: '200px',
                              padding: '8px 12px',
                              background: '#0C0C0C',
                              border: '1px solid #333',
                              color: '#F8F7F4',
                              fontSize: '14px',
                              resize: 'vertical',
                            }}
                          />
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-start' }}>
                            <button
                              onClick={() => handleSave(item)}
                              disabled={saving}
                              style={{
                                background: '#D42B2B',
                                color: '#F8F7F4',
                                border: 'none',
                                padding: '8px 16px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                minHeight: '36px',
                              }}
                            >
                              {saving ? <IconSpinner size={14} color="#F8F7F4" /> : 'Sauver'}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              style={{
                                background: 'transparent',
                                color: '#6B6B6B',
                                border: '1px solid #333',
                                padding: '8px 12px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                minHeight: '36px',
                              }}
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#F8F7F4', fontSize: '14px', wordBreak: 'break-word' }}>
                          {item.value}
                        </span>
                      )}
                    </div>
                    {editingId !== item.id && (
                      <button
                        onClick={() => { setEditingId(item.id); setEditValue(item.value) }}
                        aria-label="Modifier"
                        style={{
                          background: 'rgba(248,247,244,0.05)',
                          border: 'none',
                          padding: '8px',
                          cursor: 'pointer',
                          minWidth: '36px',
                          minHeight: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <IconEdit size={14} color="#6B6B6B" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
