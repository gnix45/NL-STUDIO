'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { IconPlus, IconTrash, IconEdit, IconSpinner, IconSearch } from '@/components/icons'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  product_link: string
  category: string
  active: boolean
  created_at: string
}

function formatXAF(amount: number) {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' XAF'
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [search, setSearch] = useState('')

  // Form fields
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [productLink, setProductLink] = useState('')
  const [category, setCategory] = useState('Digital')
  const [active, setActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const fetchProducts = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const resetForm = () => {
    setName('')
    setDescription('')
    setPrice('')
    setImageUrl('')
    setProductLink('')
    setCategory('Digital')
    setActive(true)
    setEditing(null)
    setShowForm(false)
    setFormError('')
  }

  const startEdit = (product: Product) => {
    setEditing(product)
    setName(product.name)
    setDescription(product.description || '')
    setPrice(String(product.price))
    setImageUrl(product.image_url || '')
    setProductLink(product.product_link)
    setCategory(product.category)
    setActive(product.active)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')

    const priceNum = parseInt(price, 10)
    if (isNaN(priceNum) || priceNum < 100) {
      setFormError('Le prix minimum est 100 XAF.')
      setSaving(false)
      return
    }

    const payload = {
      name,
      description: description || null,
      price: priceNum,
      image_url: imageUrl || null,
      product_link: productLink,
      category,
      active,
    }

    try {
      const res = await fetch('/api/admin/products', {
        method: editing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(editing ? { ...payload, id: editing.id } : payload),
      })

      if (!res.ok) {
        const data = await res.json()
        setFormError(data.error || 'Erreur.')
        setSaving(false)
        return
      }

      resetForm()
      fetchProducts()
    } catch {
      setFormError('Erreur de connexion.')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return

    await fetch('/api/admin/products', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({ id }),
    })
    fetchProducts()
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <IconSpinner size={32} color="#D42B2B" />
      </div>
    )
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <h1 className="font-display" style={{ color: '#F8F7F4', fontSize: '20px', margin: 0 }}>
          Produits
        </h1>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          style={{
            background: '#D42B2B',
            color: '#F8F7F4',
            border: 'none',
            padding: '10px 20px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            minHeight: '44px',
          }}
        >
          <IconPlus size={16} color="#F8F7F4" />
          Ajouter
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '16px', position: 'relative' }}>
        <IconSearch
          size={16}
          color="#6B6B6B"
          className=""
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher..."
          style={{
            width: '100%',
            padding: '10px 16px 10px 36px',
            background: '#1A1A1A',
            border: '1px solid rgba(248,247,244,0.06)',
            color: '#F8F7F4',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Product form modal */}
      {showForm && (
        <div
          style={{
            background: '#1A1A1A',
            padding: '24px',
            marginBottom: '24px',
            border: '1px solid rgba(248,247,244,0.06)',
          }}
        >
          <h3 className="font-display" style={{ color: '#F8F7F4', fontSize: '16px', margin: '0 0 20px' }}>
            {editing ? 'Modifier le produit' : 'Nouveau produit'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nom du produit"
                required
                style={{ padding: '10px 14px', background: '#0C0C0C', border: '1px solid #333', color: '#F8F7F4', fontSize: '14px', boxSizing: 'border-box' }}
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                rows={3}
                style={{ padding: '10px 14px', background: '#0C0C0C', border: '1px solid #333', color: '#F8F7F4', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Prix (XAF)"
                  type="number"
                  min="100"
                  required
                  style={{ padding: '10px 14px', background: '#0C0C0C', border: '1px solid #333', color: '#F8F7F4', fontSize: '14px', boxSizing: 'border-box' }}
                />
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Categorie"
                  style={{ padding: '10px 14px', background: '#0C0C0C', border: '1px solid #333', color: '#F8F7F4', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="URL de l'image (optionnel)"
                style={{ padding: '10px 14px', background: '#0C0C0C', border: '1px solid #333', color: '#F8F7F4', fontSize: '14px', boxSizing: 'border-box' }}
              />
              <input
                value={productLink}
                onChange={(e) => setProductLink(e.target.value)}
                placeholder="Lien de telechargement"
                required
                style={{ padding: '10px 14px', background: '#0C0C0C', border: '1px solid #333', color: '#F8F7F4', fontSize: '14px', boxSizing: 'border-box' }}
              />
              <label style={{ color: '#6B6B6B', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                Actif (visible en boutique)
              </label>
              {formError && <p style={{ color: '#D42B2B', fontSize: '13px', margin: 0 }}>{formError}</p>}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    background: '#D42B2B',
                    color: '#F8F7F4',
                    border: 'none',
                    padding: '10px 24px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {saving ? <IconSpinner size={16} color="#F8F7F4" /> : (editing ? 'Mettre a jour' : 'Creer')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    background: 'transparent',
                    color: '#6B6B6B',
                    border: '1px solid #333',
                    padding: '10px 24px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    minHeight: '44px',
                  }}
                >
                  Annuler
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Product list */}
      <div style={{ background: '#1A1A1A' }}>
        {filtered.length === 0 ? (
          <p style={{ color: '#6B6B6B', padding: '32px', textAlign: 'center', fontSize: '14px' }}>
            Aucun produit trouve.
          </p>
        ) : (
          filtered.map((product) => (
            <div
              key={product.id}
              style={{
                padding: '16px',
                borderBottom: '1px solid rgba(248,247,244,0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ color: '#F8F7F4', fontSize: '14px', fontWeight: 500 }}>
                    {product.name}
                  </span>
                  {!product.active && (
                    <span style={{ color: '#6B6B6B', fontSize: '11px', border: '1px solid #333', padding: '1px 6px' }}>
                      Inactif
                    </span>
                  )}
                </div>
                <span style={{ color: '#6B6B6B', fontSize: '12px' }}>
                  {product.category} -- {formatXAF(product.price)}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => startEdit(product)}
                  aria-label="Modifier"
                  style={{
                    background: 'rgba(248,247,244,0.05)',
                    border: 'none',
                    padding: '8px',
                    cursor: 'pointer',
                    minWidth: '44px',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconEdit size={16} color="#6B6B6B" />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  aria-label="Supprimer"
                  style={{
                    background: 'rgba(212,43,43,0.1)',
                    border: 'none',
                    padding: '8px',
                    cursor: 'pointer',
                    minWidth: '44px',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconTrash size={16} color="#D42B2B" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
