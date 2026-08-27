import { Heart, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { displaySeller, money } from '../lib/format'
import type { Product } from '../types'

type Props = {
  product: Product
  onWant: (product: Product) => void
}

export function ProductCard({ product, onWant }: Props) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card">
      <Link to={`/producto/${product.id}`} className="block">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="h-44 w-full object-cover" />
        ) : (
          <div className="flex h-44 items-center justify-center bg-secondary text-3xl">🍿</div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/producto/${product.id}`}>
              <h3 className="truncate font-display text-lg font-semibold">{product.name}</h3>
            </Link>
            <p className="text-sm text-muted-foreground">por {displaySeller(product.seller)}</p>
            <span className="mt-1 inline-block rounded-full bg-secondary px-2 py-0.5 text-[10px] font-display font-semibold">
              {product.category}
            </span>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-display text-xl font-bold text-primary">{money(product.price)}</p>
            <p className="text-xs text-muted-foreground">{product.stock} disponibles</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onWant(product)}
          className="mt-auto flex touch-target w-full items-center justify-center gap-2 rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground transition-transform active:scale-95"
        >
          <ShoppingCart size={16} />
          <Heart size={16} />
          Lo quiero ({product.intent_count})
        </button>
      </div>
    </article>
  )
}
