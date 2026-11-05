import {
  Receipt,
  Search,
  ShoppingBag,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition } from '../components/PageTransition'
import { ProductCard } from '../components/ProductCard'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { fetchProducts, incrementMetric, updateProduct } from '../lib/api'
import { FILTERS, PICKUP_POINTS } from '../lib/constants'
import { displaySeller, hasTag, money } from '../lib/format'
import { computeOrderFinancials } from '../lib/pricing'
import { playKeyBeep, playPaymentSuccess } from '../lib/sounds'
import { saveOrder } from '../lib/storage-db'
import type { Order, Product } from '../types'

export function CatalogPage() {
  const { user } = useAuth()
  const { add } = useCart()
  const { success, bonus } = useToast()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<(typeof FILTERS)[number]>('Todos')
  const [budgetOnly, setBudgetOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  // Confirmation Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [deliveryLocation, setDeliveryLocation] = useState<string>('Edificio D (Plazoleta / Pisos)')
  const [apartadoSuccess, setApartadoSuccess] = useState<{
    product: Product
    orderId: string
    total: number
    location: string
  } | null>(null)

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
    if (!user) {
      add(product, 1)
      success('¡Snack añadido al carrito!', `1x ${product.name} guardado. Puedes revisarlo en tu carrito.`)
      return
    }
    setSelectedProduct(product)
  }

  const handleConfirmApartar = async () => {
    if (!selectedProduct) return
    if (!user) {
      navigate('/login', { state: { from: `/catalogo` } })
      return
    }

    setIsProcessing(true)
    try {
      playPaymentSuccess()

      const sName = displaySeller(selectedProduct.seller)
      const chosenLoc = deliveryLocation.trim() || 'Edificio D (Plazoleta / Pisos)'
      const financials = computeOrderFinancials(
        [{ price: selectedProduct.price, qty: 1 }],
        { origin: 'Edificio D', destination: chosenLoc }
      )

      const orderId = `order_${Date.now()}`

      const order: Order = {
        id: orderId,
        buyerId: user.id,
        buyerName: user.name,
        buyerEmail: user.email,
        sellerKey: selectedProduct.seller,
        sellerName: sName,
        items: [
          {
            productId: selectedProduct.id,
            name: selectedProduct.name,
            price: selectedProduct.price,
            qty: 1,
            image_url: selectedProduct.image_url,
          },
        ],
        total: financials.totalBuyerPays,
        pickup: 'Punto de encuentro del campus',
        deliveryLocation: chosenLoc,
        deliveryFee: financials.deliveryFee,
        note: '',
        status: 'solicitado',
        createdAt: new Date().toISOString(),
        isGuaranteed: false,
        platformCommission: financials.bocadoCommission,
        sellerNetRevenue: financials.vendorPayout,
        buyerBuilding: chosenLoc,
        sellerBuilding: 'Móvil en campus',
        sellerBuildingConfirmed: false,
        bocadoCommission: financials.bocadoCommission,
        vendorPayout: financials.vendorPayout,
        tendederoPayout: financials.tendederoReimbursementAndFee,
        tendederoConfirmed: false,
        buyerConfirmed: false,
        sellerPaidConfirmed: false,
      }

      await saveOrder(order)
      add(selectedProduct, 1)
      void updateProduct(selectedProduct.id, {
        intent_count: (selectedProduct.intent_count || 0) + 1,
      })
      void incrementMetric('total_intents')

      const confirmed = selectedProduct
      setSelectedProduct(null)
      bonus('¡Pedido creado con éxito!', `Tu orden está disponible para ser tomada por un Domiciliario.`)
      setApartadoSuccess({ product: confirmed, orderId, total: financials.totalBuyerPays, location: chosenLoc })
    } finally {
      setIsProcessing(false)
    }
  }

  // Filter products
  const availableProducts = products.filter((p) => !p.sold_out && p.stock > 0)

  const filtered = availableProducts.filter((product) => {
    const q = query.toLowerCase()
    const matchesQuery =
      !q ||
      product.name.toLowerCase().includes(q) ||
      (product.category && product.category.toLowerCase().includes(q)) ||
      product.seller.toLowerCase().includes(q)

    const matchesCategory = category === 'Todos' || hasTag(product.category, category)
    const matchesBudget = !budgetOnly || product.price <= 4000

    return matchesQuery && matchesCategory && matchesBudget
  })

  return (
    <PageTransition>
      <div className={user ? 'space-y-8' : 'mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6'}>
        {/* Minimalist Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-[#E5DFD7] dark:border-[#2C2420] pb-6">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#8F1414] dark:text-red-400 font-bold block mb-1">
              Campus Icesi · Hecho por Estudiantes
            </span>
            <h1 className="font-display text-3xl font-black sm:text-4xl text-[#2C221C] dark:text-[#FAF6F0]">
              Snacks y Postres Artesanales
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#7E726A] dark:text-[#A89C92]">
              Preparaciones frescas del día. Pide tu favorito y recíbelo en tu clase con domiciliarios del campus.
            </p>
          </div>

          {/* Minimal Search Bar */}
          <div className="relative w-full sm:max-w-xs">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7E726A]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o snack..."
              className="w-full rounded-2xl border border-[#E5DFD7] dark:border-[#2C2420] bg-white dark:bg-[#1E1917] py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[#2C221C] dark:text-[#FAF6F0] outline-none transition-all focus:border-[#8F1414]"
            />
          </div>
        </div>

        {/* Minimal Category Filter Strip */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar pb-1">
          <div className="flex gap-2">
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
                  className={`rounded-full px-4 py-2 text-xs font-display font-bold transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#8F1414] text-white shadow-xs'
                      : 'bg-white dark:bg-[#1E1917] text-[#7E726A] dark:text-[#A89C92] hover:text-[#2C221C] border border-[#E5DFD7] dark:border-[#2C2420]'
                  }`}
                >
                  {filter}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={() => setBudgetOnly(!budgetOnly)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-mono font-bold transition-all cursor-pointer shrink-0 border ${
              budgetOnly
                ? 'bg-[#8F1414] text-white border-[#8F1414]'
                : 'bg-white dark:bg-[#1E1917] text-[#7E726A] border-[#E5DFD7] dark:border-[#2C2420]'
            }`}
          >
            {budgetOnly ? '✓ Menos de $4.000' : '≤ $4.000 COP'}
          </button>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-4/3 rounded-3xl bg-[#EFE8DE] dark:bg-[#251F1C] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center space-y-3 rounded-3xl border border-dashed border-[#E5DFD7] dark:border-[#2C2420] p-8">
            <ShoppingBag size={40} className="mx-auto text-[#7E726A] opacity-40" />
            <h3 className="font-display text-lg font-bold text-[#2C221C] dark:text-[#FAF6F0]">
              No hay snacks en esta categoría
            </h3>
            <p className="text-xs text-[#7E726A]">
              Prueba con otro término de búsqueda o mira todas las preparaciones disponibles.
            </p>
            <button
              type="button"
              onClick={() => {
                setCategory('Todos')
                setQuery('')
                setBudgetOnly(false)
              }}
              className="mt-2 rounded-xl bg-[#8F1414] px-4 py-2 text-xs font-bold text-white shadow-xs"
            >
              Ver Todo el Catálogo
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          >
            <AnimatePresence>
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onApartar={handleOpenApartarModal}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Modal: Pedir Snack y Seleccionar Ubicación de Entrega */}
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border border-[#E5DFD7] dark:border-[#2C2420] bg-white dark:bg-[#1E1917] p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[#F0EAE1] dark:border-[#2C2420] pb-3">
                <h3 className="font-display text-lg font-bold text-[#2C221C] dark:text-[#FAF6F0]">
                  Confirmar Pedido de Snack
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="rounded-full p-1 text-[#7E726A] hover:bg-[#F4EFE6] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex gap-4 items-center">
                <img
                  src={selectedProduct.image_url || '/images/real_brownie.jpg'}
                  alt={selectedProduct.name}
                  className="h-16 w-16 rounded-2xl object-cover bg-[#F4EFE6]"
                />
                <div>
                  <h4 className="font-display font-bold text-base text-[#2C221C] dark:text-[#FAF6F0]">
                    {selectedProduct.name}
                  </h4>
                  <span className="font-mono text-sm font-bold text-[#8F1414] dark:text-red-400">
                    {money(selectedProduct.price)}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C221C] dark:text-[#FAF6F0] block">
                  ¿En qué edificio de la U estás? (Para entrega del Domiciliario)
                </label>
                <select
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  className="w-full rounded-2xl border border-[#E5DFD7] dark:border-[#2C2420] bg-[#FAF6F0] dark:bg-[#251F1C] px-3.5 py-3 text-xs font-semibold outline-none focus:border-[#8F1414]"
                >
                  {PICKUP_POINTS.map((pt) => (
                    <option key={pt} value={pt}>
                      {pt}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#7E726A]">
                  La tarifa de entrega se calcula automáticamente según la distancia de tu aula ($100 a $500 COP).
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 rounded-2xl border border-[#E5DFD7] dark:border-[#2C2420] py-3 text-xs font-bold text-[#7E726A] hover:bg-[#F4EFE6] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => void handleConfirmApartar()}
                  className="flex-1 rounded-2xl bg-[#8F1414] hover:bg-[#751010] py-3 text-xs font-bold text-white shadow-md transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Procesando...' : 'Pedir Ahora'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal: Éxito */}
        {apartadoSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md rounded-3xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-[#1E1917] p-6 shadow-2xl text-center space-y-4"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                <Receipt size={28} />
              </div>
              <h3 className="font-display text-xl font-black text-[#2C221C] dark:text-[#FAF6F0]">
                ¡Pedido Creado!
              </h3>
              <p className="text-xs text-[#7E726A] leading-relaxed">
                Tu solicitud de <strong>{apartadoSuccess.product.name}</strong> quedó registrada en el campus para entrega en <strong>{apartadoSuccess.location}</strong>.
              </p>
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setApartadoSuccess(null)}
                  className="flex-1 rounded-2xl border border-[#E5DFD7] dark:border-[#2C2420] py-3 text-xs font-bold text-[#7E726A]"
                >
                  Seguir Viendo
                </button>
                <Link
                  to="/pedidos"
                  className="flex-1 rounded-2xl bg-[#8F1414] hover:bg-[#751010] py-3 text-xs font-bold text-white shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>Ver Mis Pedidos</span>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
