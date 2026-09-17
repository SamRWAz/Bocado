import { Filter, MapPin, Search, ShoppingBag, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { fetchProducts, incrementMetric, updateProduct } from '../lib/api'
import { DIETARY_OPTIONS, getSellerPresence, ICESI_ZONES } from '../lib/campus'
import { FILTERS } from '../lib/constants'
import { hasTag, sellerUserId } from '../lib/format'
import type { Product } from '../types'

export function CatalogPage() {
  const { user } = useAuth()
  const { add } = useCart()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<(typeof FILTERS)[number]>('Todos')
  const [dietaryFilter, setDietaryFilter] = useState<string | null>(null)
  const [zoneFilter, setZoneFilter] = useState<string>('Todas las zonas')
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const list = await fetchProducts()
    setProducts(list)
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const handleAddToCart = async (product: Product) => {
    add(product, 1)
    void updateProduct(product.id, { intent_count: product.intent_count + 1 })
    void incrementMetric('total_intents')
    navigate('/carrito')
  }

  // Filter products
  const availableProducts = products.filter((p) => !p.sold_out && p.stock > 0)

  const filtered = availableProducts.filter((product) => {
    const q = query.toLowerCase()
    const matchesQuery =
      !q ||
      product.name.toLowerCase().includes(q) ||
      product.category.toLowerCase().includes(q) ||
      product.seller.toLowerCase().includes(q)

    const matchesCategory = category === 'Todos' || hasTag(product.category, category)

    const matchesDietary =
      !dietaryFilter ||
      hasTag(product.category, dietaryFilter) ||
      (product.dietary && product.dietary.includes(dietaryFilter as never))

    const matchesZone = (() => {
      if (zoneFilter === 'Todas las zonas') return true
      const sellerId = sellerUserId(product.seller)
      const presence = getSellerPresence(sellerId)
      return presence && presence.zone.includes(zoneFilter)
    })()

    return matchesQuery && matchesCategory && matchesDietary && matchesZone
  })

  return (
    <div className={user ? 'space-y-6' : 'mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6'}>
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles size={14} />
            <span>Vitrina de Snacks en Campus</span>
          </div>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Catálogo Universitario
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Disponibilidad en vivo, alérgenos y ubicación de los vendedores entre clases.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:max-w-xs">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar brownie, galleta, vegano..."
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Main Filter Bar */}
      <div className="space-y-3 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
        {/* Categories Carousel */}
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
            Categorías de Snacks
          </span>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {FILTERS.map((filter) => {
              const active = category === filter
              return (
                <button
                  type="button"
                  key={filter}
                  onClick={() => setCategory(filter)}
                  className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-display font-semibold transition-all ${
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {filter}
                </button>
              )
            })}
          </div>
        </div>

        {/* Dietary & Campus Zone Row */}
        <div className="flex flex-col gap-3 pt-2 border-t border-border/60 sm:flex-row sm:items-center sm:justify-between">
          {/* Dietary filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mr-1">
              <Filter size={12} /> Dieta:
            </span>
            <button
              type="button"
              onClick={() => setDietaryFilter(null)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                dietaryFilter === null ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
              }`}
            >
              Cualquiera
            </button>
            {DIETARY_OPTIONS.slice(0, 5).map((opt) => {
              const active = dietaryFilter === opt.shortLabel || dietaryFilter === opt.id
              return (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setDietaryFilter(active ? null : opt.shortLabel)}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.shortLabel}</span>
                </button>
              )
            })}
          </div>

          {/* Campus Zone Filter */}
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-primary shrink-0" />
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Todas las zonas">📍 Todas las zonas del campus</option>
              {ICESI_ZONES.map((zone) => (
                <option key={zone} value={zone.split(' ')[0]}>
                  {zone}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          <p className="animate-pulse">Cargando snacks del campus...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-dashed border-border bg-card/40 p-8">
          <ShoppingBag size={48} className="mx-auto mb-3 text-muted-foreground/40" />
          <h3 className="font-display text-lg font-bold">No se encontraron snacks con estos filtros</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Prueba cambiando la categoría, la dieta o la zona del campus.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setCategory('Todos')
              setDietaryFilter(null)
              setZoneFilter('Todas las zonas')
            }}
            className="mt-4 rounded-xl bg-primary px-4 py-2 font-display text-xs font-bold text-primary-foreground"
          >
            Restablecer filtros
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Mostrando <strong className="text-foreground">{filtered.length}</strong> snacks disponibles ahora
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={handleAddToCart} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
