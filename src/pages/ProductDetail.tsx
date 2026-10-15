import {
  ArrowLeft,
  Bike,
  BookmarkCheck,
  Flame,
  MapPin,
  MessageCircle,
  Receipt,
  Store,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { TagList } from '../components/TagList'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { fetchProduct, incrementMetric, updateProduct } from '../lib/api'
import { sendMessage } from '../lib/chat'
import { DELIVERY_FEE, PICKUP_POINTS } from '../lib/constants'
import { displaySeller, initials, money, ownsListing, parseTags, productDescription, sellerUserId } from '../lib/format'
import { playPaymentSuccess } from '../lib/sounds'
import { saveOrder } from '../lib/storage-db'
import type { Order, Product } from '../types'

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { add } = useCart()
  const navigate = useNavigate()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [deliveryLocation, setDeliveryLocation] = useState<string>(PICKUP_POINTS[0] || 'Edificio D (Plazoleta / Pisos)')
  const [apartadoDone, setApartadoDone] = useState(false)
  const [apartadoOrderId, setApartadoOrderId] = useState<string | null>(null)
  const [confirmedTotal, setConfirmedTotal] = useState(0)
  const [isApartando, setIsApartando] = useState(false)

  useEffect(() => {
    if (!id) return
    void fetchProduct(id).then((p) => {
      setProduct(p)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return <p className="py-20 text-center text-sm text-muted-foreground animate-pulse">Cargando snack...</p>
  }

  if (!product) {
    return (
      <div className="py-20 text-center space-y-3">
        <p className="font-display text-lg font-bold">Snack no encontrado</p>
        <Link to="/catalogo" className="inline-block rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">
          Volver al catálogo
        </Link>
      </div>
    )
  }

  const sellerId = sellerUserId(product.seller)
  const sellerName = displaySeller(product.seller)
  const isMyProduct = user ? ownsListing(product.seller, user.id, user.name) : false
  const isLowStock = product.stock > 0 && product.stock <= 3

  const handleApartar = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/producto/${product.id}` } })
      return
    }

    setIsApartando(true)
    try {
      playPaymentSuccess()
      const orderId = crypto.randomUUID()
      const itemsTotal = product.price * qty
      const deliveryFee = DELIVERY_FEE // 200 COP
      const orderTotal = itemsTotal + deliveryFee
      const commission = Math.round(itemsTotal * 0.05)
      const netRevenue = itemsTotal - commission
      const finalLoc = deliveryLocation.trim() || 'Edificio D (Plazoleta / Pisos)'

      const order: Order = {
        id: orderId,
        buyerId: user.id,
        buyerName: user.name,
        buyerEmail: user.email,
        sellerKey: product.seller,
        sellerName,
        items: [
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            qty,
            image_url: product.image_url,
          },
        ],
        total: orderTotal,
        pickup: `Edificio ${product.preferredBuilding || 'D'}`,
        deliveryLocation: finalLoc,
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

      await saveOrder(order)

      await sendMessage({
        conversationId: `order_${orderId}`,
        senderId: user.id,
        senderName: user.name,
        recipientId: sellerId,
        recipientName: sellerName,
        orderId,
        productId: product.id,
        productName: product.name,
        text: `👋 ¡Hola ${sellerName}! He solicitado ${qty}x ${product.name} (${money(itemsTotal)}) con domicilio a ${finalLoc}. Un Tendedero recogerá el snack en Edificio ${product.preferredBuilding || 'D'}.`,
        messageType: 'text',
      })

      add(product, qty)
      void updateProduct(product.id, { intent_count: product.intent_count + qty })
      void incrementMetric('total_intents')
      setApartadoOrderId(orderId)
      setConfirmedTotal(orderTotal)
      setApartadoDone(true)
    } finally {
      setIsApartando(false)
    }
  }

  const handleStartChat = () => {
    if (!user) {
      navigate('/login', { state: { from: `/producto/${product.id}` } })
      return
    }
    if (isMyProduct) {
      navigate('/vender')
      return
    }
    const convQuery = apartadoOrderId ? `conv=order_${apartadoOrderId}&orderId=${apartadoOrderId}&` : ''
    navigate(
      `/mensajes?${convQuery}partnerId=${encodeURIComponent(sellerId)}&partnerName=${encodeURIComponent(
        sellerName,
      )}&productId=${encodeURIComponent(product.id)}&productName=${encodeURIComponent(product.name)}`,
    )
  }

  const displayImage = (() => {
    const raw = product.image_url
    if (raw && !raw.includes('snack_anime') && (raw.startsWith('http') || raw.startsWith('/images/real_'))) {
      return raw
    }
    const nameLower = (product.name + ' ' + (product.category || '')).toLowerCase()
    if (nameLower.includes('brownie') || nameLower.includes('chocolate')) return '/images/real_brownie.jpg'
    if (nameLower.includes('parfait') || nameLower.includes('yogur') || nameLower.includes('chia') || nameLower.includes('fruta')) {
      return '/images/real_parfait.jpg'
    }
    if (nameLower.includes('empanada') || nameLower.includes('pastel') || nameLower.includes('pollo')) {
      return '/images/real_empanadas.jpg'
    }
    if (nameLower.includes('galleta') || nameLower.includes('cookie') || nameLower.includes('avena')) {
      return '/images/real_cookies.jpg'
    }
    if (nameLower.includes('rollo') || nameLower.includes('canela')) return '/images/real_cinnamon_roll.jpg'
    if (nameLower.includes('cheesecake') || nameLower.includes('torta')) return '/images/real_cheesecake.jpg'
    return '/images/real_brownie.jpg'
  })()

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      <Link
        to="/catalogo"
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        Volver al catálogo de snacks
      </Link>

      <div className="grid gap-8 rounded-3xl border border-border/80 bg-card p-6 shadow-xl lg:grid-cols-2 lg:p-8">
        {/* Left Column: Image */}
        <div className="relative overflow-hidden rounded-2xl bg-secondary/50 border border-border/50">
          <img
            src={displayImage}
            alt={product.name}
            className="h-80 w-full object-cover sm:h-96 rounded-2xl"
          />

          {isLowStock && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white shadow-lg animate-pulse">
              <Flame size={14} /> ¡Últimas {product.stock} unidades!
            </div>
          )}
        </div>

        {/* Right Column: Info & Actions */}
        <div className="flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Seller Header Box */}
            <div className="flex items-center justify-between rounded-2xl border border-border bg-secondary/50 p-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 font-display text-sm font-bold text-primary">
                  {initials(sellerName)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold">{sellerName}</span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      Cocinero Universitario
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Store size={12} className="text-primary" />
                    <span>Emprendedor del Campus Icesi</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartChat}
                className="flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-display font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <MessageCircle size={14} />
                <span>{isMyProduct ? 'Mi Panel' : 'Chatear'}</span>
              </button>
            </div>

            {/* Title & Description */}
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
                {product.name}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {productDescription(product)}
              </p>
            </div>

            {/* Dietary Tags */}
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5 font-mono">
                Etiquetas e ingredientes
              </span>
              <TagList tags={parseTags(product.category)} size="md" />
            </div>

            {/* Price & Stock */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="font-display text-3xl font-extrabold text-primary">{money(product.price)}</span>
              <span className="text-xs text-muted-foreground">
                {product.stock > 0 ? `${product.stock} disponibles en campus` : 'Agotado por hoy'}
              </span>
            </div>
          </div>

          {/* Quantity and Order CTAs */}
          <div className="border-t border-border pt-5 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                Cantidad:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQty((n) => Math.max(1, n - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-sm font-bold hover:bg-secondary/80 active:scale-95"
                >
                  -
                </button>
                <span className="min-w-8 text-center font-display text-base font-bold">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((n) => Math.min(product.stock, n + 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-sm font-bold hover:bg-secondary/80 active:scale-95"
                >
                  +
                </button>
              </div>
            </div>

            {/* Delivery Location Selector */}
            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <MapPin size={14} className="text-primary" /> ¿Dónde te encuentras en el campus para la entrega?
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

            {/* Transparent Receipt Breakdown */}
            <div className="rounded-2xl bg-secondary/60 p-3.5 space-y-1.5 text-xs border border-border/60">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal snacks ({qty} uds):</span>
                <span className="font-mono font-semibold">{money(product.price * qty)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span className="flex items-center gap-1 text-primary font-medium">
                  <Bike size={13} /> Envío Tendedero en campus:
                </span>
                <span className="font-mono font-bold text-primary">+{money(DELIVERY_FEE)} COP</span>
              </div>
              <div className="flex justify-between font-bold text-foreground pt-1.5 border-t border-border/60 text-sm">
                <span>Total a pagar:</span>
                <span className="font-mono text-primary font-extrabold">
                  {money(product.price * qty + DELIVERY_FEE)}
                </span>
              </div>
            </div>

            {apartadoDone ? (
              <div className="rounded-2xl border-2 border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 p-4 space-y-3 animate-fadeIn text-center">
                <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-display font-bold text-sm">
                  <Receipt size={18} />
                  <span>¡Solicitud de Entrega Campus Creada!</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tu pedido de <strong>{qty}x {product.name}</strong> por <strong>{money(confirmedTotal)}</strong> fue emitido a los Tendederos. Te lo llevarán a <strong>{deliveryLocation}</strong>.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleStartChat}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-[#751010] py-2.5 text-xs font-display font-bold text-white shadow-xs transition-colors cursor-pointer"
                  >
                    <MessageCircle size={14} />
                    <span>Chatear con el Cocinero</span>
                  </button>
                  <Link
                    to="/pedidos"
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary py-2.5 text-xs font-display font-semibold text-foreground hover:bg-secondary/80"
                  >
                    <BookmarkCheck size={14} className="text-primary" />
                    <span>Ver Mis Pedidos</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={isApartando || product.sold_out || product.stock <= 0}
                  onClick={() => void handleApartar()}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-[#751010] py-4 font-display text-sm font-bold text-white shadow-md transition-transform active:scale-95 disabled:opacity-40 cursor-pointer"
                >
                  <Bike size={18} />
                  {isApartando ? 'Creando pedido...' : `Pedir con Domicilio (${money(product.price * qty + DELIVERY_FEE)})`}
                </button>
                <button
                  type="button"
                  onClick={handleStartChat}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-secondary px-6 py-4 font-display text-sm font-semibold text-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
                >
                  <MessageCircle size={18} />
                  <span>Chatear</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

