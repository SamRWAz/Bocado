import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { displaySeller, money, ownsListing } from '../lib/format'
import { playKeyBeep } from '../lib/sounds'
import type { Product } from '../types'

type Props = {
  product: Product
  onApartar: (product: Product) => void
}

export function ProductCard({ product, onApartar }: Props) {
  const { user } = useAuth()

  const sellerName = displaySeller(product.seller)
  const isMyProduct = user ? ownsListing(product.seller, user.id, user.name) : false

  // Resolved clean appetizing photography
  const displayImage = (() => {
    const raw = product.image_url
    if (raw && !raw.includes('snack_anime') && (raw.startsWith('http') || raw.startsWith('/images/real_'))) {
      return raw
    }
    const nameLower = product.name.toLowerCase()
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

  const handleActionClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isMyProduct || product.sold_out || product.stock <= 0) return
    playKeyBeep(720)
    onApartar(product)
  }

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#EFE8E6] dark:border-[#2D1945] bg-white dark:bg-[#1D102E] p-3.5 transition-all shadow-xs hover:shadow-md"
    >
      <Link to={`/producto/${product.id}`} className="block overflow-hidden rounded-2xl bg-[#F7F2F6] dark:bg-[#25153A]">
        <div className="relative aspect-4/3 w-full overflow-hidden">
          <img
            src={displayImage}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-106"
            loading="lazy"
          />
          {product.sold_out || product.stock <= 0 ? (
            <div className="absolute inset-0 bg-[#1E0C30]/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="rounded-full bg-white px-3 py-1 font-display text-xs font-bold text-[#B8385E] shadow-sm">
                Agotado por hoy
              </span>
            </div>
          ) : null}
        </div>
      </Link>

      {/* Info Section */}
      <div className="pt-3 px-1 pb-1 flex flex-col gap-2">
        <div>
          <span className="text-[11px] font-mono text-[#756272] dark:text-[#A692A3] block tracking-wide">
            Por {sellerName}
          </span>
          <Link to={`/producto/${product.id}`} className="block">
            <h3 className="font-display text-base font-bold text-[#1E0C30] dark:text-[#F6EEF2] line-clamp-1 hover:text-[#B8385E] transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Add to Cart button */}
        <div className="flex items-center justify-between pt-1 border-t border-[#EFE8E6] dark:border-[#2D1945]">
          <div>
            <span className="font-display text-lg font-black text-[#B8385E] dark:text-[#D94668]">
              {money(product.price)}
            </span>
          </div>

          {!isMyProduct && product.stock > 0 && !product.sold_out && (
            <motion.button
              whileTap={{ scale: 0.92 }}
              type="button"
              onClick={handleActionClick}
              className="flex items-center gap-1.5 rounded-xl bg-[#B8385E] hover:bg-[#A32F51] px-3.5 py-2 font-display text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Pedir</span>
            </motion.button>
          )}

          {isMyProduct && (
            <span className="text-[10px] font-mono font-bold text-[#7E726A] bg-[#F4EFE6] dark:bg-[#251F1C] px-2 py-1 rounded-lg">
              Tu producto
            </span>
          )}
        </div>
      </div>
    </motion.article>
  )
}
