import { Search, Store } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { ShopCard } from '../components/ShopCard'
import { useAuth } from '../context/AuthContext'
import { fetchProducts } from '../lib/api'
import { FILTERS } from '../lib/constants'
import { groupShops, shopHasTag, shopMatchesQuery } from '../lib/shops'
import type { Product } from '../types'

export function CatalogPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<(typeof FILTERS)[number]>('Todas')

  const refresh = useCallback(async () => {
    setProducts(await fetchProducts())
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const shops = groupShops(products.filter((p) => !p.sold_out && p.stock > 0)).filter(
    (shop) =>
      shopMatchesQuery(shop, query) && (category === 'Todas' || shopHasTag(shop, category)),
  )

  return (
    <div className={user ? 'space-y-6' : 'mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6'}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Catálogo</h1>
          <p className="text-sm text-muted-foreground">Entra a una tienda para ver lo que venden.</p>
        </div>
        <div className="relative w-full sm:max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar tienda o comida..."
            className="w-full rounded-lg border border-border bg-card py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {FILTERS.map((filter) => (
          <button
            type="button"
            key={filter}
            onClick={() => setCategory(filter)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-display font-semibold ${
              category === filter
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {shops.length === 0 ? (
        <div className="py-20 text-center">
          <Store size={48} className="mx-auto mb-4 opacity-40" />
          <p className="text-sm text-muted-foreground">
            {query ? 'No se encontró esa tienda' : 'Todavía no hay tiendas publicadas'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shops.map((shop) => (
            <ShopCard key={shop.slug} shop={shop} />
          ))}
        </div>
      )}
    </div>
  )
}
