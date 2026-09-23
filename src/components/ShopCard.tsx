import { Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import { shopPath } from '../lib/format'
import type { Shop } from '../lib/shops'
import { TagList } from './TagList'

export function ShopCard({ shop }: { shop: Shop }) {
  const count = shop.products.length

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card">
      <Link to={shopPath(shop.seller)} className="block">
        {shop.cover ? (
          <img src={shop.cover} alt={shop.name} className="h-44 w-full object-cover" />
        ) : (
          <div className="flex h-44 items-center justify-center bg-secondary text-muted-foreground/40">
            <Store size={40} />
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link to={shopPath(shop.seller)}>
          <h3 className="truncate font-display text-lg font-semibold">{shop.name}</h3>
        </Link>
        <p className="mt-1 text-sm text-muted-foreground">
          {count} {count === 1 ? 'producto' : 'productos'}
        </p>
        <TagList tags={shop.tags} />
        <Link
          to={shopPath(shop.seller)}
          className="mt-auto flex touch-target w-full items-center justify-center gap-2 rounded-lg bg-primary pt-0 font-display text-sm font-bold text-primary-foreground transition-transform active:scale-95"
        >
          <Store size={16} />
          Visitar tienda
        </Link>
      </div>
    </article>
  )
}
