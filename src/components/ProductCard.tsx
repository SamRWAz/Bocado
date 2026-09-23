import { Link, useNavigate } from 'react-router-dom'
import {
  BookmarkCheck,
  Flame,
  MessageCircle,
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

  // Map product image
  const displayImage = (() => {
    if (!product.image_url) return '/images/snack_anime_brownie.jpg'
    const nameLower = product.name.toLowerCase()
    if (nameLower.includes('brownie')) return '/images/snack_anime_brownie.jpg'
    if (nameLower.includes('parfait') || nameLower.includes('yogur') || nameLower.includes('chia')) {
      return '/images/snack_anime_parfait.jpg'
    }
    if (nameLower.includes('empanada')) return '/images/snack_anime_empanadas.jpg'
    if (nameLower.includes('galleta') || nameLower.includes('cookie') || nameLower.includes('avena')) {
      return '/images/snack_anime_cookies.jpg'
    }
    return product.image_url
  })()

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black p-4 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-primary/60 hover:shadow-[0_0_30px_rgba(249,115,22,0.2)]">
      {/* Top Bar: Seller & Chat */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3 text-xs">
        <div className="flex items-center gap-2 truncate">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary font-mono">
            {sellerName.charAt(0).toUpperCase()}
          </span>
          <span className="font-medium text-zinc-300 text-xs truncate">
            {sellerName}
          </span>
        </div>
        <button
          type="button"
          onClick={handleStartChat}
          className="flex h-7 items-center gap-1 rounded-lg bg-white/5 px-2.5 text-[11px] font-medium text-zinc-400 hover:text-primary hover:bg-primary/20 transition-colors"
          title={`Chatear con ${sellerName}`}
        >
          <MessageCircle size={13} />
          <span>Chat</span>
        </button>
      </div>

      {/* Product Image Showcase */}
      <Link
        to={`/producto/${product.id}`}
        className="relative h-52 w-full overflow-hidden rounded-2xl bg-zinc-950 border border-white/10 block"
      >
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-20 w-32 bg-primary/15 blur-xl" />

        <img
          src={displayImage}
          alt={product.name}
          className="h-full w-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {isLowStock && (
          <span className="absolute bottom-2 left-2 rounded-lg bg-rose-500/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-md backdrop-blur-sm animate-pulse flex items-center gap-1">
            <Flame size={12} /> ¡Solo {product.stock} disponibles!
          </span>
        )}
      </Link>

      {/* Card Details & Apartar Action */}
      <div className="mt-4 flex flex-1 flex-col justify-between space-y-3">
        <div>
          <Link to={`/producto/${product.id}`} className="hover:text-primary transition-colors">
            <h3 className="font-brand text-base font-bold text-foreground line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <div className="mt-2">
            <TagList tags={parseTags(product.category)} size="sm" />
          </div>
        </div>

        {/* Price and Apartar Button */}
        <div className="pt-3 flex items-center justify-between border-t border-white/10">
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
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary via-amber-500 to-primary px-4 py-2.5 font-display text-xs font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all"
          >
            <BookmarkCheck size={14} />
            <span>{product.sold_out ? 'Agotado' : 'Apartar'}</span>
          </button>
        </div>
      </div>
    </article>
  )
}
