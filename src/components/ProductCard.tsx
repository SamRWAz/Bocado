import { Boxes, Flame, MessageCircle, ShoppingBag } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { displaySeller, money, ownsListing, parseTags, sellerUserId } from '../lib/format'
import { playKeyBeep } from '../lib/sounds'
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
  const lockerSlot = product.lockerNumber || '01'

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-card/80 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/60 hover:shadow-[0_0_25px_rgba(249,115,22,0.2)]">
      {/* Top Media Container */}
      <Link to={`/producto/${product.id}`} className="relative block overflow-hidden bg-zinc-950">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-52 items-center justify-center bg-secondary/60 text-primary">
            <BrandMark size={48} />
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="rounded-xl bg-black/75 px-2.5 py-1 text-[10px] font-mono font-bold text-emerald-400 backdrop-blur-md border border-white/10 flex items-center gap-1">
            <Boxes size={11} /> Casillero #{lockerSlot}
          </span>
          {isLowStock && (
            <span className="flex items-center gap-1 rounded-xl bg-rose-500/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-md backdrop-blur-sm animate-pulse">
              <Flame size={11} /> ¡Quedan {product.stock}!
            </span>
          )}
        </div>

        {/* Quick Chat Shortcut Icon */}
        <button
          type="button"
          onClick={handleStartChat}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-xl bg-black/70 text-zinc-300 hover:text-primary backdrop-blur-md border border-white/10 transition-colors"
          title={`Chatear con ${sellerName}`}
        >
          <MessageCircle size={14} />
        </button>
      </Link>

      {/* Card Details */}
      <div className="flex flex-1 flex-col p-4 justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="truncate">Por {sellerName}</span>
            <span className="text-[10px] font-mono text-emerald-400">Campus 24/7</span>
          </div>

          <Link to={`/producto/${product.id}`} className="hover:text-primary transition-colors">
            <h3 className="font-brand text-base font-bold text-foreground line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <div className="mt-2">
            <TagList tags={parseTags(product.category)} size="sm" />
          </div>
        </div>

        {/* Price and Instant Cart Action */}
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
              playKeyBeep(750)
              onAdd(product)
            }}
            disabled={product.sold_out || product.stock <= 0}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 font-display text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all"
          >
            <ShoppingBag size={14} />
            <span>{product.sold_out ? 'Agotado' : 'Apartar'}</span>
          </button>
        </div>
      </div>
    </article>
  )
}
