import {
  ArrowLeft,
  BookmarkCheck,
  CheckCircle2,
  Flame,
  MapPin,
  MessageCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BrandMark } from '../components/BrandMark'
import { TagList } from '../components/TagList'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { fetchProduct, incrementMetric, updateProduct } from '../lib/api'
import { getSellerPresence } from '../lib/campus'
import { displaySeller, initials, money, ownsListing, parseTags, productDescription, sellerUserId } from '../lib/format'
import { playPaymentSuccess } from '../lib/sounds'
import type { Product, SellerPresence } from '../types'

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { add } = useCart()
  const navigate = useNavigate()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [presence, setPresence] = useState<SellerPresence | null>(null)
  const [apartadoDone, setApartadoDone] = useState(false)

  useEffect(() => {
    if (!id) return
    void fetchProduct(id).then((p) => {
      setProduct(p)
      setLoading(false)
      if (p) {
        const sId = sellerUserId(p.seller)
        const pres = getSellerPresence(sId)
        if (pres) setPresence(pres)
      }
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

  const handleApartar = () => {
    playPaymentSuccess()
    add(product, qty)
    void updateProduct(product.id, { intent_count: product.intent_count + qty })
    void incrementMetric('total_intents')
    setApartadoDone(true)
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
        <div className="flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Seller Live Presence Box */}
            <div className="flex items-center justify-between rounded-2xl border border-border bg-secondary/50 p-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 font-display text-sm font-bold text-primary">
                  {initials(sellerName)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold">{sellerName}</span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      Estudiante Cocinero
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

          {/* Quantity and Apartar CTAs */}
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

            {apartadoDone ? (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 space-y-3 animate-fadeIn text-center">
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-display font-bold text-sm">
                  <CheckCircle2 size={18} />
                  <span>¡Snack apartado con éxito!</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tu producto quedó reservado. El vendedor asignará el casillero para tu retiro.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleStartChat}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-amber-500 py-2.5 text-xs font-display font-bold text-primary-foreground shadow-md hover:opacity-90"
                  >
                    <MessageCircle size={14} />
                    <span>Chatear con el Vendedor</span>
                  </button>
                  <Link
                    to="/carrito"
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary py-2.5 text-xs font-display font-semibold text-foreground hover:bg-secondary/80"
                  >
                    <BookmarkCheck size={14} className="text-primary" />
                    <span>Ver Apartados</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleApartar}
                  disabled={product.sold_out || product.stock <= 0}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-amber-500 py-4 font-display text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:opacity-95 active:scale-95 disabled:opacity-40"
                >
                  <BookmarkCheck size={18} />
                  Apartar Snack para Retiro
                </button>
                <button
                  type="button"
                  onClick={handleStartChat}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-secondary px-6 py-4 font-display text-sm font-semibold text-foreground hover:bg-secondary/80 transition-colors"
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
