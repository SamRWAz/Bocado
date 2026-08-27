import { Camera, Minus, Plus, Users } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { canSell, useAuth } from '../context/AuthContext'
import {
  fetchProducts,
  incrementMetric,
  insertProduct,
  updateProduct,
  uploadProductImage,
} from '../lib/api'
import { CATEGORIES, inputClass } from '../lib/constants'
import { encodeSeller, money, ownsListing } from '../lib/format'
import type { Product } from '../types'

export function SellPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [category, setCategory] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  const refresh = useCallback(async () => {
    setProducts(await fetchProducts())
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  if (!user || !canSell(user.role)) {
    return <p className="text-sm text-muted-foreground">Tu cuenta no tiene rol de vendedor. Cámbialo en Cuenta.</p>
  }

  const mine = products.filter((p) => ownsListing(p.seller, user.id, user.name))

  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0]
    if (!next) return
    setFile(next)
    setPreview(URL.createObjectURL(next))
  }

  const publish = async () => {
    if (!name.trim() || !price || !stock || !category) return
    setUploading(true)
    setError('')
    try {
      let imageUrl: string | null = null
      if (file) imageUrl = await uploadProductImage(file)
      const created = await insertProduct({
        name: name.trim(),
        price: parseInt(price, 10),
        stock: parseInt(stock, 10),
        sold_out: false,
        seller: encodeSeller(user.name, user.id),
        intent_count: 0,
        image_url: imageUrl,
        category,
      })
      if (!created) throw new Error('No se pudo publicar el snack')
      setName('')
      setPrice('')
      setStock('')
      setCategory('')
      setFile(null)
      setPreview(null)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al publicar')
    } finally {
      setUploading(false)
    }
  }

  const changeStock = async (id: string, delta: number) => {
    const product = products.find((p) => p.id === id)
    if (!product) return
    const next = Math.max(0, product.stock + delta)
    await updateProduct(id, { stock: next, sold_out: next === 0 })
    await incrementMetric('inventory_updates')
    await refresh()
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <div className="space-y-3 rounded-lg border border-border bg-card p-4">
        <h1 className="font-display text-xl font-bold">Publicar snack</h1>
        <input placeholder="Nombre del snack" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        <div className="flex gap-3">
          <input placeholder="Precio $" type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} />
          <input placeholder="Cantidad" type="number" value={stock} onChange={(e) => setStock(e.target.value)} className={inputClass} />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setCategory(item)}
              className={`rounded-full px-3 py-2 text-xs font-display font-semibold ${
                category === item ? 'bg-primary text-primary-foreground' : 'bg-secondary'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={onFile} />
        {preview ? (
          <img src={preview} alt="Preview" className="h-32 w-full rounded-lg object-cover" />
        ) : (
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3 text-sm text-muted-foreground"
          >
            <Camera size={18} /> Foto opcional
          </button>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="button"
          onClick={() => void publish()}
          disabled={uploading || !name.trim() || !price || !stock || !category}
          className="w-full rounded-lg bg-primary py-3 font-display font-bold text-primary-foreground disabled:opacity-50"
        >
          {uploading ? 'Subiendo...' : '+ Publicar'}
        </button>
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-xl font-bold">Mi puesto</h2>
        {mine.length === 0 && <p className="text-sm text-muted-foreground">Todavía no publicas snacks.</p>}
        <div className="grid gap-4 md:grid-cols-2">
          {mine.map((product) => (
            <article key={product.id} className="overflow-hidden rounded-lg border border-border bg-card">
              {product.image_url && (
                <img src={product.image_url} alt={product.name} className="h-28 w-full object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display font-semibold">{product.name}</h3>
                    <p className="font-bold text-primary">{money(product.price)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void updateProduct(product.id, { sold_out: !product.sold_out }).then(refresh)}
                    className={`rounded-full px-3 py-1 text-xs font-display font-semibold ${
                      product.sold_out ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'
                    }`}
                  >
                    {product.sold_out ? 'Agotado' : 'Disponible'}
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <button type="button" onClick={() => void changeStock(product.id, -1)} className="touch-target rounded-lg bg-secondary">
                    <Minus size={18} />
                  </button>
                  <span className="min-w-8 text-center font-display font-bold">{product.stock}</span>
                  <button type="button" onClick={() => void changeStock(product.id, 1)} className="touch-target rounded-lg bg-secondary">
                    <Plus size={18} />
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Users size={14} className="text-primary" /> {product.intent_count} lo quieren
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
