import {
  Camera,
  CheckCircle2,
  MapPin,
  MessageSquare,
  Minus,
  Plus,
  Radio,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { TagList } from '../components/TagList'
import { canSell, useAuth } from '../context/AuthContext'
import {
  fetchProducts,
  incrementMetric,
  insertProduct,
  updateProduct,
  uploadProductImage,
} from '../lib/api'
import {
  DIETARY_OPTIONS,
  getAllSellerPresences,
  ICESI_ZONES,
  PRESENCE_DURATIONS,
  saveSellerPresence,
} from '../lib/campus'
import { getUnreadCount } from '../lib/chat'
import { CATEGORIES, inputClass, labelClass } from '../lib/constants'
import { encodeSeller, joinTags, money, ownsListing, parseTags } from '../lib/format'
import type { DietaryTag, Product, SellerPresence } from '../types'

export function SellPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [dietary, setDietary] = useState<DietaryTag[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  // Seller presence state
  const [sellerZone, setSellerZone] = useState<string>(ICESI_ZONES[0])
  const [zoneDetail, setZoneDetail] = useState('')
  const [presenceDuration, setPresenceDuration] = useState<string>(PRESENCE_DURATIONS[1].value)
  const [isOnline, setIsOnline] = useState(true)
  const [presenceSaved, setPresenceSaved] = useState(false)

  const refresh = useCallback(async () => {
    setProducts(await fetchProducts())
  }, [])

  useEffect(() => {
    void refresh()
    if (user) {
      const current = getAllSellerPresences()[user.id]
      if (current) {
        setSellerZone(current.zone)
        setZoneDetail(current.detail)
        setPresenceDuration(current.activeUntil)
        setIsOnline(current.isOnline)
      }
    }
  }, [refresh, user])

  if (!user || !canSell(user.role)) {
    return <Navigate to="/catalogo" replace />
  }

  const mine = products.filter((p) => ownsListing(p.seller, user.id, user.name))
  const unreadMessages = getUnreadCount(user.id)

  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0]
    if (!next) return
    setFile(next)
    setPreview(URL.createObjectURL(next))
  }

  const handleSavePresence = () => {
    if (!user) return
    const presence: SellerPresence = {
      sellerId: user.id,
      sellerName: user.name,
      zone: sellerZone,
      detail: zoneDetail.trim() || 'Cerca de las bancas / mesas de estudio',
      activeUntil: presenceDuration,
      isOnline,
      updatedAt: new Date().toISOString(),
    }
    saveSellerPresence(user.id, presence)
    setPresenceSaved(true)
    setTimeout(() => setPresenceSaved(false), 3000)
  }

  const publish = async () => {
    if (!name.trim() || !price || !stock || (tags.length === 0 && dietary.length === 0)) return
    setUploading(true)
    setError('')
    try {
      let imageUrl: string | null = null
      if (file) imageUrl = await uploadProductImage(file)

      const allCategoryTags = [...tags, ...dietary]

      const created = await insertProduct({
        name: name.trim(),
        price: parseInt(price, 10),
        stock: parseInt(stock, 10),
        sold_out: false,
        seller: encodeSeller(user.name, user.id),
        intent_count: 0,
        image_url: imageUrl,
        category: joinTags(allCategoryTags),
        description: description.trim() || undefined,
      })

      if (!created) throw new Error('No se pudo publicar el snack')
      setName('')
      setPrice('')
      setStock('')
      setTags([])
      setDietary([])
      setDescription('')
      setFile(null)
      setPreview(null)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al publicar snack')
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

  const toggleSoldOut = async (product: Product) => {
    const nextSoldOut = !product.sold_out
    await updateProduct(product.id, {
      sold_out: nextSoldOut,
      stock: nextSoldOut ? 0 : product.stock > 0 ? product.stock : 5,
    })
    await incrementMetric('inventory_updates')
    await refresh()
  }

  // Quick stats
  const totalItemsInStock = mine.reduce((sum, p) => sum + (p.sold_out ? 0 : p.stock), 0)
  const totalValue = mine.reduce((sum, p) => sum + p.price * (p.sold_out ? 0 : p.stock), 0)
  const estimatedCommission = totalValue * 0.08 // 8% fee guideline

  return (
    <div className="space-y-6">
      {/* Header with quick stats */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Panel de Vendedor</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Control de inventario en vivo (&lt;10s), ubicación activa en el campus y pedidos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/mensajes"
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-display font-semibold hover:border-primary/50 transition-colors"
          >
            <MessageSquare size={16} className="text-primary" />
            <span>Mensajes</span>
            {unreadMessages > 0 && (
              <span className="rounded-full bg-primary px-1.5 py-0.2 text-[10px] font-bold text-primary-foreground">
                {unreadMessages}
              </span>
            )}
          </Link>
          <Link
            to="/pedidos"
            className="rounded-xl bg-primary px-4 py-2.5 text-xs font-display font-bold text-primary-foreground shadow-sm hover:opacity-90"
          >
            Ver Pedidos
          </Link>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Snacks activos</span>
          <p className="mt-1 font-display text-xl font-bold text-foreground">{mine.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Unidades en stock</span>
          <p className="mt-1 font-display text-xl font-bold text-primary">{totalItemsInStock}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Inventario total</span>
          <p className="mt-1 font-display text-xl font-bold text-foreground">{money(totalValue)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <TrendingUp size={12} className="text-emerald-400" /> Comisión est. (8%)
          </span>
          <p className="mt-1 font-display text-xl font-bold text-emerald-400">{money(estimatedCommission)}</p>
        </div>
      </div>

      {/* Live Campus Presence Banner */}
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-card to-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
              </span>
              <Radio size={16} className="text-primary" />
              <span>Mi Ubicación en el Campus en Tiempo Real</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Los compradores verán este punto en tus snacks para saber dónde encontrarte entre clases.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sellerZone}
              onChange={(e) => setSellerZone(e.target.value)}
              className="rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary"
            >
              {ICESI_ZONES.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>

            <select
              value={presenceDuration}
              onChange={(e) => setPresenceDuration(e.target.value)}
              className="rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary"
            >
              {PRESENCE_DURATIONS.map((dur) => (
                <option key={dur.value} value={dur.value}>
                  {dur.label}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Detalle (ej. Piso 2 frente a aulas)"
              value={zoneDetail}
              onChange={(e) => setZoneDetail(e.target.value)}
              className="rounded-lg border border-border bg-secondary px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary min-w-[180px]"
            />

            <button
              type="button"
              onClick={handleSavePresence}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 font-display text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 active:scale-95"
            >
              {presenceSaved ? <CheckCircle2 size={14} /> : <MapPin size={14} />}
              <span>{presenceSaved ? '¡Ubicación Actualizada!' : 'Fijar Ubicación'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Form + Snacks List */}
      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* Publish Snack Form */}
        <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 font-display text-base font-bold">
            <Sparkles size={18} className="text-primary" />
            <h2>Publicar nuevo snack</h2>
          </div>

          <div>
            <label className={labelClass}>Nombre del snack *</label>
            <input
              placeholder="Ej. Brownie con Arequipe y Nueces"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Descripción / Ingredientes</label>
            <textarea
              placeholder="Ej. Hecho hoy en la mañana, chocolate 70% y nueces picadas."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Precio ($ COP) *</label>
              <input
                placeholder="Ej. 3500"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Cantidad / Stock *</label>
              <input
                placeholder="Ej. 8"
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className={labelClass}>Categoría principal</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((item) => {
                const selected = tags.includes(item)
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() =>
                      setTags((current) =>
                        current.includes(item) ? current.filter((tag) => tag !== item) : [...current, item],
                      )
                    }
                    className={`rounded-lg px-2.5 py-1 text-xs font-display font-semibold transition-colors ${
                      selected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {item}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Dietary Options */}
          <div>
            <label className={labelClass}>Etiquetas dietéticas y alérgenos</label>
            <div className="flex flex-wrap gap-1.5">
              {DIETARY_OPTIONS.map((opt) => {
                const selected = dietary.includes(opt.id)
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() =>
                      setDietary((current) =>
                        current.includes(opt.id) ? current.filter((d) => d !== opt.id) : [...current, opt.id],
                      )
                    }
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-display font-semibold transition-colors ${
                      selected ? 'bg-emerald-500 text-white' : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    <span>{opt.icon}</span>
                    <span>{opt.shortLabel}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Photo */}
          <div>
            <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={onFile} />
            {preview ? (
              <div className="relative">
                <img src={preview} alt="Preview" className="h-32 w-full rounded-xl object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null)
                    setPreview(null)
                  }}
                  className="absolute top-2 right-2 rounded-full bg-background/80 px-2 py-1 text-xs font-bold text-foreground"
                >
                  ✕ Cambiar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-xs font-semibold text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
              >
                <Camera size={16} /> Subir foto del snack (opcional)
              </button>
            )}
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <button
            type="button"
            onClick={() => void publish()}
            disabled={uploading || !name.trim() || !price || !stock}
            className="w-full rounded-xl bg-primary py-3.5 font-display text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 disabled:opacity-40"
          >
            {uploading ? 'Publicando en campus...' : '+ Publicar Snack'}
          </button>
        </div>

        {/* Existing Snacks List (<10s Fast Inventory Control) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Mis Snacks en Venta ({mine.length})</h2>
            <span className="text-xs text-muted-foreground">Actualización instantánea de stock</span>
          </div>

          {mine.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center text-muted-foreground">
              <p className="font-display font-medium text-foreground">Aún no has publicado snacks.</p>
              <p className="mt-1 text-xs">Usa el formulario para anunciar tus brownies, galletas o snacks de hoy.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {mine.map((product) => (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-2xl border border-border/80 bg-card p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-foreground truncate">{product.name}</h3>
                      <p className="font-display font-extrabold text-primary text-base">{money(product.price)}</p>
                      <div className="mt-1">
                        <TagList tags={parseTags(product.category)} size="sm" />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => void toggleSoldOut(product)}
                      className={`rounded-full px-3 py-1 text-xs font-display font-bold transition-colors ${
                        product.sold_out
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {product.sold_out ? 'Agotado' : 'Disponible'}
                    </button>
                  </div>

                  {/* Stock Quick Controls */}
                  <div className="flex items-center justify-between rounded-xl bg-secondary/60 p-2.5">
                    <span className="text-xs font-semibold text-muted-foreground">Stock en campus:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void changeStock(product.id, -1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-card text-foreground hover:bg-card/80 active:scale-95"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="min-w-6 text-center font-display font-bold text-base text-foreground">
                        {product.stock}
                      </span>
                      <button
                        type="button"
                        onClick={() => void changeStock(product.id, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-card text-foreground hover:bg-card/80 active:scale-95"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      <Users size={13} className="text-primary" /> {product.intent_count} interesados
                    </span>
                    <Link
                      to={`/producto/${product.id}`}
                      className="font-display text-primary hover:underline text-xs"
                    >
                      Ver en catálogo →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
