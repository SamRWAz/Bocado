import {
  Bike,
  Filter,
  MapPin,
  MessageCircle,
  Receipt,
  Search,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { fetchProducts, incrementMetric, updateProduct } from '../lib/api'
import { DIETARY_OPTIONS } from '../lib/campus'
import { sendMessage } from '../lib/chat'
import { DELIVERY_FEE, FILTERS, PICKUP_POINTS } from '../lib/constants'
import { displaySeller, hasTag, money, sellerUserId } from '../lib/format'
import { playKeyBeep, playPaymentSuccess } from '../lib/sounds'
import { saveOrder } from '../lib/storage-db'
import type { Order, Product } from '../types'

export function CatalogPage() {
  const { user } = useAuth()
  const { add } = useCart()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<(typeof FILTERS)[number]>('Todos')
  const [dietaryFilter, setDietaryFilter] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  // Confirmation Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [deliveryLocation, setDeliveryLocation] = useState<string>('Edificio D (Plazoleta / Pisos)')
  const [apartadoSuccess, setApartadoSuccess] = useState<{ product: Product; orderId: string; total: number; location: string } | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const list = await fetchProducts()
    setProducts(list)
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const handleOpenApartarModal = (product: Product) => {
    if (!user) {
      navigate('/login', { state: { from: `/catalogo` } })
      return
    }
    setSelectedProduct(product)
  }

  const handleConfirmApartar = async () => {
    if (!selectedProduct) return
    if (!user) {
      navigate('/login', { state: { from: `/catalogo` } })
      return
    }

    setIsProcessing(true)
    try {
      playPaymentSuccess()

      const sId = sellerUserId(selectedProduct.seller)
      const sName = displaySeller(selectedProduct.seller)
      const orderId = crypto.randomUUID()
      const deliveryFee = DELIVERY_FEE // 200 COP
      const orderTotal = selectedProduct.price + deliveryFee
      const commission = Math.round(selectedProduct.price * 0.05)
      const netRevenue = selectedProduct.price - commission

      const order: Order = {
        id: orderId,
        buyerId: user.id,
        buyerName: user.name,
        buyerEmail: user.email,
        sellerKey: selectedProduct.seller,
        sellerName: sName,
        items: [
          {
            productId: selectedProduct.id,
            name: selectedProduct.name,
            price: selectedProduct.price,
            qty: 1,
            image_url: selectedProduct.image_url,
          },
        ],
        total: orderTotal,
        pickup: `Edificio ${selectedProduct.preferredBuilding || 'D'}`,
        deliveryLocation: deliveryLocation.trim() || 'Edificio D (Plazoleta / Pisos)',
        deliveryFee,
        note: '',
        status: 'solicitado',
        createdAt: new Date().toISOString(),
        isGuaranteed: false,
        platformCommission: commission,
        sellerNetRevenue: netRevenue,
        tendederoConfirmed: false,
        buyerConfirmed: false,
        sellerPaidConfirmed: false,
      }

      // 1. Save order in storage DB for seller and tendederos
      await saveOrder(order)

      // 2. Notify seller via live chat message
      await sendMessage({
        conversationId: `order_${orderId}`,
        senderId: user.id,
        senderName: user.name,
        recipientId: sId,
        recipientName: sName,
        orderId,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        text: `👋 ¡Hola ${sName}! He solicitado 1x ${selectedProduct.name} (${money(selectedProduct.price)}) con domicilio a ${order.deliveryLocation}. Un Tendedero recogerá el snack en Edificio ${selectedProduct.preferredBuilding || 'D'}.`,
        messageType: 'text',
      })

      // 3. Add to cart & increment metrics
      add(selectedProduct, 1)
      void updateProduct(selectedProduct.id, {
        intent_count: (selectedProduct.intent_count || 0) + 1,
      })
      void incrementMetric('total_intents')

      const confirmed = selectedProduct
      const chosenLoc = order.deliveryLocation || 'Edificio D (Plazoleta / Pisos)'
      setSelectedProduct(null)
      setApartadoSuccess({ product: confirmed, orderId, total: orderTotal, location: chosenLoc })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGoToChat = (item: { product: Product; orderId: string; total: number; location: string }) => {
    const sId = sellerUserId(item.product.seller)
    const sName = displaySeller(item.product.seller)
    if (!user) {
      navigate('/login', { state: { from: `/catalogo` } })
      return
    }
    navigate(
      `/mensajes?conv=order_${item.orderId}&partnerId=${encodeURIComponent(
        sId,
      )}&partnerName=${encodeURIComponent(sName)}&orderId=${item.orderId}&productName=${encodeURIComponent(
        item.product.name,
      )}&productId=${encodeURIComponent(item.product.id)}`,
    )
  }


  // Filter products
  const availableProducts = products.filter((p) => !p.sold_out && p.stock > 0)

  const filtered = availableProducts.filter((product) => {
    const q = query.toLowerCase()
    const matchesQuery =
      !q ||
      product.name.toLowerCase().includes(q) ||
      product.category.toLowerCase().includes(q) ||
      product.seller.toLowerCase().includes(q)

    const matchesCategory = category === 'Todos' || hasTag(product.category, category)

    const matchesDietary =
      !dietaryFilter ||
      hasTag(product.category, dietaryFilter) ||
      (product.dietary && product.dietary.includes(dietaryFilter as never))

    return matchesQuery && matchesCategory && matchesDietary
  })

  return (
    <div className={user ? 'space-y-6' : 'mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6'}>
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary font-mono">
            <Sparkles size={14} />
            <span>Catálogo Libre en Campus Icesi</span>
          </div>
          <h1 className="mt-1 font-display text-3xl font-black tracking-tight sm:text-4xl text-foreground">
            Snacks y Postres Disponibles
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Explora las preparaciones de hoy, pide tu favorito y recíbelo directo donde estés con los Tendederos de Icesi.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:max-w-xs">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar brownie, galleta, vegano..."
            className="w-full rounded-2xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Main Filter Bar */}
      <div className="space-y-3 rounded-3xl border border-border/80 bg-card p-5 shadow-sm">
        {/* Categories Carousel */}
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-2 font-mono">
            Categorías
          </span>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {FILTERS.map((filter) => {
              const active = category === filter
              const icons: Record<string, string> = {
                Todos: '✨',
                Brownies: '🍫',
                Galletas: '🍪',
                Alfajores: '🍯',
                'Salado & Empanadas': '🥟',
                'Fit & Proteína': '🥑',
                'Tortas & Postres': '🍰',
                'Bebidas & Fruta': '🍓',
                'Dulces & Gomitas': '🍬',
                Combos: '🎁',
              }
              const icon = icons[filter] || '✨'
              return (
                <button
                  type="button"
                  key={filter}
                  onClick={() => {
                    playKeyBeep(500)
                    setCategory(filter)
                  }}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs font-display font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#8F1414] text-white shadow-xs'
                      : 'bg-secondary text-foreground/80 hover:bg-secondary hover:text-foreground border border-border/60'
                  }`}
                >
                  <span>{icon}</span>
                  <span>{filter}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Dietary Filter */}
        <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-border/60">
          <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mr-1">
            <Filter size={12} /> Dieta:
          </span>
          <button
            type="button"
            onClick={() => setDietaryFilter(null)}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
              dietaryFilter === null ? 'bg-[#8F1414] text-white' : 'bg-secondary text-muted-foreground'
            }`}
          >
            Cualquiera
          </button>
          {DIETARY_OPTIONS.slice(0, 5).map((opt) => {
            const active = dietaryFilter === opt.shortLabel || dietaryFilter === opt.id
            return (
              <button
                type="button"
                key={opt.id}
                onClick={() => setDietaryFilter(active ? null : opt.shortLabel)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#8F1414] text-white'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                <span>{opt.icon}</span>
                <span>{opt.shortLabel}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          <p className="animate-pulse">Cargando catálogo universitario...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-border bg-card/40 p-8">
          <ShoppingBag size={48} className="mx-auto mb-3 text-muted-foreground/40" />
          <h3 className="font-display text-lg font-bold">No se encontraron snacks con estos filtros</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Prueba cambiando la categoría o la dieta seleccionada.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setCategory('Todos')
              setDietaryFilter(null)
            }}
            className="mt-4 rounded-xl bg-primary px-4 py-2 font-display text-xs font-bold text-primary-foreground"
          >
            Restablecer filtros
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Mostrando <strong className="text-foreground">{filtered.length}</strong> snacks disponibles para apartar
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onApartar={handleOpenApartarModal}
              />
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: CONFIRMACIÓN DE PEDIDO Y DOMICILIO EN CAMPUS       */}
      {/* ========================================================= */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl border-2 border-primary/40 bg-card p-6 shadow-2xl space-y-5">
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                <Bike size={26} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-primary">
                  Domicilio en Campus Universitario
                </span>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Solicitar Snack con Tendedero
                </h3>
              </div>
            </div>

            {/* Snack Summary Card */}
            <div className="rounded-2xl border border-border/80 bg-secondary/40 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedProduct.image_url && !selectedProduct.image_url.includes('snack_anime') ? selectedProduct.image_url : '/images/real_brownie.jpg'}
                  alt={selectedProduct.name}
                  className="h-14 w-14 rounded-xl object-cover border border-border/80 shadow-xs"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-bold text-foreground text-sm truncate">
                    {selectedProduct.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Cocinero: {displaySeller(selectedProduct.seller)} · Punto recogida: Edificio {selectedProduct.preferredBuilding || 'D'}
                  </p>
                </div>
              </div>

              {/* Selector de Punto de Entrega en el campus */}
              <div className="space-y-1.5 pt-2 border-t border-border/60">
                <label className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                  <MapPin size={13} className="text-primary" /> ¿Dónde te encuentras en la U para la entrega?
                </label>
                <select
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                >
                  {PICKUP_POINTS.map((pt) => (
                    <option key={pt} value={pt}>
                      {pt}
                    </option>
                  ))}
                  <option value="Biblioteca Central - Piso 2">Biblioteca Central - Piso 2</option>
                  <option value="Edificio E (Ingeniería) - Aulas">Edificio E (Ingeniería) - Aulas</option>
                  <option value="El Samán - Bancas exteriores">El Samán - Bancas exteriores</option>
                </select>
              </div>

              {/* Desglose Transparente del Recibo */}
              <div className="rounded-xl bg-card p-3 space-y-1.5 text-xs border border-border/60">
                <div className="flex justify-between text-muted-foreground">
                  <span>Precio del snack:</span>
                  <span className="font-mono">{money(selectedProduct.price)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span className="flex items-center gap-1 text-primary font-medium">
                    <Bike size={12} /> Costo de envío (Tendedero):
                  </span>
                  <span className="font-mono font-bold text-primary">+$200 COP</span>
                </div>
                <div className="flex justify-between font-bold text-foreground pt-1.5 border-t border-border/40 text-sm">
                  <span>Total a pagar:</span>
                  <span className="font-mono text-primary font-extrabold">
                    {money(selectedProduct.price + 200)}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              💡 Un <strong>Tendedero</strong> (mensajero universitario) verá tu solicitud, irá por el producto con el cocinero y te lo entregará en <strong>{deliveryLocation}</strong>.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setSelectedProduct(null)}
                className="flex-1 rounded-xl border border-border bg-secondary py-3 text-xs font-display font-semibold text-foreground hover:bg-secondary/80 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmApartar}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary hover:opacity-90 py-3 text-xs font-display font-bold text-primary-foreground shadow-xs active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Bike size={15} />
                <span>{isProcessing ? 'Creando pedido...' : `Pedir (${money(selectedProduct.price + 200)})`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: RECIBO DE CONFIRMACIÓN & ESTADO DE SOLICITUD     */}
      {/* ========================================================= */}
      {apartadoSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl border-2 border-border bg-card p-6 shadow-2xl space-y-5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Receipt size={32} />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
                ¡Solicitud de Pedido Creada!
              </span>
              <h3 className="font-display text-xl font-bold text-foreground">
                Recibo de Entrega Campus
              </h3>
              <p className="text-xs text-muted-foreground">
                Tu solicitud ya está en la bandeja de los Tendederos en campus.
              </p>
            </div>

            {/* Ticket del Recibo */}
            <div className="rounded-2xl bg-secondary/80 p-4 text-xs text-left space-y-2.5 border border-border">
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="font-mono font-semibold text-muted-foreground">Snack:</span>
                <span className="font-bold text-foreground">{apartadoSuccess.product.name}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Cocinero:</span>
                <span className="font-medium text-foreground">{displaySeller(apartadoSuccess.product.seller)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Punto de Entrega:</span>
                <span className="font-semibold text-foreground">{apartadoSuccess.location}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Costo de Domicilio:</span>
                <span className="font-mono font-bold text-emerald-600">+$200 COP</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-border/60 font-bold text-sm">
                <span>Total a Pagar:</span>
                <span className="font-mono text-primary font-black">{money(apartadoSuccess.total)}</span>
              </div>

              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-2.5 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                <span>Estado: Esperando que un Tendedero acepte tu entrega...</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <Link
                to="/pedidos"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:opacity-90 py-3.5 text-xs font-display font-bold text-primary-foreground shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Bike size={16} />
                <span>Seguir Pedido en Mis Pedidos</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  const item = apartadoSuccess
                  setApartadoSuccess(null)
                  handleGoToChat(item)
                }}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary py-3 text-xs font-display font-semibold text-foreground hover:bg-secondary/80 transition-colors"
              >
                <MessageCircle size={15} className="text-primary" />
                <span>Chatear con el Cocinero</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
