import {
  BookmarkCheck,
  Building2,
  CheckCircle2,
  Filter,
  MessageCircle,
  Search,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { fetchProducts, incrementMetric, updateProduct } from '../lib/api'
import { DIETARY_OPTIONS } from '../lib/campus'
import { FILTERS } from '../lib/constants'
import { displaySeller, hasTag, money, sellerUserId } from '../lib/format'
import { playKeyBeep, playPaymentSuccess } from '../lib/sounds'
import type { Product } from '../types'

export function CatalogPage() {
  const { user } = useAuth()
  const { add } = useCart()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<(typeof FILTERS)[number]>('Todos')
  const [dietaryFilter, setDietaryFilter] = useState<string | null>(null)
  const [buildingFilter, setBuildingFilter] = useState<string>('Todos')
  const [loading, setLoading] = useState(true)

  // Confirmation Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedBuilding, setSelectedBuilding] = useState<'D' | 'M' | 'L'>('D')
  const [apartadoSuccess, setApartadoSuccess] = useState<Product | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const list = await fetchProducts()
    setProducts(list)
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const handleOpenApartarModal = (product: Product) => {
    setSelectedProduct(product)
    setSelectedBuilding((product.preferredBuilding as 'D' | 'M' | 'L') || 'D')
  }

  const handleConfirmApartar = async () => {
    if (!selectedProduct) return
    playPaymentSuccess()

    // Add to reserved items
    add(
      {
        ...selectedProduct,
        preferredBuilding: selectedBuilding,
      },
      1,
    )

    void updateProduct(selectedProduct.id, { intent_count: selectedProduct.intent_count + 1 })
    void incrementMetric('total_intents')

    const confirmed = selectedProduct
    setSelectedProduct(null)
    setApartadoSuccess(confirmed)
  }

  const handleGoToChat = (product: Product) => {
    const sId = sellerUserId(product.seller)
    const sName = displaySeller(product.seller)
    if (!user) {
      navigate('/login', { state: { from: `/catalogo` } })
      return
    }
    navigate(
      `/mensajes?partnerId=${encodeURIComponent(sId)}&partnerName=${encodeURIComponent(
        sName,
      )}&productId=${encodeURIComponent(product.id)}&productName=${encodeURIComponent(product.name)}`,
    )
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

    const matchesBuilding =
      buildingFilter === 'Todos' ||
      product.preferredBuilding === buildingFilter ||
      (buildingFilter === 'D' && !product.preferredBuilding)

    return matchesQuery && matchesCategory && matchesDietary && matchesBuilding
  })

  return (
    <div className={user ? 'space-y-6' : 'mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6'}>
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary font-mono">
            <Sparkles size={14} />
            <span>Catálogo Libre en Campus Icesi</span>
          </div>
          <h1 className="mt-1 font-display text-3xl font-black tracking-tight sm:text-4xl text-foreground">
            Snacks y Postres Disponibles
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Explora las preparaciones de hoy, aparta tu favorito y retira en los casilleros de los <strong>Edificios D, M y L</strong>.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:max-w-xs">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar brownie, galleta, vegano..."
            className="w-full rounded-2xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Main Filter Bar */}
      <div className="space-y-3 rounded-3xl border border-border/80 bg-card p-5 shadow-sm">
        {/* Categories Carousel */}
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-2 font-mono">
            Categorías
          </span>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {FILTERS.map((filter) => {
              const active = category === filter
              return (
                <button
                  type="button"
                  key={filter}
                  onClick={() => {
                    playKeyBeep(500)
                    setCategory(filter)
                  }}
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

        {/* Building selector + Dietary */}
        <div className="flex flex-col gap-3 pt-3 border-t border-border/60 sm:flex-row sm:items-center sm:justify-between">
          {/* Edificios Icesi Filters */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 font-mono">
              <Building2 size={13} className="text-primary" /> Edificio:
            </span>
            <div className="flex gap-1.5">
              {['Todos', 'D', 'M', 'L'].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => {
                    playKeyBeep(550)
                    setBuildingFilter(b)
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-mono font-bold transition-colors ${
                    buildingFilter === b
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {b === 'Todos' ? 'Todos' : `Edif. ${b}`}
                </button>
              ))}
            </div>
          </div>

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
            {DIETARY_OPTIONS.slice(0, 4).map((opt) => {
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
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          <p className="animate-pulse">Cargando catálogo universitario...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-border bg-card/40 p-8">
          <ShoppingBag size={48} className="mx-auto mb-3 text-muted-foreground/40" />
          <h3 className="font-display text-lg font-bold">No se encontraron snacks con estos filtros</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Prueba cambiando la categoría, la dieta o el edificio seleccionado.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setCategory('Todos')
              setDietaryFilter(null)
              setBuildingFilter('Todos')
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
              Mostrando <strong className="text-foreground">{filtered.length}</strong> snacks disponibles para apartar
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onApartar={handleOpenApartarModal}
              />
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: CONFIRMACIÓN DE APARTADO                         */}
      {/* ========================================================= */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl border-2 border-primary/40 bg-card p-6 shadow-2xl space-y-5">
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                <BookmarkCheck size={26} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-primary">
                  Confirmación de Apartado
                </span>
                <h3 className="font-display text-lg font-bold text-foreground">
                  ¿Deseas apartar este producto?
                </h3>
              </div>
            </div>

            {/* Snack Summary Card */}
            <div className="rounded-2xl border border-border/80 bg-secondary/40 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedProduct.image_url || '/images/snack_anime_brownie.jpg'}
                  alt={selectedProduct.name}
                  className="h-14 w-14 rounded-xl object-cover border border-border"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-bold text-foreground text-sm truncate">
                    {selectedProduct.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Cocinero: {displaySeller(selectedProduct.seller)}
                  </p>
                  <p className="font-mono text-sm font-extrabold text-primary mt-0.5">
                    {money(selectedProduct.price)}
                  </p>
                </div>
              </div>

              {/* Building Choice */}
              <div className="border-t border-border/60 pt-3">
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1.5 font-mono">
                  ¿En qué casillero prefieres retirarlo?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['D', 'M', 'L'] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBuilding(b)}
                      className={`rounded-xl py-2 px-2 text-xs font-mono font-bold border transition-all ${
                        selectedBuilding === b
                          ? 'border-primary bg-primary text-primary-foreground shadow-md'
                          : 'border-border bg-card text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Edificio {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Al apartar, el snack se reserva para ti en la lista de <strong>Productos Apartados</strong> y podrás chatear de inmediato con el vendedor para coordinar el casillero de entrega.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="flex-1 rounded-xl border border-border bg-secondary py-3 text-xs font-display font-semibold text-foreground hover:bg-secondary/80 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmApartar}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-amber-500 py-3 text-xs font-display font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110 active:scale-95 transition-all"
              >
                <BookmarkCheck size={15} />
                <span>Confirmar Apartado</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: ÉXITO DE APARTADO & ACCIONES (CHAT / APARTADOS)  */}
      {/* ========================================================= */}
      {apartadoSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl border-2 border-emerald-500/50 bg-card p-6 shadow-2xl space-y-5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-400">
                ¡Producto Apartado con Éxito!
              </span>
              <h3 className="font-display text-xl font-bold text-foreground">
                {apartadoSuccess.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                Asignado a retiro en casilleros del <strong>Edificio {selectedBuilding}</strong>.
              </p>
            </div>

            <div className="rounded-2xl bg-secondary/50 p-4 text-xs text-muted-foreground text-left space-y-2">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles size={14} className="text-primary" /> ¿Qué deseas hacer ahora?
              </p>
              <p className="text-[11px]">
                Puedes chatear con <strong>{displaySeller(apartadoSuccess.seller)}</strong> para afinar el punto de entrega o ir a ver tus productos apartados para generar tu PIN de retiro.
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  const item = apartadoSuccess
                  setApartadoSuccess(null)
                  handleGoToChat(item)
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-amber-500 py-3.5 text-xs font-display font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110 active:scale-95 transition-all"
              >
                <MessageCircle size={16} />
                <span>Chatear con el Vendedor sobre la Entrega</span>
              </button>

              <div className="flex gap-2">
                <Link
                  to="/carrito"
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary py-3 text-xs font-display font-semibold text-foreground hover:bg-secondary/80 transition-colors"
                >
                  <BookmarkCheck size={14} className="text-primary" />
                  <span>Ver Productos Apartados</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setApartadoSuccess(null)}
                  className="rounded-xl border border-border bg-secondary px-4 py-3 text-xs font-display font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Seguir Explorando
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
