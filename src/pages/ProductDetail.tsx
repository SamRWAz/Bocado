import { ArrowLeft, Check, Flame, MapPin, MessageCircle, ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BrandMark } from '../components/BrandMark'
import { TagList } from '../components/TagList'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { fetchProduct, incrementMetric, updateProduct } from '../lib/api'
import { getSellerPresence } from '../lib/campus'
import { displaySeller, initials, money, ownsListing, parseTags, productDescription, sellerUserId } from '../lib/format'
import type { Product } from '../types'

export function ProductDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { add } = useCart()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [qty, setQty] = useState(1)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!id) return
    void fetchProduct(id).then(setProduct)
  }, [id])

  if (!product) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm text-muted-foreground animate-pulse">Cargando información del snack...</p>
      </div>
    )
  }

  const sellerId = sellerUserId(product.seller)
  const sellerName = displaySeller(product.seller)
  const presence = getSellerPresence(sellerId)
  const isMyProduct = user ? ownsListing(product.seller, user.id, user.name) : false

  const addToCart = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/producto/${product.id}` } })
      return
    }
    add(product, qty)
    await updateProduct(product.id, { intent_count: product.intent_count + 1 })
    await incrementMetric('total_intents')
    setNotice(`¡${qty} unidad(es) agregadas a tu reserva!`)
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
    navigate(
      `/mensajes?partnerId=${encodeURIComponent(sellerId)}&partnerName=${encodeURIComponent(
        sellerName,
      )}&productId=${encodeURIComponent(product.id)}&productName=${encodeURIComponent(product.name)}`,
    )
  }

  const isLowStock = product.stock > 0 && product.stock <= 3

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      <Link
        to="/catalogo"
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        Volver a la vitrina de snacks
      </Link>

      <div className="grid gap-8 rounded-3xl border border-border/80 bg-card p-6 shadow-xl lg:grid-cols-2 lg:p-8">
        {/* Left Column: Image */}
        <div className="relative overflow-hidden rounded-2xl bg-secondary">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-80 w-full object-cover sm:h-96"
            />
          ) : (
            <div className="flex h-80 items-center justify-center sm:h-96 text-primary">
              <BrandMark size={80} />
            </div>
          )}

          {isLowStock && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white shadow-lg animate-pulse">
              <Flame size={14} /> ¡Últimas {product.stock} unidades!
            </div>
          )}
        </div>

        {/* Right Column: Info & Actions */}
        <div className="flex flex-col justify-between">
          <div className="space-y-4">
            {/* Seller Live Presence Box */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/50 p-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 font-display text-sm font-bold text-primary">
                  {initials(sellerName)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold">{sellerName}</span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      Estudiante Vendedor
                    </span>
                  </div>
                  {presence ? (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <MapPin size={12} className="text-primary" />
                      <span>{presence.zone} · {presence.detail} ({presence.activeUntil})</span>
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Disponible en el campus</p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartChat}
                className="flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-display font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <MessageCircle size={14} />
                <span>{isMyProduct ? 'Mi Panel de Venta' : 'Chatear'}</span>
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
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
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

          {/* Quantity and CTA */}
          <div className="mt-8 space-y-4 border-t border-border pt-6">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cantidad:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQty((n) => Math.max(1, n - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-sm font-bold hover:bg-secondary/80 active:scale-95"
                >
                  -
                </button>
                <span className="min-w-8 text-center font-display text-base font-bold">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((n) => Math.min(product.stock, n + 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-sm font-bold hover:bg-secondary/80 active:scale-95"
                >
                  +
                </button>
              </div>
            </div>

            {notice && (
              <div className="flex items-center gap-2 rounded-xl bg-primary/15 px-4 py-2.5 text-xs font-semibold text-primary">
                <Check size={16} />
                <span>{notice}</span>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => void addToCart()}
                disabled={product.sold_out || product.stock <= 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-display text-sm font-bold text-primary-foreground shadow-md transition-transform hover:opacity-90 active:scale-95 disabled:opacity-40"
              >
                <ShoppingBag size={18} />
                Apartar snack en el carrito
              </button>
              <Link
                to="/carrito"
                className="flex items-center justify-center rounded-xl bg-secondary px-6 py-3.5 font-display text-sm font-semibold text-foreground hover:bg-secondary/80 transition-colors"
              >
                Ir a pagar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
