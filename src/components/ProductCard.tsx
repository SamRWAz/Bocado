import { Flame, MapPin, MessageCircle, ShoppingBag } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSellerPresence } from '../lib/campus'
import { displaySeller, money, ownsListing, parseTags, productDescription, sellerUserId } from '../lib/format'
import type { Product } from '../types'
import { BrandMark } from './BrandMark'
import { TagList } from './TagList'

type Props = {
  product: Product
  onAdd: (product: Product) => void
}

export function ProductCard({ product, onAdd }: Props) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const sellerId = sellerUserId(product.seller)
  const sellerName = displaySeller(product.seller)
  const presence = getSellerPresence(sellerId)
  const isMyProduct = user ? ownsListing(product.seller, user.id, user.name) : false

  const handleStartChat = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!user) {
      navigate('/login', { state: { from: `/catalogo` } })
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
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl">
      {/* Image Container */}
      <Link to={`/producto/${product.id}`} className="relative block overflow-hidden bg-secondary">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-48 items-center justify-center bg-secondary/80 text-primary">
            <BrandMark size={48} />
          </div>
        )}

        {/* Floating Scarcity / Stock Badge */}
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {isLowStock ? (
            <span className="flex items-center gap-1 rounded-full bg-rose-500/90 px-2.5 py-1 text-[11px] font-bold text-white shadow-md backdrop-blur-sm animate-pulse">
              <Flame size={12} /> ¡Solo {product.stock}!
            </span>
          ) : (
            <span className="rounded-full bg-background/80 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground backdrop-blur-sm">
              {product.stock} disponibles
            </span>
          )}
        </div>

        {/* Live Campus Presence Pin on Image */}
        {presence && (
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between rounded-lg bg-background/85 px-2.5 py-1.5 text-[11px] backdrop-blur-md border border-border/50">
            <div className="flex items-center gap-1.5 truncate text-foreground font-medium">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <MapPin size={12} className="text-primary shrink-0" />
              <span className="truncate">{presence.zone}</span>
            </div>
            <span className="text-[10px] text-primary shrink-0 font-semibold">{presence.activeUntil}</span>
          </div>
        )}
      </Link>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Seller Name & Contact Button */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-xs font-semibold text-muted-foreground truncate">
            Por {sellerName}
          </span>
          <button
            type="button"
            onClick={handleStartChat}
            className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary/15 transition-colors"
            title={isMyProduct ? 'Tu propio snack (Ir al panel)' : `Chatear con ${sellerName}`}
          >
            <MessageCircle size={12} />
            <span>{isMyProduct ? 'Mi Snack' : 'Chat'}</span>
          </button>
        </div>

        {/* Title & Description */}
        <Link to={`/producto/${product.id}`} className="group-hover:text-primary transition-colors">
          <h3 className="font-display text-base font-bold leading-snug line-clamp-1">{product.name}</h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
          {productDescription(product)}
        </p>

        {/* Tags */}
        <div className="mt-2.5">
          <TagList tags={parseTags(product.category)} size="sm" />
        </div>

        {/* Price and Action */}
        <div className="mt-auto pt-4 flex items-center justify-between gap-3 border-t border-border/50">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block">Precio</span>
            <p className="font-display text-lg font-bold text-primary">{money(product.price)}</p>
          </div>

          <button
            type="button"
            onClick={() => onAdd(product)}
            disabled={product.sold_out || product.stock <= 0}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 font-display text-xs font-bold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
          >
            <ShoppingBag size={14} />
            {product.sold_out ? 'Agotado' : 'Apartar'}
          </button>
        </div>
      </div>
    </article>
  )
}
