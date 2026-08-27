import { ShoppingCart } from 'lucide-react'
import { money, parseTags, productDescription } from '../lib/format'
import type { Product } from '../types'
import { BrandMark } from './BrandMark'
import { TagList } from './TagList'

type Props = {
  product: Product
  onAdd: (product: Product) => void
}

export function ProductCard({ product, onAdd }: Props) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card">
      {product.image_url ? (
        <img src={product.image_url} alt={product.name} className="h-44 w-full object-cover" />
      ) : (
        <div className="flex h-44 items-center justify-center bg-secondary text-primary">
          <BrandMark size={40} />
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3">
          <h3 className="font-display text-lg font-semibold">{product.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{productDescription(product)}</p>
          <TagList tags={parseTags(product.category)} />
        </div>
        <p className="mb-3 font-display text-xl font-bold text-primary">{money(product.price)}</p>
        <button
          type="button"
          onClick={() => onAdd(product)}
          className="mt-auto flex touch-target w-full items-center justify-center gap-2 rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground transition-transform active:scale-95"
        >
          <ShoppingCart size={16} />
          Agregar al carrito
        </button>
      </div>
    </article>
  )
}
