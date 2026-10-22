import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Flame, MapPin, ShoppingCart, Star } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { displaySeller, money, ownsListing, parseTags } from '../lib/format'
import { playKeyBeep } from '../lib/sounds'
import type { Product } from '../types'
import { TagList } from './TagList'

type Props = {
  product: Product
  onApartar: (product: Product) => void
}

export function ProductCard({ product, onApartar }: Props) {
  const { user } = useAuth()

  const sellerName = displaySeller(product.seller)
  const isMyProduct = user ? ownsListing(product.seller, user.id, user.name) : false
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
    if (n.includes('brownie')) return { label: '🔥 Más pedido', cls: 'badge-bakery-strawberry' }
    if (n.includes('parfait') || n.includes('fruta')) return { label: '🍓 Fruta fresca', cls: 'badge-bakery-strawberry' }
    if (n.includes('empanada')) return { label: '🥟 Recién horneado', cls: 'badge-bakery-strawberry' }
    if (n.includes('galleta')) return { label: '🍪 100% Casero', cls: 'badge-bakery-strawberry' }
    if (n.includes('matcha') || n.includes('vegano')) return { label: '🌿 Artesanal', cls: 'badge-bakery-neutral' }
    return { label: '✨ Elaboración de hoy', cls: 'badge-bakery-strawberry' }
  }

  const badge = getBadge()
  const building = product.preferredBuilding || 'D'

  const handleActionClick = () => {
    if (isMyProduct) return
    playKeyBeep(720)
    onApartar(product)
  }

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="food-card-hover group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm hover:shadow-lg transition-shadow"
    >
      {/* Top Bar: Seller & Campus Pickup Zone (Chat between buyer and seller is strictly prohibited) */}
      <div className="flex items-center justify-between border-b border-border/60 pb-2.5 mb-3 text-xs">
        <div className="flex items-center gap-2 truncate">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 dark:bg-red-950 text-[10px] font-bold text-[#8F1414] dark:text-red-300 font-mono">
            {sellerName.charAt(0).toUpperCase()}
          </span>
          <span className="font-semibold text-foreground/80 text-xs truncate">
            {sellerName}
          </span>
        </div>
        <span className="inline-flex items-center gap-0.5 rounded-md bg-secondary px-2 py-0.5 text-[10px] font-mono text-muted-foreground shrink-0">
          <MapPin size={10} className="text-primary" /> Punto: Edif. {building}
        </span>
      </div>

      {/* Product Image */}
      <Link
        to={`/producto/${product.id}`}
        className="relative h-48 w-full overflow-hidden rounded-2xl bg-secondary border border-border block group-hover:shadow-xs transition-shadow"
      >
        <img
          src={displayImage}
          alt={product.name}
          className="h-full w-full object-cover rounded-2xl transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Top Badge */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-xs ${badge.cls}`}>
            {badge.label}
          </span>
        </div>

        {/* Rating chip */}
        <div className="absolute top-2.5 right-2.5 rounded-full bg-black/75 px-2 py-0.5 text-[10px] font-bold text-white flex items-center gap-1 shadow-xs">
          <Star size={10} className="fill-amber-400 text-amber-400" />
          <span>4.9</span>
        </div>

        {/* Low Stock Warning */}
        {isLowStock && (
          <span className="absolute bottom-2 left-2 rounded-xl bg-[#8F1414] px-2.5 py-1 text-[10px] font-bold text-white shadow-xs flex items-center gap-1 animate-pulse">
            <Flame size={12} className="text-amber-300" /> ¡Quedan {product.stock}!
          </span>
        )}
      </Link>

      {/* Card Details & Add to Cart Action */}
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

        {/* Price and Cart Button */}
        <div className="pt-3 flex items-center justify-between border-t border-border">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-mono block">
              Precio Snack
            </span>
            <p className="font-mono text-lg font-black text-[#8F1414] dark:text-red-400">{money(product.price)}</p>
          </div>

          {isMyProduct ? (
            <span className="rounded-xl bg-secondary px-3 py-2 text-[11px] font-bold text-muted-foreground border border-border">
              Tu producto
            </span>
          ) : (
            <button
              type="button"
              onClick={handleActionClick}
              disabled={product.sold_out || product.stock <= 0}
              className="flex items-center gap-1.5 rounded-2xl bg-[#8F1414] hover:bg-[#751010] px-3.5 py-2.5 font-display text-xs font-bold text-white shadow-sm active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
            >
              <ShoppingCart size={14} />
              <span>{product.sold_out ? 'Agotado' : 'Pedir'}</span>
            </button>
          )}
        </div>
      </div>
    </motion.article>
  )
}
