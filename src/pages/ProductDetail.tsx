import {
  ArrowLeft,
  Bike,
  CheckCircle2,
  Flame,
  MapPin,
  Receipt,
  ShoppingCart,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageTransition } from '../components/PageTransition'
import { TagList } from '../components/TagList'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { fetchProduct, incrementMetric, updateProduct } from '../lib/api'
import { PICKUP_POINTS } from '../lib/constants'
import { displaySeller, initials, money, ownsListing, parseTags, productDescription, sellerUserId } from '../lib/format'
import { computeOrderFinancials } from '../lib/pricing'
import { playKeyBeep, playPaymentSuccess } from '../lib/sounds'
import { saveOrder } from '../lib/storage-db'
import type { Order, Product } from '../types'

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { add } = useCart()
  const { success, bonus } = useToast()
  const navigate = useNavigate()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [deliveryLocation, setDeliveryLocation] = useState<string>(PICKUP_POINTS[0] || 'Edificio D (Plazoleta / Pisos)')
  const [orderDone, setOrderDone] = useState(false)
  const [confirmedTotal, setConfirmedTotal] = useState(0)
  const [isOrdering, setIsOrdering] = useState(false)

  useEffect(() => {
    if (!id) return
    let active = true
    setLoading(true)
    fetchProduct(id)
      .then((p) => {
        if (active) setProduct(p)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="font-display text-xl font-bold">Snack no encontrado</p>
        <Link to="/catalogo" className="inline-block rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white">
          Volver al catálogo
        </Link>
      </div>
    )
  }

  const sellerId = sellerUserId(product.seller)
  const sellerName = displaySeller(product.seller)
  const isMyProduct = user ? ownsListing(product.seller, user.id, user.name) : false

  const financials = computeOrderFinancials([{ price: product.price, qty }])

  const handleOrderWithDelivery = async () => {
    if (isMyProduct) return
    if (!user) {
      navigate('/login', { state: { from: `/producto/${product.id}` } })
      return
    }

    setIsOrdering(true)
    try {
      playPaymentSuccess()
      const orderId = `order_${Date.now()}`
      const finalLoc = deliveryLocation.trim() || 'Campus Icesi'

      const newOrder: Order = {
        id: orderId,
        buyerId: user.id,
        buyerName: user.name,
        buyerEmail: user.email,
        sellerKey: sellerId,
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
        total: financials.totalBuyerPays,
        pickup: `Edificio ${product.preferredBuilding || 'D'}`,
        deliveryLocation: finalLoc,
        deliveryFee: financials.deliveryFee,
        note: '',
        status: 'solicitado',
        createdAt: new Date().toISOString(),
        isGuaranteed: false,
        platformCommission: financials.bocadoCommission,
        sellerNetRevenue: financials.vendorPayout,
        buyerBuilding: finalLoc,
        sellerBuilding: product.preferredBuilding ? `Edificio ${product.preferredBuilding}` : 'Punto por confirmar por vendedor',
        sellerBuildingConfirmed: false,
        bocadoCommission: financials.bocadoCommission,
        vendorPayout: financials.vendorPayout,
        tendederoPayout: financials.tendederoReimbursementAndFee,
        tendederoConfirmed: false,
        buyerConfirmed: false,
        sellerPaidConfirmed: false,
      }

      await saveOrder(newOrder)

      void updateProduct(product.id, { intent_count: product.intent_count + qty })
      void incrementMetric('total_intents')
      setConfirmedTotal(financials.totalBuyerPays)
      setOrderDone(true)
      bonus('¡Pedido Creado!', `${qty}x ${product.name} solicitado. Notificando al vendedor y a los Tendederos disponibles.`)
    } finally {
      setIsOrdering(false)
    }
  }

  const handleAddToCart = () => {
    if (isMyProduct) return
    playKeyBeep(720)
    add(product, qty)
    success('¡Agregado al carrito!', `${qty}x ${product.name} agregado. Puedes completar tu pedido en cualquier momento.`)
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
    return '/images/real_brownie.jpg'
  })()

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          to="/catalogo"
          className="inline-flex items-center gap-1.5 text-xs font-display font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Volver al catálogo</span>
        </Link>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Imagen de fotografía real */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <img
                src={displayImage}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              {product.stock <= 3 && product.stock > 0 && (
                <span className="absolute bottom-3 left-3 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-md flex items-center gap-1.5 animate-pulse">
                  <Flame size={14} className="text-amber-300" /> ¡Solo quedan {product.stock} unidades!
                </span>
              )}
            </div>

            {/* Cocinero Card */}
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 font-display font-black text-primary text-base">
                {initials(sellerName)}
              </span>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                  Elaborado en Campus por
                </span>
                <p className="font-display font-bold text-sm text-foreground truncate">{sellerName}</p>
                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin size={12} className="text-primary" /> Punto de recogida: Edificio {product.preferredBuilding || 'D'}
                </span>
              </div>
            </div>
          </div>

          {/* Información del snack y acciones */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-mono font-bold text-primary uppercase">
                  {product.category || 'Snack Casero'}
                </span>
                <h1 className="mt-2 font-display text-2xl font-black text-foreground sm:text-3xl">
                  {product.name}
                </h1>
                <p className="mt-2 text-2xl font-black font-mono text-primary">
                  {money(product.price)}
                </p>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {productDescription(product)}
              </p>

              <TagList tags={parseTags(product.category)} />

              {/* Selector de cantidad */}
              <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
                <span className="text-xs font-bold font-display">Cantidad a ordenar</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    disabled={qty <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-sm font-bold hover:bg-secondary/80 active:scale-95 disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="font-mono text-sm font-black w-6 text-center">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(Math.min(product.stock || 10, qty + 1))}
                    disabled={qty >= (product.stock || 10)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-sm font-bold hover:bg-secondary/80 active:scale-95 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Selector de Edificio / Ubicación del Comprador */}
              <div className="space-y-1.5 pt-2 border-t border-border/60">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <MapPin size={14} className="text-primary" /> ¿En qué edificio te encuentras para la entrega?
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
                  <option value="Biblioteca Central - Sala de Estudio">Biblioteca Central - Sala de Estudio</option>
                  <option value="Edificio E (Ingeniería) - Aulas">Edificio E (Ingeniería) - Aulas</option>
                  <option value="Edificio D - Plazoleta Central">Edificio D - Plazoleta Central</option>
                  <option value="El Samán - Zonas Verdes">El Samán - Zonas Verdes</option>
                </select>
              </div>

              {/* Desglose Transparente de la Operación */}
              <div className="rounded-2xl bg-secondary/60 p-4 space-y-2 text-xs border border-border/60">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal snack ({qty} uds):</span>
                  <span className="font-mono font-semibold">{money(financials.itemsSubtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span className="flex items-center gap-1 text-primary font-medium">
                    <Bike size={13} /> Domicilio por distancia ($100 - $500):
                  </span>
                  <span className="font-mono font-bold text-emerald-600">
                    +{money(financials.deliveryFee)} COP
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground text-[11px]">
                  <span>Tarifa de servicio plataforma:</span>
                  <span className="font-mono">{money(financials.bocadoCommission)} COP</span>
                </div>
                <div className="flex justify-between font-bold text-foreground pt-2 border-t border-border/60 text-sm">
                  <span>Total a pagar:</span>
                  <span className="font-mono text-primary font-black">
                    {money(financials.totalBuyerPays)}
                  </span>
                </div>
              </div>

              {/* Mensaje si el usuario es el propio vendedor */}
              {isMyProduct ? (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 p-4 text-xs font-semibold text-amber-800 dark:text-amber-200 text-center">
                  Eres el vendedor de este producto. La plataforma no permite comprar tus propias publicaciones.
                </div>
              ) : orderDone ? (
                <div className="rounded-2xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4 space-y-3 animate-fadeIn text-center">
                  <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-400 font-display font-bold text-sm">
                    <CheckCircle2 size={18} />
                    <span>¡Pedido Solicitado con Éxito!</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tu orden de <strong>{qty}x {product.name}</strong> por <strong>{money(confirmedTotal)}</strong> fue registrada. Un Tendedero la tomará para llevártela a <strong>{deliveryLocation}</strong>.
                  </p>
                  <Link
                    to="/pedidos"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-display font-bold text-white shadow-xs"
                  >
                    <Receipt size={14} />
                    <span>Ver Estado de Mi Pedido</span>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    disabled={isOrdering || product.sold_out || product.stock <= 0}
                    onClick={() => void handleOrderWithDelivery()}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-[#751010] py-3.5 font-display text-xs sm:text-sm font-bold text-white shadow-md active:scale-95 disabled:opacity-40 cursor-pointer transition-all"
                  >
                    <Bike size={16} />
                    <span>{isOrdering ? 'Procesando...' : `Pedir con Domicilio (${money(financials.totalBuyerPays)})`}</span>
                  </button>
                  <button
                    type="button"
                    disabled={product.sold_out || product.stock <= 0}
                    onClick={handleAddToCart}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card hover:bg-secondary px-5 py-3.5 font-display text-xs font-bold text-foreground transition-all active:scale-95 cursor-pointer shadow-xs"
                    title="Añadir al carrito"
                  >
                    <ShoppingCart size={16} className="text-primary" />
                    <span>Agregar al Carrito</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
