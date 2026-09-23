import {
  Building2,
  Camera,
  CheckCircle2,
  KeyRound,
  MapPin,
  MessageSquare,
  Minus,
  Plus,
  Radio,
  Sparkles,
  Store,
  TrendingUp,
  Users,
  Zap,
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
import { getUnreadCount, subscribeToChatUpdates } from '../lib/chat'
import { CATEGORIES, inputClass, labelClass } from '../lib/constants'
import { encodeSeller, joinTags, money, ownsListing, parseTags } from '../lib/format'
import {
  getLockersByBuilding,
  reserveLockerForSellerDeposit,
  subscribeToLockerUpdates,
} from '../lib/lockers'
import { playKeyBeep, playPaymentSuccess } from '../lib/sounds'
import type { DietaryTag, Locker, Product, SellerPresence } from '../types'

export function SellPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'inventory' | 'lockers'>('inventory')
  const [products, setProducts] = useState<Product[]>([])
  const [unreadMessages, setUnreadMessages] = useState(0)

  // New product form
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [dietary, setDietary] = useState<DietaryTag[]>([])
  const [preferredBuilding, setPreferredBuilding] = useState<'D' | 'M' | 'L'>('D')
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

  // Locker storage panel state
  const [selectedLockerBuilding, setSelectedLockerBuilding] = useState<'D' | 'M' | 'L'>('D')
  const [buildingLockers, setBuildingLockers] = useState<Locker[]>([])
  const [selectedLockerToReserve, setSelectedLockerToReserve] = useState<Locker | null>(null)
  const [selectedProductToStoreId, setSelectedProductToStoreId] = useState<string>('')
  const [depositSuccessResult, setDepositSuccessResult] = useState<{
    locker: Locker
    depositPin: string
    message: string
  } | null>(null)

  const refresh = useCallback(async () => {
    setProducts(await fetchProducts())
  }, [])

  const loadBuildingLockers = useCallback(() => {
    setBuildingLockers(getLockersByBuilding(selectedLockerBuilding))
  }, [selectedLockerBuilding])

  useEffect(() => {
    void refresh()
    loadBuildingLockers()
    const unsubLockers = subscribeToLockerUpdates(loadBuildingLockers)

    if (user) {
      const current = getAllSellerPresences()[user.id]
      if (current) {
        setSellerZone(current.zone)
        setZoneDetail(current.detail)
        setPresenceDuration(current.activeUntil)
        setIsOnline(current.isOnline)
      }
      const updateUnread = () => setUnreadMessages(getUnreadCount(user.id, true, user.name))
      updateUnread()
      const unsubscribe = subscribeToChatUpdates(updateUnread)
      return () => {
        unsubscribe()
        unsubLockers()
      }
    }
    return () => unsubLockers()
  }, [refresh, loadBuildingLockers, user])

  if (!user || !canSell(user.role)) {
    return <Navigate to="/catalogo" replace />
  }

  const mine = products.filter((p) => ownsListing(p.seller, user.id, user.name))

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

  // Handle seller reserving a locker to deposit a snack
  const handleReserveLockerDeposit = () => {
    if (!selectedLockerToReserve || !selectedProductToStoreId) return
    const prod = mine.find((p) => p.id === selectedProductToStoreId)
    if (!prod) return

    try {
      const res = reserveLockerForSellerDeposit({
        building: selectedLockerBuilding,
        lockerId: selectedLockerToReserve.id,
        productId: prod.id,
        productName: prod.name,
        productPrice: prod.price,
        productImage: prod.image_url,
        sellerId: user.id,
        sellerName: user.name,
      })

      playPaymentSuccess()
      setDepositSuccessResult(res)
      setSelectedLockerToReserve(null)
      loadBuildingLockers()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al reservar casillero')
    }
  }

  // Quick stats
  const totalItemsInStock = mine.reduce((sum, p) => sum + (p.sold_out ? 0 : p.stock), 0)
  const totalValue = mine.reduce((sum, p) => sum + p.price * (p.sold_out ? 0 : p.stock), 0)
  const estimatedCommission = Math.round(totalValue * 0.05) // 5% fee

  return (
    <div className="space-y-6">
      {/* Header with quick stats */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-primary">
            <Store size={14} />
            <span>Panel de Cocinero Universitario</span>
          </div>
          <h1 className="mt-1 font-display text-2xl font-black tracking-tight sm:text-3xl text-foreground">
            Gestión de Snacks & Casilleros
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Publica tus preparaciones, controla stock en vivo y reserva casilleros en los Edificios D, M y L para entrega 24/7.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/mensajes"
            className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-xs font-display font-semibold hover:border-primary/50 transition-colors"
          >
            <MessageSquare size={16} className="text-primary" />
            <span>Mensajes</span>
            {unreadMessages > 0 && (
              <span className="rounded-full bg-primary px-1.5 py-0.2 text-[10px] font-bold text-primary-foreground animate-pulse">
                {unreadMessages}
              </span>
            )}
          </Link>
          <Link
            to="/pedidos"
            className="rounded-2xl bg-primary px-4 py-2.5 text-xs font-display font-bold text-primary-foreground shadow-sm hover:opacity-90"
          >
            Pases de Depósito
          </Link>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
            Snacks publicados
          </span>
          <p className="mt-1 font-display text-xl font-black text-foreground">{mine.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
            Unidades en stock
          </span>
          <p className="mt-1 font-display text-xl font-black text-primary">{totalItemsInStock}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
            Valor de inventario
          </span>
          <p className="mt-1 font-display text-xl font-black text-foreground">{money(totalValue)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1 font-mono">
            <TrendingUp size={12} className="text-emerald-400" /> Comisión Bocado (5%)
          </span>
          <p className="mt-1 font-display text-xl font-black text-emerald-400">{money(estimatedCommission)}</p>
        </div>
      </div>

      {/* Main Mode Tabs */}
      <div className="flex rounded-2xl bg-secondary/80 p-1 border border-border/60 max-w-md">
        <button
          type="button"
          onClick={() => {
            playKeyBeep(500)
            setActiveTab('inventory')
          }}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-display font-bold transition-all ${
            activeTab === 'inventory'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles size={14} />
          <span>1. Publicar & Stock</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playKeyBeep(500)
            setActiveTab('lockers')
          }}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-display font-bold transition-all ${
            activeTab === 'lockers'
              ? 'bg-gradient-to-r from-primary to-amber-500 text-primary-foreground shadow-md'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building2 size={14} />
          <span>2. Guardar en Casillero</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: PUBLICAR Y GESTIONAR SNACKS                        */}
      {/* ========================================================= */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Live Campus Presence Banner */}
          <div className="rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-card to-card p-5 shadow-sm">
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
                  className="rounded-xl border border-border bg-secondary px-3 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary"
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
                  className="rounded-xl border border-border bg-secondary px-3 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary"
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
                  className="rounded-xl border border-border bg-secondary px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary min-w-[180px]"
                />

                <button
                  type="button"
                  onClick={handleSavePresence}
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 font-display text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 active:scale-95"
                >
                  {presenceSaved ? <CheckCircle2 size={14} /> : <MapPin size={14} />}
                  <span>{presenceSaved ? '¡Ubicación Fijada!' : 'Fijar Ubicación'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Grid: Form + Snacks List */}
          <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
            {/* Publish Snack Form */}
            <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
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

              {/* Preferred Building */}
              <div>
                <label className={labelClass}>Edificio de entrega preferido</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['D', 'M', 'L'] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setPreferredBuilding(b)}
                      className={`rounded-xl py-2 px-2 text-xs font-mono font-bold border transition-all ${
                        preferredBuilding === b
                          ? 'border-primary bg-primary/20 text-primary'
                          : 'border-border bg-secondary/40 text-muted-foreground'
                      }`}
                    >
                      Edificio {b}
                    </button>
                  ))}
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
                    <img src={preview} alt="Preview" className="h-32 w-full rounded-2xl object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null)
                        setPreview(null)
                      }}
                      className="absolute top-2 right-2 rounded-full bg-background/80 px-2.5 py-1 text-xs font-bold text-foreground"
                    >
                      ✕ Cambiar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3 text-xs font-semibold text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
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
                className="w-full rounded-2xl bg-primary py-3.5 font-display text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110 active:scale-95 disabled:opacity-40"
              >
                {uploading ? 'Publicando en campus...' : '+ Publicar Snack'}
              </button>
            </div>

            {/* Existing Snacks List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">Mis Snacks Publicados ({mine.length})</h2>
                <span className="text-xs text-muted-foreground">Control instantáneo de stock</span>
              </div>

              {mine.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center text-muted-foreground">
                  <p className="font-display font-medium text-foreground">Aún no has publicado snacks.</p>
                  <p className="mt-1 text-xs">Usa el formulario para anunciar tus brownies o snacks de hoy.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
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
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProductToStoreId(product.id)
                            setActiveTab('lockers')
                          }}
                          className="font-display font-bold text-primary hover:underline text-xs flex items-center gap-1"
                        >
                          <Building2 size={12} /> Guardar en Casillero →
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: PANEL DE GUARDADO EN CASILLERO (DEPÓSITO D, M, L)   */}
      {/* ========================================================= */}
      {activeTab === 'lockers' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Instructions Box */}
          <div className="rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/15 via-card to-card p-6 shadow-xl backdrop-blur-md">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-primary uppercase">
                  <KeyRound size={14} />
                  <span>Flujo de Depósito para Vendedores</span>
                </div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Elige un Casillero Libre en Edificio D, M o L
                </h2>
                <p className="text-xs text-muted-foreground max-w-2xl">
                  Selecciona el edificio del campus, elige un casillero vacío, asigna tu snack y te daremos un <strong>PIN de depósito (ej. DEP-4891)</strong> para abrir la compuerta física en la máquina.
                </p>
              </div>

              <Link
                to="/vitrina"
                className="flex items-center gap-2 rounded-2xl bg-secondary px-4 py-2.5 font-display text-xs font-bold text-foreground hover:bg-secondary/80 self-start lg:self-auto"
              >
                <Zap size={14} className="text-primary" />
                <span>Abrir Terminal Kiosk</span>
              </Link>
            </div>
          </div>

          {/* Building Selector */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'D' as const, name: 'Edificio D', icon: '⚡', zone: 'Plazoleta Central' },
              { id: 'M' as const, name: 'Edificio M', icon: '🏛️', zone: 'Hall de Aulas' },
              { id: 'L' as const, name: 'Edificio L', icon: '🌿', zone: 'Acceso a Estudios' },
            ].map((b) => {
              const isSel = selectedLockerBuilding === b.id
              const lks = getLockersByBuilding(b.id)
              const freeCount = lks.filter((l) => l.status === 'disponible').length

              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    playKeyBeep(550)
                    setSelectedLockerBuilding(b.id)
                    setSelectedLockerToReserve(null)
                  }}
                  className={`rounded-3xl border p-4 text-left transition-all ${
                    isSel
                      ? 'border-primary bg-primary/15 shadow-xl shadow-primary/15 ring-2 ring-primary scale-102'
                      : 'border-border bg-card/60 hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm font-bold text-foreground flex items-center gap-1.5">
                      <span>{b.icon}</span>
                      {b.name}
                    </span>
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">{b.zone}</p>
                  <p className="mt-3 text-xs font-mono font-bold text-emerald-400">
                    {freeCount} de 20 casilleros libres
                  </p>
                </button>
              )
            })}
          </div>

          {/* 20 Locker Grid for Selected Building */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-3 gap-2">
              <div>
                <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                  <Building2 size={18} className="text-primary" />
                  Casilleros en Edificio {selectedLockerBuilding} (20 Unidades)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Haz clic en cualquier casillero libre (verde) para seleccionarlo y guardar tu snack.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" /> Disponible
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="h-2 w-2 rounded-full bg-amber-400" /> Esperando depósito
                </span>
                <span className="flex items-center gap-1 text-cyan-400">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" /> Con snack listo
                </span>
              </div>
            </div>

            {/* Matrix of 20 Lockers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {buildingLockers.map((locker) => {
                const isFree = locker.status === 'disponible'
                const isWaiting = locker.status === 'esperando_deposito'
                const isSelected = selectedLockerToReserve?.id === locker.id

                return (
                  <button
                    key={locker.id}
                    type="button"
                    onClick={() => {
                      if (isFree) {
                        playKeyBeep(600)
                        setSelectedLockerToReserve(locker)
                      }
                    }}
                    className={`rounded-2xl border p-3.5 text-left transition-all relative flex flex-col justify-between min-h-[105px] ${
                      isSelected
                        ? 'border-primary bg-primary/20 shadow-lg shadow-primary/20 ring-2 ring-primary scale-105'
                        : isFree
                        ? 'border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-400 hover:bg-emerald-950/20 cursor-pointer'
                        : isWaiting
                        ? 'border-amber-500/30 bg-amber-950/20 opacity-80 cursor-not-allowed'
                        : 'border-cyan-500/30 bg-cyan-950/20 opacity-80 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-foreground">
                        #{locker.code}
                      </span>
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isFree
                            ? 'bg-emerald-400'
                            : isWaiting
                            ? 'bg-amber-400'
                            : 'bg-cyan-400'
                        }`}
                      />
                    </div>

                    <div className="my-1 text-xs">
                      {isFree ? (
                        <p className="font-semibold text-emerald-400 text-[11px]">Libre</p>
                      ) : isWaiting ? (
                        <p className="font-semibold text-amber-400 text-[10px] truncate">
                          {locker.productName || 'Reservado'}
                        </p>
                      ) : (
                        <p className="font-semibold text-cyan-400 text-[10px] truncate">
                          {locker.productName || 'Ocupado'}
                        </p>
                      )}
                    </div>

                    <span className="text-[9px] font-mono text-muted-foreground capitalize">
                      {locker.tempType === 'refrigerado' ? '❄️ Frío' : '🌡️ Ambiente'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Reservation Action Box */}
          {selectedLockerToReserve && (
            <div className="rounded-3xl border-2 border-primary/50 bg-card p-6 shadow-2xl space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2 font-display text-base font-bold text-foreground">
                  <KeyRound size={18} className="text-primary" />
                  <span>Asignar Snack al Casillero #{selectedLockerToReserve.code} ({selectedLockerToReserve.hubName})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLockerToReserve(null)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕ Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5 font-mono">
                    Selecciona el snack a depositar:
                  </label>
                  <select
                    value={selectedProductToStoreId}
                    onChange={(e) => setSelectedProductToStoreId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-secondary p-3 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">-- Elige uno de tus snacks --</option>
                    {mine.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.name} ({money(prod.price)}) - Stock: {prod.stock}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-2xl bg-secondary/50 p-4 text-xs font-mono space-y-1.5">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Comisión Bocado (5%):</span>
                    <span className="text-emerald-400 font-bold">5% solo al venderse</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Apertura de compuerta:</span>
                    <span className="text-foreground">PIN de depósito generado</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReserveLockerDeposit}
                disabled={!selectedProductToStoreId}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-amber-500 py-4 font-display text-sm font-extrabold text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all"
              >
                <KeyRound size={16} />
                <span>Reservar Casillero #{selectedLockerToReserve.code} & Generar PIN de Depósito</span>
              </button>
            </div>
          )}

          {/* Deposit Success Result Modal */}
          {depositSuccessResult && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
              <div className="relative w-full max-w-md rounded-3xl border-2 border-primary/50 bg-card p-6 shadow-2xl space-y-5 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <Zap size={36} />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-400">
                    ¡Casillero Reservado para Depósito!
                  </span>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    Casillero #{depositSuccessResult.locker.code} · {depositSuccessResult.locker.hubName}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Producto: <strong>{depositSuccessResult.locker.productName}</strong>
                  </p>
                </div>

                {/* Big Deposit PIN Highlight */}
                <div className="rounded-2xl border-2 border-amber-500/40 bg-amber-950/20 p-4 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                    TU PIN DE DEPÓSITO PARA LA MÁQUINA
                  </span>
                  <p className="font-mono text-3xl font-black tracking-widest text-amber-400">
                    {depositSuccessResult.depositPin}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Digita este PIN en el teclado de la vitrina para abrir la compuerta y dejar el producto.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link
                    to="/vitrina"
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-3 text-xs font-display font-bold text-primary-foreground shadow-md hover:opacity-90"
                  >
                    <KeyRound size={14} />
                    <span>Ir a la Terminal</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDepositSuccessResult(null)}
                    className="flex-1 rounded-xl border border-border bg-secondary py-3 text-xs font-display font-semibold text-foreground hover:bg-secondary/80"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
