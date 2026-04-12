'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { IconPlus, IconTrash, IconEdit, IconSpinner, IconSearch } from '@/components/icons'

interface ProductVariant {
  name: string
  price: number
}

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  product_link: string
  category: string
  active: boolean
  is_physical: boolean
  variants: ProductVariant[]
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
  const [isPhysical, setIsPhysical] = useState(false)
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
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
    setIsPhysical(false)
    setVariants([])
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
    setIsPhysical(product.is_physical ?? false)
    setVariants(product.variants || [])
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')

    const priceNum = parseInt(price, 10)
    if (isNaN(priceNum) || priceNum < 100) {
      setFormError('Le prix de base minimum est 100 XAF.')
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
      is_physical: isPhysical,
      variants,
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    setUploadingImage(true)
    const file = e.target.files[0]
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (res.ok && data.url) {
        setImageUrl(data.url)
      } else {
        alert(data.error || 'Echec du telechargement')
      }
    } catch (err) {
      console.error(err)
      alert('Erreur de connexion lors du telechargement')
    } finally {
      setUploadingImage(false)
    }
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

  const addVariant = () => {
    setVariants([...variants, { name: '', price: 1000 }])
  }

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
    const newVariants = [...variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setVariants(newVariants)
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
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
            overflowX: 'auto',
          }}
        >
          <h3 className="font-display" style={{ color: '#F8F7F4', fontSize: '16px', margin: '0 0 20px' }}>
            {editing ? 'Modifier le produit' : 'Nouveau produit'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                <label style={{ color: '#F8F7F4', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isPhysical}
                    onChange={(e) => setIsPhysical(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#D42B2B' }}
                  />
                  Ce produit necessite une livraison physique
                </label>
                
                <label style={{ color: '#F8F7F4', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#D42B2B' }}
                  />
                  Actif (visible en boutique)
                </label>
              </div>

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
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={variants.length > 0 ? "Prix de base / minimum (XAF)" : "Prix (XAF)"}
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#0C0C0C', padding: '12px', borderRadius: '4px', border: '1px solid #333' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ color: '#F8F7F4', fontSize: '13px' }}>Image du Produit :</label>
                  {uploadingImage && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6B6B6B', fontSize: '12px' }}><IconSpinner size={14} color="#D42B2B" /> Téléchargement...</div>}
                </div>
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  style={{ color: '#6B6B6B', fontSize: '13px' }}
                />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#6B6B6B', fontSize: '12px' }}>Ou collez une URL :</span>
                  <input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    style={{ flex: 1, padding: '8px 12px', background: '#1A1A1A', border: '1px solid #333', color: '#F8F7F4', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <input
                value={productLink}
                onChange={(e) => setProductLink(e.target.value)}
                placeholder={isPhysical ? "Lien (facture/preuve/document associe)" : "Lien de telechargement"}
                required
                style={{ padding: '10px 14px', background: '#0C0C0C', border: '1px solid #333', color: '#F8F7F4', fontSize: '14px', boxSizing: 'border-box' }}
              />

              {/* Variants Section */}
              <div style={{ background: '#0C0C0C', padding: '16px', borderRadius: '4px', border: '1px solid #333' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ color: '#F8F7F4', fontSize: '14px', fontWeight: 600 }}>Variantes (Optionnel)</span>
                  <button
                    type="button"
                    onClick={addVariant}
                    style={{ background: 'rgba(248,247,244,0.1)', border: 'none', color: '#F8F7F4', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', borderRadius: '4px' }}
                  >
                    + Ajouter variante
                  </button>
                </div>
                
                {variants.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {variants.map((v, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', alignItems: 'center' }}>
                        <input 
                          value={v.name}
                          onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                          placeholder="Nom (ex: Couleur Rouge, 100g)"
                          required
                          style={{ padding: '8px 12px', background: '#1A1A1A', border: '1px solid #333', color: '#F8F7F4', fontSize: '13px' }}
                        />
                        <input 
                          value={v.price}
                          type="number"
                          min="100"
                          onChange={(e) => updateVariant(idx, 'price', parseInt(e.target.value) || 0)}
                          placeholder="Prix (XAF)"
                          required
                          style={{ padding: '8px 12px', background: '#1A1A1A', border: '1px solid #333', color: '#F8F7F4', fontSize: '13px' }}
                        />
                        <button
                          type="button"
                          onClick={() => removeVariant(idx)}
                          style={{ background: 'none', border: 'none', color: '#D42B2B', cursor: 'pointer', padding: '8px' }}
                        >
                          <IconTrash size={16} color="#D42B2B" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#6B6B6B', fontSize: '13px', margin: 0 }}>Aucune variante specifiee.</p>
                )}
              </div>

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
      <div style={{ background: '#1A1A1A', overflowX: 'auto' }}>
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
                minWidth: 'min-content'
              }}
            >
              <div style={{ flex: 1, minWidth: 'min-content' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span style={{ color: '#F8F7F4', fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {product.name}
                  </span>
                  {product.is_physical && (
                    <span style={{ color: '#D42B2B', fontSize: '10px', background: 'rgba(212,43,43,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                      Pysi.
                    </span>
                  )}
                  {product.variants && product.variants.length > 0 && (
                    <span style={{ color: '#888', fontSize: '10px', background: 'rgba(248,247,244,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                      {product.variants.length} Var.
                    </span>
                  )}
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
