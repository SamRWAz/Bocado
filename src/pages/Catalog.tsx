import { Search, ShoppingBag } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { fetchProducts, incrementMetric, updateProduct } from '../lib/api'
import { FILTERS } from '../lib/constants'
import type { Product } from '../types'

export function CatalogPage() {
  const { user } = useAuth()
  const { add } = useCart()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<(typeof FILTERS)[number]>('Todas')
  const [notice, setNotice] = useState('')

  const refresh = useCallback(async () => {
    setProducts(await fetchProducts())
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const visible = products
    .filter((p) => !p.sold_out && p.stock > 0)
    .filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.seller.toLowerCase().includes(query.toLowerCase()),
    )
    .filter((p) => category === 'Todas' || p.category === category)

  const wantIt = async (product: Product) => {
    if (!user) {
      navigate('/login', { state: { from: '/catalogo' } })
      return
    }
    add(product)
    await updateProduct(product.id, { intent_count: product.intent_count + 1 })
    await incrementMetric('total_intents')
    setNotice(`${product.name} se agregó al carrito`)
    void refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Catálogo</h1>
          <p className="text-sm text-muted-foreground">Lo que se cocina hoy en el campus.</p>
        </div>
        <div className="relative w-full sm:max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar comida o vendedor..."
            className="w-full rounded-lg border border-border bg-card py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {notice && (
        <p className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">{notice}</p>
      )}

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

      {visible.length === 0 ? (
        <div className="py-20 text-center">
          <ShoppingBag size={48} className="mx-auto mb-4 opacity-40" />
          <p className="text-sm text-muted-foreground">
            {query ? 'No se encontró comida' : 'Todavía no hay comida publicada'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} onWant={(item) => void wantIt(item)} />
          ))}
        </div>
      )}
    </div>
  )
}
