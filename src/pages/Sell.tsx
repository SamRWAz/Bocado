import {
  Check,
  Minus,
  Package,
  Plus,
  Sparkles,
  Store,
  Trash2,
  UploadCloud,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageTransition } from '../components/PageTransition'
import { canSell, useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  deleteProduct,
  fetchProducts,
  insertProduct,
  updateProduct,
  uploadProductImage,
} from '../lib/api'
import { encodeSeller, joinTags, money, ownsListing } from '../lib/format'
import { calculateProductCommission } from '../lib/pricing'
import { playKeyBeep, playPaymentSuccess } from '../lib/sounds'
import { fetchOrders, subscribeToOrderUpdates } from '../lib/storage-db'
import type { Order, Product } from '../types'

const PRESET_IMAGES = [
  { name: 'Brownie Melcochudo', price: '4500', cat: 'Brownies', img: '/images/real_brownie.jpg' },
  { name: 'Empanada Horneada', price: '3500', cat: 'Salados', img: '/images/real_empanadas.jpg' },
  { name: 'Parfait de Frutas', price: '5500', cat: 'Postres', img: '/images/real_parfait.jpg' },
  { name: 'Galletas de Avena', price: '2500', cat: 'Galletas', img: '/images/real_cookies.jpg' },
  { name: 'Rollo de Canela', price: '4000', cat: 'Postres', img: '/images/real_cinnamon_roll.jpg' },
  { name: 'Cheesecake Fresa', price: '6000', cat: 'Postres', img: '/images/real_cheesecake.jpg' },
]

const CATEGORY_OPTIONS = [
  { id: 'Brownies', label: 'Brownies', icon: '🍫' },
  { id: 'Galletas', label: 'Galletas', icon: '🍪' },
  { id: 'Salados', label: 'Salados & Empanadas', icon: '🥟' },
  { id: 'Postres', label: 'Postres & Dulces', icon: '🍰' },
  { id: 'Saludable', label: 'Fit & Saludable', icon: '🥑' },
  { id: 'Bebidas', label: 'Bebidas', icon: '🥤' },
]

export function SellPage() {
  const { user } = useAuth()
  const { bonus, success } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  // Form State
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('8')
  const [category, setCategory] = useState('Brownies')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedPresetImage, setSelectedPresetImage] = useState<string>('/images/real_brownie.jpg')
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
  const myProductIds = new Set(mine.map((p) => p.id))

  const mySellingOrders = orders.filter((order) => {
    if (!user) return false
    const sKey = order.sellerKey || ''
    const sName = (order.sellerName || '').trim().toLowerCase()
    const uName = (user.name || '').trim().toLowerCase()
    const uId = user.id.toLowerCase()
    const matchesProduct = order.items?.some((item) => myProductIds.has(item.productId))

    return (
      sKey.toLowerCase().endsWith(`::${uId}`) ||
      sKey.toLowerCase() === uId ||
      sKey.toLowerCase() === uName ||
      sName === uName ||
      matchesProduct ||
      ownsListing(order.sellerKey, user.id, user.name)
    )
  })

  // Financial calculations
  const parsedPrice = parseInt(price, 10) || 0
  const bocadoFee = parsedPrice > 0 ? calculateProductCommission(parsedPrice) : 0
  const netEarnings = Math.max(0, parsedPrice - bocadoFee)

  const handleApplyPreset = (preset: typeof PRESET_IMAGES[0]) => {
    playKeyBeep(600)
    setName(preset.name)
    setPrice(preset.price)
    setCategory(preset.cat)
    setSelectedPresetImage(preset.img)
    setFile(null)
    setPreview(null)
  }

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.files?.[0]
    if (!next) return
    setFile(next)
    setPreview(URL.createObjectURL(next))
  }

  const handlePublish = async () => {
    if (!name.trim()) {
      setError('Escribe el nombre de tu snack')
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

    setUploading(true)
    setError('')

    try {
      let imageUrl: string | null = preview ? null : selectedPresetImage
      if (file) {
        imageUrl = await uploadProductImage(file)
      }

      const created = await insertProduct({
        name: name.trim(),
        price: numPrice,
        stock: numStock,
        sold_out: false,
        seller: encodeSeller(user.name, user.id),
        intent_count: 0,
        image_url: imageUrl || '/images/real_brownie.jpg',
        category: joinTags([category]),
        description: description.trim() || undefined,
      })

      if (!created) throw new Error('No se pudo publicar el snack. Intenta de nuevo.')

      playPaymentSuccess()
      bonus('¡Snack publicado con éxito!', `${name.trim()} ya está visible para los estudiantes en el catálogo.`)
      setPublishSuccess(true)
      setTimeout(() => setPublishSuccess(false), 3000)

      // Reset
      setName('')
      setPrice('')
      setStock('8')
      setDescription('')
      setFile(null)
      setPreview(null)
      setSelectedPresetImage('/images/real_brownie.jpg')
      void refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al publicar snack')
    } finally {
      setUploading(false)
    }
  }

  const handleAdjustStock = async (prod: Product, delta: number) => {
    playKeyBeep(delta > 0 ? 700 : 450)
    const next = Math.max(0, prod.stock + delta)
    const isSoldOut = next === 0
    setProducts((prev) => prev.map((p) => (p.id === prod.id ? { ...p, stock: next, sold_out: isSoldOut } : p)))
    await updateProduct(prod.id, { stock: next, sold_out: isSoldOut })
  }

  const handleDelete = async (prod: Product) => {
    if (!confirm(`¿Seguro que deseas eliminar "${prod.name}"?`)) return
    setProducts((prev) => prev.filter((p) => p.id !== prod.id))
    await deleteProduct(prod.id)
    success('Producto retirado de la venta.')
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-[#E5DFD7] dark:border-[#2C2420] pb-6">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#B8385E] dark:text-[#D94668] font-bold block mb-1">
              Estudio de Creación · Chef {user.name}
            </span>
            <h1 className="font-display text-3xl font-black sm:text-4xl text-[#2C221C] dark:text-[#FAF6F0]">
              Cocina & Publicación de Snacks
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#7E726A] dark:text-[#A89C92]">
              Publica tus preparaciones artesanales. Los domiciliarios las entregan en el campus sin que tengas que dejar tu salón.
            </p>
          </div>

          <Link
            to="/pedidos?tab=ventas"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#FAF6F5] dark:bg-[#1D102E] border border-[#EFE8E6] dark:border-[#2D1945] px-4 py-2.5 text-xs font-display font-bold text-[#1E0C30] dark:text-[#F6EEF2] hover:border-[#B8385E] transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Store size={15} className="text-[#B8385E]" />
            <span>Ver Pedidos de mi Cocina ({mySellingOrders.length})</span>
          </Link>
        </div>

        {/* ========================================================= */}
        {/* INTERACTIVE PRODUCT CREATOR (Bento Studio + Live Preview) */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Left Column */}
          <div className="lg:col-span-7 space-y-6 rounded-3xl border border-[#EFE8E6] dark:border-[#2D1945] bg-white dark:bg-[#1D102E] p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#B8385E] dark:text-[#D94668]">
              <Sparkles size={14} />
              <span>Nuevo Snack para el Campus</span>
            </div>

            {/* Snack Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1E0C30] dark:text-[#F6EEF2] block">
                Nombre de la Preparación
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Brownie con Arequipe y Nueces"
                className="w-full rounded-2xl border border-[#EFE8E6] dark:border-[#2D1945] bg-[#FAF6F5] dark:bg-[#25153A] px-4 py-3 text-sm font-semibold text-[#1E0C30] dark:text-[#F6EEF2] outline-none transition-all focus:border-[#B8385E]"
              />
            </div>

            {/* Category Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1E0C30] dark:text-[#F6EEF2] block">
                Categoría del Snack
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORY_OPTIONS.map((cat) => {
                  const active = category === cat.id
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => {
                        playKeyBeep(550)
                        setCategory(cat.id)
                      }}
                      className={`flex items-center gap-1.5 rounded-xl border p-2.5 text-xs font-display font-bold transition-all cursor-pointer ${
                        active
                          ? 'border-[#B8385E] bg-[#B8385E] text-white shadow-xs'
                          : 'border-[#EFE8E6] dark:border-[#2D1945] bg-[#FAF6F5] dark:bg-[#25153A] text-[#756272] hover:text-[#1E0C30]'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span className="truncate">{cat.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Price & Real-Time Financial Pill */}
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1E0C30] dark:text-[#F6EEF2] block">
                    Precio al Comprador (COP)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Ej. 4500"
                    className="w-full rounded-2xl border border-[#EFE8E6] dark:border-[#2D1945] bg-[#FAF6F5] dark:bg-[#25153A] px-4 py-3 font-mono text-base font-black text-[#B8385E] dark:text-[#D94668] outline-none transition-all focus:border-[#B8385E]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C221C] dark:text-[#FAF6F0] block">
                    Stock Disponible Inicial
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setStock((prev) => Math.max(1, (parseInt(prev, 10) || 1) - 1).toString())}
                      className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E5DFD7] dark:border-[#2C2420] bg-[#FAF6F0] dark:bg-[#251F1C] text-[#2C221C] dark:text-[#FAF6F0] font-bold hover:bg-[#EFE8DE] cursor-pointer"
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full text-center rounded-2xl border border-[#E5DFD7] dark:border-[#2C2420] bg-[#FAF6F0] dark:bg-[#251F1C] py-2.5 font-mono text-base font-bold text-[#2C221C] dark:text-[#FAF6F0] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setStock((prev) => ((parseInt(prev, 10) || 1) + 1).toString())}
                      className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E5DFD7] dark:border-[#2C2420] bg-[#FAF6F0] dark:bg-[#251F1C] text-[#2C221C] dark:text-[#FAF6F0] font-bold hover:bg-[#EFE8DE] cursor-pointer"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Financial Transparency Capsule */}
              {parsedPrice > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-[#FAF6F0] dark:bg-[#251F1C] p-3 border border-[#E5DFD7] dark:border-[#2C2420] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-[#2C221C] dark:text-[#FAF6F0]">Tu ingreso neto por unidad:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black">
                      {money(netEarnings)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#7E726A]">
                    <span>Comisión fija Bocado:</span>
                    <span className="font-mono">-{money(bocadoFee)} COP</span>
                  </div>
                  <p className="text-[10px] text-[#7E726A] pt-1 border-t border-[#E5DFD7]/60">
                    El valor de domicilio ($100 a $500 COP) lo aporta el comprador directamente al Domiciliario.
                  </p>
                </motion.div>
              )}
            </div>

            {/* Preset Images or Custom Upload */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2C221C] dark:text-[#FAF6F0] block">
                Fotografía del Producto
              </label>

              {/* Quick Preset Selector */}
              <div>
                <span className="text-[11px] font-mono text-[#7E726A] block mb-1.5">
                  Elige una foto artesanal lista o sube la tuya:
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_IMAGES.map((preset) => {
                    const active = !preview && selectedPresetImage === preset.img
                    return (
                      <button
                        type="button"
                        key={preset.name}
                        onClick={() => handleApplyPreset(preset)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          active ? 'border-[#B8385E] scale-98 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={preset.img} alt={preset.name} className="h-full w-full object-cover" />
                        {active && (
                          <div className="absolute inset-0 bg-[#B8385E]/20 flex items-center justify-center">
                            <Check size={16} className="text-white drop-shadow-sm" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Custom Upload Button */}
              <div className="pt-1">
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[#EFE8E6] dark:border-[#2D1945] bg-[#FAF6F5] dark:bg-[#25153A] py-3 text-xs font-bold text-[#756272] hover:border-[#B8385E] hover:text-[#B8385E] transition-colors cursor-pointer"
                >
                  <UploadCloud size={16} />
                  <span>{preview ? 'Cambiar Foto Subida' : 'O Subir Foto Propia desde mi Dispositivo'}</span>
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs font-bold text-destructive bg-red-50 dark:bg-red-950/40 p-3 rounded-xl border border-red-200">
                {error}
              </p>
            )}

            {publishSuccess && (
              <p className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200">
                ✓ ¡Snack publicado exitosamente!
              </p>
            )}

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              disabled={uploading}
              onClick={() => void handlePublish()}
              className="w-full rounded-2xl bg-[#B8385E] hover:bg-[#A32F51] py-4 font-display text-sm font-black text-white shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {uploading ? (
                <span>Publicando en el Campus...</span>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Publicar Snack en el Catálogo</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Live Floating Preview Card Right Column */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#7E726A]">
                Vista Previa en Vivo:
              </span>
              <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200">
                En Vivo
              </span>
            </div>

            <motion.div
              layout
              className="rounded-3xl border border-[#E5DFD7] dark:border-[#2C2420] bg-white dark:bg-[#1E1917] p-4 shadow-lg space-y-3"
            >
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-[#F5EFEB] dark:bg-[#251F1C]">
                <img
                  src={preview || selectedPresetImage}
                  alt={name || 'Vista previa del snack'}
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 rounded-full bg-white/90 backdrop-blur-xs px-2.5 py-1 text-[10px] font-mono font-bold text-[#2C221C] shadow-xs">
                  {category}
                </div>
              </div>

              <div className="pt-1 space-y-2">
                <div>
                  <span className="text-[11px] font-mono text-[#7E726A] block">
                    Por Chef {user.name}
                  </span>
                  <h3 className="font-display text-lg font-black text-[#2C221C] dark:text-[#FAF6F0]">
                    {name.trim() || 'Nombre de tu Snack'}
                  </h3>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#EFE8E6] dark:border-[#2D1945]">
                  <div>
                    <span className="text-[10px] font-mono text-[#756272] block uppercase font-bold">
                      Precio:
                    </span>
                    <span className="font-display text-xl font-black text-[#B8385E] dark:text-[#D94668]">
                      {money(parsedPrice || 4500)}
                    </span>
                  </div>

                  <span className="rounded-xl bg-[#FAF6F5] dark:bg-[#25153A] border border-[#EFE8E6] dark:border-[#2D1945] px-3 py-1.5 text-xs font-bold text-[#756272]">
                    {stock} disponibles
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* EXISTING PUBLISHED SNACKS TABLE / GRID                    */}
        {/* ========================================================= */}
        <div className="space-y-4 pt-6 border-t border-[#EFE8E6] dark:border-[#2D1945]">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-[#1E0C30] dark:text-[#F6EEF2]">
              Tus Snacks Publicados ({mine.length})
            </h2>
            <span className="text-xs font-mono text-[#756272]">
              Control de inventario en tiempo real
            </span>
          </div>

          {mine.length === 0 ? (
            <div className="py-12 text-center rounded-3xl border border-dashed border-[#EFE8E6] dark:border-[#2D1945] p-6 space-y-2">
              <Package size={36} className="mx-auto text-[#756272] opacity-40" />
              <p className="text-xs font-bold text-[#756272]">Aún no has publicado ningún snack.</p>
              <p className="text-[11px] text-[#756272]">Completa el formulario superior para lanzar tu primer producto.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mine.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-[#EFE8E6] dark:border-[#2D1945] bg-white dark:bg-[#1D102E] shadow-xs gap-3"
                >
                  <img
                    src={prod.image_url || '/images/real_brownie.jpg'}
                    alt={prod.name}
                    className="h-16 w-16 rounded-xl object-cover shrink-0 bg-[#FAF6F5]"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-sm font-bold text-[#1E0C30] dark:text-[#F6EEF2] truncate">
                      {prod.name}
                    </h4>
                    <span className="font-mono text-xs font-bold text-[#B8385E] dark:text-[#D94668] block">
                      {money(prod.price)}
                    </span>
                    <span className={`text-[10px] font-mono font-bold ${prod.sold_out || prod.stock === 0 ? 'text-destructive' : 'text-emerald-600'}`}>
                      {prod.sold_out || prod.stock === 0 ? 'Agotado' : `${prod.stock} en stock`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => void handleAdjustStock(prod, -1)}
                      className="h-8 w-8 rounded-lg border border-[#E5DFD7] dark:border-[#2C2420] flex items-center justify-center text-xs font-bold hover:bg-[#FAF6F0]"
                    >
                      -
                    </button>
                    <span className="font-mono text-xs font-bold w-6 text-center">{prod.stock}</span>
                    <button
                      type="button"
                      onClick={() => void handleAdjustStock(prod, +1)}
                      className="h-8 w-8 rounded-lg border border-[#E5DFD7] dark:border-[#2C2420] flex items-center justify-center text-xs font-bold hover:bg-[#FAF6F0]"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(prod)}
                      className="h-8 w-8 rounded-lg text-[#7E726A] hover:text-destructive flex items-center justify-center ml-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
