import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  Bike,
  Building,
  ShoppingCart,
  Trash2,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { PageTransition } from '../components/PageTransition'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { displaySeller, money, ownsListing } from '../lib/format'
import { computeOrderFinancials } from '../lib/pricing'

export function CartPage() {
  const { user } = useAuth()
  const { items, setQty, remove } = useCart()
  const navigate = useNavigate()

  // Verify if any item belongs to the current user (vendor cannot buy their own product)
  const myOwnProductsInCart = items.filter((item) =>
    user ? ownsListing(item.seller, user.id, user.name) : false
  )
  const hasOwnProductError = myOwnProductsInCart.length > 0

  const financials = computeOrderFinancials(
    items.map((i) => ({ price: i.price, qty: i.qty }))
  )

  const handleProceedToCheckout = () => {
    if (hasOwnProductError) return
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } })
      return
    }
    navigate('/checkout')
  }

  if (items.length === 0) {
    return (
      <PageTransition>
        <div className="py-20 text-center space-y-4">
          <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-3xl bg-secondary/80 text-muted-foreground">
            <ShoppingCart size={36} className="text-primary opacity-60" />
          </div>
          <h2 className="font-display text-2xl font-black text-foreground">Tu carrito está vacío</h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
            Explora las preparaciones gastronómicas de hoy y recíbelas en minutos donde estés en el campus.
          </p>
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-display text-xs font-bold text-white shadow-md hover:bg-[#751010] active:scale-95 transition-all cursor-pointer"
          >
            <span>Explorar Snacks</span>
          </Link>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-1.5 text-xs font-display font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Seguir comprando snacks</span>
          </Link>
          <span className="font-mono text-xs text-muted-foreground">
            {items.reduce((s, i) => s + i.qty, 0)} {items.reduce((s, i) => s + i.qty, 0) === 1 ? 'snack seleccionado' : 'snacks seleccionados'}
          </span>
        </div>

        {/* Alerta de restricción: un vendedor no puede comprar su propio producto */}
        {hasOwnProductError && (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-xs font-medium text-destructive flex items-center gap-3">
            <AlertTriangle size={18} className="shrink-0" />
            <div>
              <strong className="block font-bold">Conflicto de roles de compra</strong>
              <span>
                Tienes productos propios en tu carrito ({myOwnProductsInCart.map((i) => i.name).join(', ')}). Un vendedor no puede comprar sus propios productos. Por favor retíralos para continuar.
              </span>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Listado de Productos */}
          <div className="space-y-4 lg:col-span-2">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-border bg-card p-4 shadow-sm"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={item.image_url || '/images/real_brownie.jpg'}
                      alt={item.name}
                      className="h-20 w-20 shrink-0 rounded-2xl object-cover border border-border"
                    />
                    <div className="min-w-0">
                      <h3 className="font-display text-base font-bold text-foreground truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Elaborado por <strong className="text-foreground">{displaySeller(item.seller)}</strong>
                      </p>
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground mt-1">
                        <Building size={12} className="text-primary" /> Punto de recogida: Edif. {item.building || 'D'}
                      </span>
                      <p className="font-mono text-sm font-black text-primary mt-1">
                        {money(item.price)} <span className="text-[10px] text-muted-foreground font-normal">c/u</span>
                      </p>
                    </div>
                  </div>

                  {/* Cantidad y Eliminar */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
                    <div className="flex items-center gap-2 rounded-xl bg-secondary/80 p-1 border border-border/60">
                      <button
                        type="button"
                        onClick={() => setQty(item.productId, item.qty - 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-card text-xs font-bold hover:bg-card/80 active:scale-95 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="min-w-5 text-center font-display text-xs font-bold">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty(item.productId, item.qty + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-card text-xs font-bold hover:bg-card/80 active:scale-95 cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(item.productId)}
                      className="p-2 text-muted-foreground hover:text-rose-500 transition-colors rounded-xl hover:bg-rose-500/10 cursor-pointer"
                      title="Eliminar snack"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Resumen Lateral */}
          <aside className="h-fit space-y-4 rounded-3xl border border-border bg-card p-6 shadow-xl backdrop-blur-md">
            <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <Bike size={16} className="text-primary" /> Resumen de Pedido y Entrega
            </h2>

            <div className="space-y-2 border-y border-border py-4 text-xs font-mono">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal snacks ({items.reduce((s, i) => s + i.qty, 0)} uds):</span>
                <span className="font-semibold text-foreground">{money(financials.itemsSubtotal)}</span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span className="flex items-center gap-1 text-primary font-medium">
                  <Bike size={12} /> Domicilio por distancia ($100 - $500):
                </span>
                <span className="font-bold text-emerald-600 font-mono">
                  +{money(financials.deliveryFee)} COP
                </span>
              </div>

              <div className="flex justify-between text-muted-foreground text-[11px]">
                <span>Comisión de servicio plataforma:</span>
                <span>{money(financials.bocadoCommission)} COP</span>
              </div>

              <div className="flex justify-between text-muted-foreground pt-1">
                <span>Cobertura:</span>
                <span className="font-semibold text-foreground">Universidad Icesi</span>
              </div>
            </div>

            <div className="flex items-baseline justify-between pt-1 font-display">
              <span className="text-sm font-semibold text-muted-foreground">Total a pagar:</span>
              <span className="text-2xl font-black text-primary">{money(financials.totalBuyerPays)}</span>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              En el siguiente paso podrás pagar de forma segura con la pasarela integrada (Nequi, Daviplata o PSE) e indicar en qué edificio te encuentras.
            </p>

            <button
              type="button"
              disabled={hasOwnProductError}
              onClick={handleProceedToCheckout}
              className="w-full rounded-2xl bg-primary hover:bg-[#751010] py-4 text-center font-display text-xs font-extrabold text-white shadow-md active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
            >
              {hasOwnProductError ? 'Corrige productos propios para continuar' : 'Proceder al Pago en Línea'}
            </button>
          </aside>
        </div>
      </div>
    </PageTransition>
  )
}
