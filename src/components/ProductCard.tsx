import { Link, useNavigate } from 'react-router-dom'
import {
  BookmarkCheck,
  Flame,
  MessageCircle,
  Star,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { displaySeller, money, ownsListing, parseTags, sellerUserId } from '../lib/format'
import { playKeyBeep } from '../lib/sounds'
import type { Product } from '../types'
import { TagList } from './TagList'

type Props = {
  product: Product
  onApartar: (product: Product) => void
}

export function ProductCard({ product, onApartar }: Props) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const sellerId = sellerUserId(product.seller)
  const sellerName = displaySeller(product.seller)
  const isMyProduct = user ? ownsListing(product.seller, user.id, user.name) : false

  const handleStartChat = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    playKeyBeep(600)
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

  // Map product image to real appetizing photography
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
    if (nameLower.includes('empanada') || nameLower.includes('pastel') || nameLower.includes('pollo') || nameLower.includes('salado')) {
      return '/images/real_empanadas.jpg'
    }
    if (nameLower.includes('galleta') || nameLower.includes('cookie') || nameLower.includes('avena')) {
      return '/images/real_cookies.jpg'
    }
    if (nameLower.includes('matcha')) return '/images/real_matcha_roll.jpg'
    if (nameLower.includes('cheesecake') || nameLower.includes('torta')) return '/images/real_cheesecake.jpg'
    if (nameLower.includes('rollo') || nameLower.includes('canela')) return '/images/real_cinnamon_roll.jpg'
    return '/images/real_brownie.jpg'
  })()

  // Freshness & specialty badge helper
  const getBadge = () => {
    const n = (product.name + ' ' + (product.category || '')).toLowerCase()
    if (n.includes('brownie')) return { label: 'Horneado hoy ✨', cls: 'badge-bakery-honey' }
    if (n.includes('parfait') || n.includes('fruta')) return { label: 'Fruta fresca 🍓', cls: 'badge-bakery-strawberry' }
    if (n.includes('empanada')) return { label: 'Recién hecho 🔥', cls: 'badge-bakery-flame' }
    if (n.includes('galleta')) return { label: '100% Casero 🍪', cls: 'badge-bakery-honey' }
    if (n.includes('matcha') || n.includes('vegano')) return { label: 'Artesanal 🌿', cls: 'badge-bakery-matcha' }
    return { label: 'Especial Bocado ✨', cls: 'badge-bakery-flame' }
  }

  const badge = getBadge()

  return (
    <article className="food-card-hover group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/80 bg-card p-4 shadow-sm backdrop-blur-xl">
      {/* Top Bar: Seller & Chat Action */}
      <div className="flex items-center justify-between border-b border-border/50 pb-2.5 mb-3 text-xs">
        <div className="flex items-center gap-2 truncate">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary font-mono shadow-xs">
            {sellerName.charAt(0).toUpperCase()}
          </span>
          <span className="font-semibold text-foreground/80 text-xs truncate">
            {sellerName}
          </span>
        </div>
        <button
          type="button"
          onClick={handleStartChat}
          className="flex h-7 items-center gap-1 rounded-full bg-secondary/80 hover:bg-primary/15 hover:text-primary px-3 text-[11px] font-medium text-muted-foreground transition-all duration-200"
          title={`Chatear con ${sellerName}`}
        >
          <MessageCircle size={13} />
          <span>Chat</span>
        </button>
      </div>

      {/* Product Real Image Showcase */}
      <Link
        to={`/producto/${product.id}`}
        className="relative h-52 w-full overflow-hidden rounded-2xl bg-secondary/50 border border-border/40 block group-hover:shadow-md transition-shadow"
      >
        <img
          src={displayImage}
          alt={product.name}
          className="h-full w-full object-cover rounded-2xl transition-transform duration-700 ease-out group-hover:scale-108"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold backdrop-blur-md shadow-xs ${badge.cls}`}>
            {badge.label}
          </span>
        </div>

        {/* Rating chip */}
        <div className="absolute top-2.5 right-2.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-amber-300 backdrop-blur-md flex items-center gap-1 shadow-sm">
          <Star size={10} className="fill-amber-300 text-amber-300" />
          <span>4.9</span>
        </div>

        {/* Low Stock Warning */}
        {isLowStock && (
          <span className="absolute bottom-2 left-2 rounded-xl bg-rose-600/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-md backdrop-blur-sm animate-pulse flex items-center gap-1">
            <Flame size={12} /> ¡Solo {product.stock} disponibles!
          </span>
        )}
      </Link>

      {/* Card Details & Apartar Action */}
      <div className="mt-4 flex flex-1 flex-col justify-between space-y-3">
        <div>
          <Link to={`/producto/${product.id}`} className="group-hover:text-primary transition-colors">
            <h3 className="font-display text-base font-bold text-foreground line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <div className="mt-2">
            <TagList tags={parseTags(product.category)} size="sm" />
          </div>
        </div>

        {/* Price and Apartar Button */}
        <div className="pt-3 flex items-center justify-between border-t border-border/60">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-mono block">
              Precio
            </span>
            <p className="font-mono text-lg font-black text-primary">{money(product.price)}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              playKeyBeep(650)
              onApartar(product)
            }}
            disabled={product.sold_out || product.stock <= 0}
            className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-primary via-orange-500 to-primary px-4 py-2.5 font-display text-xs font-bold text-primary-foreground shadow-md shadow-primary/25 hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
          >
            <BookmarkCheck size={14} />
            <span>{product.sold_out ? 'Agotado' : 'Apartar'}</span>
          </button>
        </div>
      </div>
    </article>
  )
}
