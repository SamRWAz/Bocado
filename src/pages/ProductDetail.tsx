import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BrandMark } from '../components/BrandMark'
import { TagList } from '../components/TagList'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { fetchProduct, incrementMetric, updateProduct } from '../lib/api'
import { displaySeller, money, parseTags, productDescription, shopPath } from '../lib/format'
import type { Product } from '../types'

export function ProductDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { add } = useCart()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [qty, setQty] = useState(1)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!id) return
    void fetchProduct(id).then(setProduct)
  }, [id])

  if (!product) {
    return (
      <p className="px-4 py-16 text-center text-sm text-muted-foreground">Cargando producto...</p>
    )
  }

  const addToCart = async () => {
    if (!user) {
      navigate('/login', { state: { from: shopPath(product.seller) } })
      return
    }
    add(product, qty)
    await updateProduct(product.id, { intent_count: product.intent_count + 1 })
    await incrementMetric('total_intents')
    setNotice('Agregado al carrito')
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-2">
      {product.image_url ? (
        <img src={product.image_url} alt={product.name} className="h-80 w-full rounded-lg object-cover" />
      ) : (
        <div className="flex h-80 items-center justify-center rounded-lg bg-card text-primary">
          <BrandMark size={64} />
        </div>
      )}
      <div>
        <Link to={shopPath(product.seller)} className="text-sm text-muted-foreground hover:text-foreground">
          por {displaySeller(product.seller)}
        </Link>
        <h1 className="mt-1 font-display text-3xl font-bold">{product.name}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{productDescription(product)}</p>
        <p className="mt-4 font-display text-3xl font-bold text-primary">{money(product.price)}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {product.stock} disponibles · {product.intent_count} personas lo quieren
        </p>
        <TagList tags={parseTags(product.category)} size="md" />
        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQty((n) => Math.max(1, n - 1))}
            className="touch-target rounded-lg bg-secondary"
          >
            -
          </button>
          <span className="min-w-8 text-center font-display text-lg font-bold">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((n) => Math.min(product.stock, n + 1))}
            className="touch-target rounded-lg bg-secondary"
          >
            +
          </button>
        </div>
        {notice && <p className="mt-4 text-sm text-primary">{notice}</p>}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => void addToCart()}
            className="flex-1 rounded-lg bg-primary py-3 font-display font-bold text-primary-foreground"
          >
            Agregar al carrito
          </button>
          <Link to="/carrito" className="flex-1 rounded-lg bg-secondary py-3 text-center font-display font-semibold">
            Ir al carrito
          </Link>
        </div>
      </div>
    </div>
  )
}
