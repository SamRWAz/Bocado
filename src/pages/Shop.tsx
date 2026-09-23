import { ArrowLeft } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { TagList } from '../components/TagList'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { fetchProducts, incrementMetric, updateProduct } from '../lib/api'
import { findShop } from '../lib/shops'
import type { Product } from '../types'

export function ShopPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const { add } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setProducts(await fetchProducts())
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const shop = slug ? findShop(products, slug) : null
  const available = shop?.products.filter((p) => !p.sold_out && p.stock > 0) ?? []

  const addToCart = async (product: Product) => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    add(product)
    void updateProduct(product.id, { intent_count: product.intent_count + 1 })
    void incrementMetric('total_intents')
    navigate('/carrito')
  }

  if (loading) {
    return <p className="py-16 text-center text-sm text-muted-foreground">Cargando tienda...</p>
  }

  if (!shop) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-muted-foreground">Esta tienda no existe o ya no tiene productos.</p>
        <Link to="/catalogo" className="mt-4 inline-block text-primary">
          Volver al catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className={user ? 'space-y-6' : 'mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6'}>
      <div>
        <Link to="/catalogo" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} />
          Catálogo
        </Link>
        <h1 className="mt-3 font-display text-3xl font-bold">{shop.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {available.length} {available.length === 1 ? 'producto disponible' : 'productos disponibles'}
        </p>
        <TagList tags={shop.tags} size="md" />
      </div>

      {available.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Esta tienda no tiene productos disponibles.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {available.map((product) => (
            <ProductCard key={product.id} product={product} onApartar={(item) => void addToCart(item)} />
          ))}
        </div>
      )}
    </div>
  )
}
