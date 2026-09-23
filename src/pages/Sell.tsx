import {
  BookmarkCheck,
  CheckCircle2,
  Eye,
  Image as ImageIcon,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Store,
  Trash2,
  TrendingUp,
  UploadCloud,
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
import { DIETARY_OPTIONS } from '../lib/campus'
import { CATEGORIES, inputClass, labelClass } from '../lib/constants'
import { encodeSeller, formatTime, joinTags, money, ownsListing, parseTags } from '../lib/format'
import { playKeyBeep, playPaymentSuccess } from '../lib/sounds'
import { fetchOrders, subscribeToOrderUpdates } from '../lib/storage-db'
import type { DietaryTag, Order, Product } from '../types'

const SAMPLE_PRESETS = [
  { name: 'Brownie Melcochudo', price: '4500', cat: 'Brownies', img: '/images/real_brownie.jpg' },
  { name: 'Empanada Horneada', price: '3500', cat: 'Salados', img: '/images/real_empanadas.jpg' },
  { name: 'Parfait con Frutas', price: '5500', cat: 'Postres', img: '/images/real_parfait.jpg' },
  { name: 'Galletas de Avena', price: '2500', cat: 'Galletas', img: '/images/real_cookies.jpg' },
  { name: 'Rollo de Canela', price: '4000', cat: 'Postres', img: '/images/real_cinnamon_roll.jpg' },
  { name: 'Cheesecake Fresa', price: '6000', cat: 'Postres', img: '/images/real_cheesecake.jpg' },
]

export function SellPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  // New product form
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('8')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>(['Brownies'])
  const [dietary, setDietary] = useState<DietaryTag[]>([])
  const [preferredBuilding, setPreferredBuilding] = useState<'D' | 'M' | 'L'>('D')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedPresetImage, setSelectedPresetImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [publishSuccess, setPublishSuccess] = useState(false)
  const [error, setError] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  const refresh = useCallback(async () => {
    const prods = await fetchProducts()
    setProducts(prods)
    const ords = await fetchOrders()
    setOrders(ords.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  }, [])

  useEffect(() => {
    void refresh()
    const unsubOrders = subscribeToOrderUpdates(() => {
      void refresh()
    })
    return () => unsubOrders()
  }, [refresh])

  if (!user || !canSell(user.role)) {
    return <Navigate to="/catalogo" replace />
  }

  const mine = products.filter((p) => ownsListing(p.seller, user.id, user.name))
  const mySellingOrders = orders.filter((order) => {
    if (!user) return false
    const sKey = order.sellerKey || ''
    const sName = (order.sellerName || '').trim().toLowerCase()
    const uName = (user.name || '').trim().toLowerCase()
    const uId = user.id.toLowerCase()

    return (
      sKey.toLowerCase().endsWith(`::${uId}`) ||
      sKey.toLowerCase() === uId ||
      sKey.toLowerCase() === uName ||
      sName === uName ||
      ownsListing(order.sellerKey, user.id, user.name)
    )
  })

  const pendingApartados = mySellingOrders.filter((o) => o.status === 'reservado')

  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0]
    if (!next) return
    setFile(next)
    setSelectedPresetImage(null)
    setPreview(URL.createObjectURL(next))
  }

  const handleApplyPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    playKeyBeep(600)
    setName(preset.name)
    setPrice(preset.price)
    setTags([preset.cat])
    setSelectedPresetImage(preset.img)
    setFile(null)
    setPreview(null)
  }

  const publish = async () => {
    if (!name.trim()) {
      setError('Escribe el nombre del snack')
      return
    }
    const numPrice = parseInt(price, 10)
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Ingresa un precio válido en pesos colombianos')
      return
    }
    const numStock = parseInt(stock, 10)
    if (isNaN(numStock) || numStock <= 0) {
      setError('Ingresa una cantidad de stock inicial')
      return
    }
    if (tags.length === 0 && dietary.length === 0) {
      setError('Selecciona al menos una categoría o etiqueta')
      return
    }

    setUploading(true)
    setError('')
    try {
      let imageUrl: string | null = selectedPresetImage
      if (file) {
        imageUrl = await uploadProductImage(file)
      }

      const allCategoryTags = [...tags, ...dietary]

      const created = await insertProduct({
        name: name.trim(),
        price: numPrice,
        stock: numStock,
        sold_out: false,
        seller: encodeSeller(user.name, user.id),
        intent_count: 0,
        image_url: imageUrl,
        category: joinTags(allCategoryTags),
        description: description.trim() || undefined,
        preferredBuilding,
      })

      if (!created) throw new Error('No se pudo publicar el snack. Intenta de nuevo.')

      playPaymentSuccess()
      setPublishSuccess(true)
      setTimeout(() => setPublishSuccess(false), 3500)

      // Reset form
      setName('')
      setPrice('')
      setStock('8')
      setTags(['Brownies'])
      setDietary([])
      setDescription('')
      setFile(null)
      setPreview(null)
      setSelectedPresetImage(null)
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


  // Live preview image helper
  const livePreviewImage = preview || selectedPresetImage || (() => {
    const n = name.toLowerCase()
    if (n.includes('brownie') || n.includes('chocolate')) return '/images/real_brownie.jpg'
    if (n.includes('parfait') || n.includes('yogur') || n.includes('chia') || n.includes('fruta')) return '/images/real_parfait.jpg'
    if (n.includes('empanada') || n.includes('pastel') || n.includes('pollo')) return '/images/real_empanadas.jpg'
    if (n.includes('galleta') || n.includes('cookie') || n.includes('avena')) return '/images/real_cookies.jpg'
    if (n.includes('rollo') || n.includes('canela')) return '/images/real_cinnamon_roll.jpg'
    if (n.includes('cheesecake') || n.includes('torta')) return '/images/real_cheesecake.jpg'
    return '/images/real_brownie.jpg'
  })()

  return (
    <div className="space-y-6 pb-12">
      {/* Header with quick stats */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-primary">
            <Store size={14} />
            <span>Panel de Cocinero Universitario</span>
          </div>
          <h1 className="mt-1 font-display text-2xl font-black tracking-tight sm:text-3xl text-foreground">
            Estudio de Creación & Gestión de Snacks
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Publica tus preparaciones caseras y controla tu inventario disponible en tiempo real.
          </p>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-3.5 shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
            Snacks publicados
          </span>
          <p className="mt-1 font-display text-xl font-black text-foreground">{mine.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3.5 shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
            Unidades en stock
          </span>
          <p className="mt-1 font-display text-xl font-black text-primary">{totalItemsInStock}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3.5 shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
            Apartados pendientes
          </span>
          <p className="mt-1 font-display text-xl font-black text-amber-400">
            {pendingApartados.length}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3.5 shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1 font-mono">
            <TrendingUp size={12} className="text-emerald-400" /> Valor Total
          </span>
          <p className="mt-1 font-display text-xl font-black text-emerald-400">{money(totalValue)}</p>
        </div>
      </div>

      {/* Pending Apartados Alert Banner */}
      {pendingApartados.length > 0 && (
        <div className="rounded-3xl border-2 border-amber-500/50 bg-gradient-to-r from-amber-950/40 via-card to-card p-5 shadow-lg space-y-3 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 font-bold">
                <BookmarkCheck size={20} />
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground text-sm sm:text-base">
                  ¡Tienes {pendingApartados.length} apartado(s) nuevo(s) de compradores!
                </h3>
                <p className="text-xs text-muted-foreground">
                  Los estudiantes han apartado tus snacks. Revisa los detalles y coordina la entrega.
                </p>
              </div>
            </div>

            <Link
              to="/pedidos"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-display font-bold text-black shadow-md hover:bg-amber-400 transition-colors self-start sm:self-auto"
            >
              <span>Gestionar Apartados</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 pt-1">
            {pendingApartados.slice(0, 3).map((ord) => (
              <div
                key={ord.id}
                className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-secondary/40 p-3 text-xs"
              >
                <div>
                  <span className="font-bold text-foreground block">
                    {ord.buyerName || 'Estudiante'}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {ord.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span className="font-bold text-amber-400 block">{money(ord.total)}</span>
                  <span className="text-[10px] text-muted-foreground">{formatTime(ord.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CREATOR STUDIO: FORM & LIVE PREVIEW                       */}
      {/* ========================================================= */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4 gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-primary uppercase">
              <Sparkles size={14} />
              <span>Estudio de Publicación</span>
            </div>
            <h2 className="font-display text-xl font-bold text-foreground">
              Crear Nuevo Snack para el Campus
            </h2>
          </div>

          {/* Preset Quick Fill */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono text-muted-foreground">Plantillas rápidas:</span>
            {SAMPLE_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="rounded-lg border border-border/80 bg-secondary/60 px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-secondary hover:border-primary/50 transition-colors"
              >
                {p.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {publishSuccess && (
          <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/10 p-4 flex items-center gap-3 text-emerald-400 animate-fadeIn">
            <CheckCircle2 size={20} className="shrink-0" />
            <div className="text-xs">
              <p className="font-bold font-display text-sm">¡Snack publicado con éxito en el catálogo!</p>
              <p className="text-muted-foreground">Los estudiantes ya pueden verlo y apartarlo en campus.</p>
            </div>
          </div>
        )}

        {/* 2 Column Layout: Form + Live Preview */}
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Left Form */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className={labelClass}>Nombre de la preparación o snack *</label>
              <input
                placeholder="Ej. Brownie con Arequipe y Nueces Tostadas"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>Descripción e ingredientes caseros</label>
              <textarea
                placeholder="Ej. Horneado hoy en la mañana con cacao al 70%, centro melcochudo y arequipe artesanal."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputClass}
                rows={2}
              />
            </div>

            {/* Price and Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Precio de venta ($ COP) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-muted-foreground text-sm">
                    $
                  </span>
                  <input
                    placeholder="4500"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={`${inputClass} pl-8 font-mono font-bold text-foreground`}
                  />
                  {price && !isNaN(parseInt(price, 10)) && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-primary/20 px-2 py-0.5 text-[10px] font-mono font-bold text-primary">
                      {money(parseInt(price, 10))} COP
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className={labelClass}>Cantidad / Stock disponible *</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const cur = parseInt(stock, 10) || 1
                      setStock(String(Math.max(1, cur - 1)))
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-foreground hover:bg-secondary/80 active:scale-95 border border-border"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    placeholder="8"
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className={`${inputClass} text-center font-mono font-bold text-base`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const cur = parseInt(stock, 10) || 0
                      setStock(String(cur + 1))
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-foreground hover:bg-secondary/80 active:scale-95 border border-border"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Preferred Building */}
            <div>
              <label className={labelClass}>Edificio de entrega preferido en Campus Icesi</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'D' as const, name: 'Edificio D', note: 'Plazoleta Central' },
                  { id: 'M' as const, name: 'Edificio M', note: 'Aulas Principales' },
                  { id: 'L' as const, name: 'Edificio L', note: 'Zona de Estudios' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setPreferredBuilding(b.id)}
                    className={`rounded-2xl p-3 text-left border transition-all ${
                      preferredBuilding === b.id
                        ? 'border-primary bg-primary/15 text-primary shadow-sm ring-1 ring-primary'
                        : 'border-border bg-secondary/30 text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    <p className="font-display text-xs font-bold text-foreground">
                      {b.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{b.note}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className={labelClass}>Categoría principal del snack</label>
              <div className="flex flex-wrap gap-2">
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
                      className={`rounded-xl px-3.5 py-1.5 text-xs font-display font-semibold transition-all ${
                        selected
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-102'
                          : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
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
              <label className={labelClass}>Etiquetas dietéticas e ingredientes especiales</label>
              <div className="flex flex-wrap gap-2">
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
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-display font-semibold transition-all ${
                        selected
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                          : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                      }`}
                    >
                      <span>{opt.icon}</span>
                      <span>{opt.shortLabel}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Photo Uploader */}
            <div>
              <label className={labelClass}>Fotografía del producto</label>
              <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={onFile} />

              {preview || selectedPresetImage ? (
                <div className="relative overflow-hidden rounded-2xl border border-border bg-secondary">
                  <img
                    src={preview || selectedPresetImage || ''}
                    alt="Preview"
                    className="h-44 w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-between p-3">
                    <span className="text-xs text-white font-medium flex items-center gap-1">
                      <ImageIcon size={14} /> Imagen seleccionada
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null)
                        setPreview(null)
                        setSelectedPresetImage(null)
                      }}
                      className="rounded-xl bg-destructive/90 px-3 py-1.5 text-xs font-bold text-destructive-foreground hover:bg-destructive shadow-md flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Quitar
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInput.current?.click()}
                  className="cursor-pointer rounded-2xl border-2 border-dashed border-border p-6 text-center hover:border-primary/60 hover:bg-primary/5 transition-all group"
                >
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                    <UploadCloud size={24} />
                  </div>
                  <p className="font-display font-bold text-foreground text-xs sm:text-sm">
                    Haz clic para subir una foto desde tu dispositivo
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Formatos JPG o PNG. Si no tienes foto, se usará una ilustración sugerida automáticamente.
                  </p>
                </div>
              )}
            </div>

            {error && (
              <p className="rounded-xl bg-destructive/10 border border-destructive/30 p-3 text-xs text-destructive font-medium">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={() => void publish()}
              disabled={uploading || !name.trim() || !price}
              className="w-full rounded-2xl bg-gradient-to-r from-primary to-amber-500 py-4 font-display text-sm font-extrabold text-primary-foreground shadow-xl shadow-primary/25 hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              {uploading ? (
                'Publicando snack en el campus...'
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Publicar Snack en el Catálogo</span>
                </>
              )}
            </button>
          </div>

          {/* Right Live Preview Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-muted-foreground uppercase">
              <Eye size={14} className="text-primary" />
              <span>Vista Previa en Vivo</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Así verán los estudiantes tu publicación en el catálogo de Bocado:
            </p>

            {/* Simulated Product Card */}
            <article className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black p-4 shadow-2xl backdrop-blur-xl transition-all">
              {/* Top Bar: Seller info */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary font-mono">
                    {(user.name || 'V').charAt(0).toUpperCase()}
                  </span>
                  <span className="font-medium text-zinc-300 text-xs truncate">
                    {user.name || 'Mi Tienda'}
                  </span>
                </div>
                <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-zinc-400 font-mono">
                  Edif. {preferredBuilding}
                </span>
              </div>

              {/* Product Image */}
              <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-zinc-950 border border-white/10 block">
                <img
                  src={livePreviewImage}
                  alt={name || 'Preview'}
                  className="h-full w-full object-cover rounded-xl"
                />
                <span className="absolute bottom-2 left-2 rounded-lg bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
                  Stock: {stock || '0'}
                </span>
              </div>

              {/* Card Details */}
              <div className="mt-3 space-y-2">
                <h3 className="font-brand text-base font-bold text-foreground line-clamp-1">
                  {name.trim() || 'Nombre de tu delicioso snack'}
                </h3>

                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                  {description.trim() || 'Aquí aparecerá la descripción e ingredientes de tu preparación...'}
                </p>

                <div className="pt-1">
                  <TagList tags={[...tags, ...dietary]} size="sm" />
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-white/10">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-mono block">
                      Precio
                    </span>
                    <p className="font-mono text-lg font-black text-primary">
                      {price && !isNaN(parseInt(price, 10)) ? money(parseInt(price, 10)) : '$0'}
                    </p>
                  </div>

                  <span className="rounded-xl bg-gradient-to-r from-primary to-amber-500 px-3.5 py-2 font-display text-xs font-bold text-primary-foreground shadow-md">
                    Apartar
                  </span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION: MIS SNACKS PUBLICADOS                            */}
      {/* ========================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">
              Mis Snacks Publicados ({mine.length})
            </h2>
            <p className="text-xs text-muted-foreground">
              Ajusta el stock o marca agotado en cualquier momento.
            </p>
          </div>
        </div>

        {mine.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center text-muted-foreground">
            <ShoppingBag size={40} className="mx-auto mb-2 text-primary opacity-30" />
            <p className="font-display font-medium text-foreground">Aún no has publicado snacks.</p>
            <p className="mt-1 text-xs">Usa el formulario de arriba para anunciar tus preparaciones de hoy.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mine.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-3xl border border-border/80 bg-card p-4 shadow-sm space-y-3"
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
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-card text-foreground hover:bg-card/80 active:scale-95 border border-border"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="min-w-6 text-center font-display font-bold text-base text-foreground">
                      {product.stock}
                    </span>
                    <button
                      type="button"
                      onClick={() => void changeStock(product.id, 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-card text-foreground hover:bg-card/80 active:scale-95 border border-border"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                  <span className="flex items-center gap-1">
                    <Users size={13} className="text-primary" /> {product.intent_count || 0} apartados
                  </span>
                  <Link
                    to={`/producto/${product.id}`}
                    className="font-display font-bold text-primary hover:underline text-xs"
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
  )
}
