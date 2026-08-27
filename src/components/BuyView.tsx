import { useCallback, useEffect, useState } from 'react'
import { Heart, Search, ShoppingBag, ThumbsDown, ThumbsUp } from 'lucide-react'
import { FILTERS, USEFUL_ANSWERED_KEY } from '../lib/constants'
import { fetchProducts, incrementMetric, updateProduct } from '../lib/api'
import type { Product } from '../types'

export function BuyView() {
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<(typeof FILTERS)[number]>('Todas')
  const [answered, setAnswered] = useState(
    () => !!localStorage.getItem(USEFUL_ANSWERED_KEY),
  )

  const refresh = useCallback(async () => {
    setProducts(await fetchProducts())
  }, [])

  useEffect(() => {
    void refresh()
    const id = setInterval(() => void refresh(), 3000)
    return () => clearInterval(id)
  }, [refresh])

  const wantIt = async (product: Product) => {
    await updateProduct(product.id, { intent_count: product.intent_count + 1 })
    await incrementMetric('total_intents')
    await refresh()
  }

  const answerUseful = async (yes: boolean) => {
    await incrementMetric(yes ? 'useful_yes' : 'useful_no')
    localStorage.setItem(USEFUL_ANSWERED_KEY, 'true')
    setAnswered(true)
  }

  const visible = products
    .filter((p) => !p.sold_out && p.stock > 0)
    .filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.seller.toLowerCase().includes(query.toLowerCase()),
    )
    .filter((p) => category === 'Todas' || p.category === category)

  return (
    <div className="space-y-4">
      {!answered && (
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm text-foreground mb-3 font-display font-medium text-center">
            ¿Te es útil ver todo el mecato en un solo lugar?
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => void answerUseful(true)}
              className="flex-1 touch-target flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg font-display font-semibold text-base transition-transform active:scale-95"
            >
              <ThumbsUp size={18} /> SÍ
            </button>
            <button
              type="button"
              onClick={() => void answerUseful(false)}
              className="flex-1 touch-target flex items-center justify-center gap-2 bg-secondary text-secondary-foreground rounded-lg font-display font-semibold text-base transition-transform active:scale-95"
            >
              <ThumbsDown size={18} /> NO
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          placeholder="Buscar snack o vendedor..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-card border border-border text-foreground rounded-lg pl-10 pr-4 py-3 text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring font-body"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
        {FILTERS.map((filter) => (
          <button
            type="button"
            key={filter}
            onClick={() => setCategory(filter)}
            className={`px-4 py-2 rounded-full text-sm font-display font-semibold whitespace-nowrap transition-colors ${
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
        <div className="text-center py-16">
          <ShoppingBag size={48} className="mx-auto text-muted-foreground mb-4 opacity-40" />
          <p className="text-muted-foreground text-sm">
            {query ? 'No se encontraron snacks' : 'No hay snacks disponibles aún'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((product) => (
            <div
              key={product.id}
              className="bg-card rounded-lg border border-border overflow-hidden"
            >
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-36 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1 mr-3">
                    <h3 className="font-display font-semibold text-foreground text-lg truncate">
                      {product.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">por {product.seller}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-display font-semibold">
                      {product.category}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display font-bold text-primary text-xl">
                      ${product.price.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.stock} disponibles
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void wantIt(product)}
                  className="w-full touch-target bg-primary text-primary-foreground rounded-lg font-display font-bold text-base transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <Heart size={18} /> ¡Lo quiero! ({product.intent_count})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
