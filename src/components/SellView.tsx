import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Camera, Minus, Plus, Users } from 'lucide-react'
import { CATEGORIES, SELLER_NAME } from '../lib/constants'
import {
  fetchProducts,
  incrementMetric,
  insertProduct,
  updateProduct,
  uploadProductImage,
} from '../lib/api'
import type { Product } from '../types'

export function SellView() {
  const [products, setProducts] = useState<Product[]>([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [category, setCategory] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [showCommission, setShowCommission] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const refresh = useCallback(async () => {
    setProducts(await fetchProducts())
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const mine = products.filter((p) => p.seller === SELLER_NAME)
  const totalIntents = mine.reduce((sum, p) => sum + p.intent_count, 0)

  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0]
    if (!next) return
    setFile(next)
    setPreview(URL.createObjectURL(next))
  }

  const publish = async () => {
    if (!name.trim() || !price || !stock || !category) return
    setUploading(true)
    let imageUrl: string | null = null
    if (file) imageUrl = await uploadProductImage(file)
    await insertProduct({
      name: name.trim(),
      price: parseInt(price, 10),
      stock: parseInt(stock, 10),
      sold_out: false,
      seller: SELLER_NAME,
      intent_count: 0,
      image_url: imageUrl,
      category,
    })
    setName('')
    setPrice('')
    setStock('')
    setCategory('')
    setFile(null)
    setPreview(null)
    setUploading(false)
    await refresh()
  }

  const changeStock = async (id: string, delta: number) => {
    const product = products.find((p) => p.id === id)
    if (!product) return
    const next = Math.max(0, product.stock + delta)
    await updateProduct(id, {
      stock: next,
      sold_out: next === 0 ? product.sold_out : false,
    })
    await incrementMetric('inventory_updates')
    await refresh()
  }

  const toggleSoldOut = async (id: string) => {
    const product = products.find((p) => p.id === id)
    if (!product) return
    await updateProduct(id, { sold_out: !product.sold_out })
    await refresh()
  }

  const changeCategory = async (id: string, next: string) => {
    await updateProduct(id, { category: next })
    await refresh()
  }

  const answerCommission = async (accepted: boolean) => {
    await incrementMetric(accepted ? 'commission_accepted' : 'commission_rejected')
    setShowCommission(false)
  }

  return (
    <div className="space-y-5">
      <div className="bg-card rounded-lg p-4 border border-border space-y-3">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <Plus size={18} className="text-primary" /> Agregar Snack
        </h3>
        <input
          placeholder="Nombre del snack"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-secondary text-foreground rounded-lg px-4 py-3 text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring font-body"
        />
        <div className="flex gap-3">
          <input
            placeholder="Precio $"
            type="number"
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="flex-1 min-w-0 bg-secondary text-foreground rounded-lg px-4 py-3 text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring font-body"
          />
          <input
            placeholder="Cantidad"
            type="number"
            inputMode="numeric"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="flex-1 min-w-0 bg-secondary text-foreground rounded-lg px-4 py-3 text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring font-body"
          />
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-body">Categoría *</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => setCategory(item)}
                className={`px-3 py-2 rounded-full text-xs font-display font-semibold transition-colors ${
                  category === item
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFile}
        />
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
            <button
              type="button"
              onClick={() => {
                setFile(null)
                setPreview(null)
              }}
              className="absolute top-2 right-2 bg-background/80 text-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="w-full py-3 border border-dashed border-border rounded-lg text-muted-foreground text-sm flex items-center justify-center gap-2 transition-colors hover:border-primary hover:text-primary"
          >
            <Camera size={18} /> Agregar foto (opcional)
          </button>
        )}
        <button
          type="button"
          onClick={() => void publish()}
          disabled={uploading || !name.trim() || !price || !stock || !category}
          className="w-full touch-target bg-primary text-primary-foreground rounded-lg font-display font-bold text-base transition-transform active:scale-95 disabled:opacity-50"
        >
          {uploading ? 'Subiendo...' : '+ Publicar Snack'}
        </button>
      </div>

      {mine.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display font-semibold text-foreground">Mis Productos</h3>
          {mine.map((product) => (
            <div
              key={product.id}
              className="bg-card rounded-lg border border-border overflow-hidden"
            >
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-28 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-display font-semibold text-foreground truncate">
                      {product.name}
                    </h4>
                    <p className="text-sm text-primary font-bold">
                      ${product.price.toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void toggleSoldOut(product.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-display font-semibold transition-colors shrink-0 ${
                      product.sold_out
                        ? 'bg-destructive/20 text-destructive'
                        : 'bg-primary/20 text-primary'
                    }`}
                  >
                    {product.sold_out ? 'Agotado' : 'Disponible'}
                  </button>
                </div>
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-1.5 font-body">Categoría</p>
                  <select
                    value={product.category}
                    onChange={(e) => void changeCategory(product.id, e.target.value)}
                    className="w-full bg-secondary text-foreground rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring font-body"
                  >
                    {CATEGORIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => void changeStock(product.id, -1)}
                    className="touch-target bg-secondary text-foreground rounded-lg flex items-center justify-center transition-transform active:scale-90"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="font-display font-bold text-foreground text-lg min-w-[40px] text-center">
                    {product.stock}
                  </span>
                  <button
                    type="button"
                    onClick={() => void changeStock(product.id, 1)}
                    className="touch-target bg-secondary text-foreground rounded-lg flex items-center justify-center transition-transform active:scale-90"
                  >
                    <Plus size={20} />
                  </button>
                  <span className="text-xs text-muted-foreground">unidades</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Users size={14} className="text-primary" />
                    <span className="text-xs text-muted-foreground">
                      {product.intent_count} persona{product.intent_count !== 1 ? 's' : ''} quiere
                      {product.intent_count !== 1 ? 'n' : ''} esto
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, product.intent_count * 10)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalIntents > 0 && (
        <button
          type="button"
          onClick={() => setShowCommission(true)}
          className="w-full touch-target bg-primary text-primary-foreground rounded-lg font-display font-bold text-base transition-transform active:scale-95 flex items-center justify-center gap-2"
        >
          💸 Simular Venta ({totalIntents} interesados)
        </button>
      )}

      {showCommission && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-lg border border-border p-6 w-full max-w-[420px] space-y-4">
            <h3 className="font-display font-bold text-foreground text-lg text-center">
              🤝 Propuesta Bocado
            </h3>
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              Bocado te consiguió{' '}
              <span className="text-primary font-bold">{totalIntents} clientes potenciales</span>.
              ¿Pagarías una comisión del 5% (~$500 promedio) por asegurar estas ventas?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => void answerCommission(true)}
                className="flex-1 touch-target bg-primary text-primary-foreground rounded-lg font-display font-bold text-base transition-transform active:scale-95"
              >
                SÍ
              </button>
              <button
                type="button"
                onClick={() => void answerCommission(false)}
                className="flex-1 touch-target bg-secondary text-secondary-foreground rounded-lg font-display font-bold text-base transition-transform active:scale-95"
              >
                NO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
