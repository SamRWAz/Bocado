import {
  ArrowLeft,
  Bike,
  BookmarkCheck,
  MessageCircle,
  Trash2,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { DELIVERY_FEE } from '../lib/constants'
import { displaySeller, money, sellerUserId } from '../lib/format'
import { playKeyBeep } from '../lib/sounds'

export function CartPage() {
  const { user } = useAuth()
  const { items, total, setQty, remove } = useCart()
  const navigate = useNavigate()

  const handleStartChatWithSeller = (sellerKey: string, productId: string, productName: string) => {
    playKeyBeep(600)
    const sId = sellerUserId(sellerKey)
    const sName = displaySeller(sellerKey)
    if (!user) {
      navigate('/login', { state: { from: `/carrito` } })
      return
    }
    navigate(
      `/mensajes?partnerId=${encodeURIComponent(sId)}&partnerName=${encodeURIComponent(
        sName,
      )}&productId=${encodeURIComponent(productId)}&productName=${encodeURIComponent(productName)}`,
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-primary">
          <BookmarkCheck size={32} />
        </div>
        <h1 className="font-display text-2xl font-bold">No tienes productos en tu carrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Explora los snacks disponibles hoy en el campus y pídelos para que un Tendedero te los lleve a tu salón o plazoleta en Icesi.
        </p>
        <Link
          to="/catalogo"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-display text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90"
        >
          Ver snacks disponibles en campus →
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-primary mb-1">
              <Bike size={14} />
              <span>Pedidos a Domicilio en Campus</span>
            </div>
            <h1 className="font-display text-2xl font-black tracking-tight sm:text-3xl text-foreground">
              Snacks en tu Carrito
            </h1>
            <p className="text-xs text-muted-foreground">
              {items.length} producto(s) listos para pedir y recibir con un Tendedero universitario.
            </p>
          </div>
          <Link
            to="/catalogo"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <ArrowLeft size={14} /> Seguir explorando snacks
          </Link>
        </div>

        <div className="space-y-3">
          {items.map((item) => {
            return (
              <div
                key={item.productId}
                className="flex flex-col sm:flex-row gap-4 rounded-3xl border border-border/80 bg-card p-4 shadow-sm items-start sm:items-center justify-between"
              >
                <div className="flex gap-3 min-w-0 flex-1 items-center">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-20 w-20 shrink-0 rounded-2xl object-cover border border-border"
                    />
                  ) : (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-secondary text-muted-foreground/50 border border-border/60">
                      <BookmarkCheck size={26} className="text-primary" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">
                        Cocinero: <strong>{displaySeller(item.seller)}</strong>
                      </span>
                    </div>

                    <h3 className="truncate font-display font-bold text-foreground text-sm sm:text-base">
                      {item.name}
                    </h3>

                    <p className="font-mono text-base font-extrabold text-primary">
                      {money(item.price * item.qty)}
                    </p>
                  </div>
                </div>

                {/* Right Action buttons: Chat & Qty & Delete */}
                <div className="flex flex-wrap sm:flex-col items-end gap-2.5 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-border/60 justify-between sm:justify-end">
                  <button
                    type="button"
                    onClick={() => handleStartChatWithSeller(item.seller, item.productId, item.name)}
                    className="flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-display font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    <MessageCircle size={14} />
                    <span>Hablar con el Vendedor</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-xl bg-secondary/80 p-1 border border-border/60">
                      <button
                        type="button"
                        onClick={() => setQty(item.productId, item.qty - 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-lg bg-card text-xs font-bold hover:bg-card/80 active:scale-95"
                      >
                        -
                      </button>
                      <span className="min-w-5 text-center font-display text-xs font-bold">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty(item.productId, item.qty + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-lg bg-card text-xs font-bold hover:bg-card/80 active:scale-95"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(item.productId)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                      title="Eliminar apartado"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary Sidebar */}
      <aside className="h-fit space-y-4 rounded-3xl border border-border bg-card p-6 shadow-xl backdrop-blur-md">
        <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
          <Bike size={16} className="text-primary" /> Resumen de Entrega con Tendedero
        </h2>

        <div className="space-y-2 border-y border-border py-4 text-xs font-mono">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal snacks ({items.reduce((s, i) => s + i.qty, 0)} uds):</span>
            <span className="font-semibold text-foreground">{money(total)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span className="flex items-center gap-1 text-primary font-medium">
              <Bike size={12} /> Envío Tendedero (fijo):
            </span>
            <span className="font-bold text-primary">+{money(DELIVERY_FEE)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Zona de cobertura:</span>
            <span className="font-semibold text-foreground">Universidad Icesi</span>
          </div>
        </div>

        <div className="flex items-baseline justify-between pt-1 font-display">
          <span className="text-sm font-semibold text-muted-foreground">Total con domicilio:</span>
          <span className="text-2xl font-black text-primary">{money(total + DELIVERY_FEE)}</span>
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed">
          En el checkout ingresarás tu ubicación en campus (salón, piso o plazoleta) y se abrirá la solicitud para los <strong>Tendederos</strong> disponibles.
        </p>

        <Link
          to="/checkout"
          className="block w-full rounded-2xl bg-primary hover:bg-[#751010] py-4 text-center font-display text-xs font-extrabold text-white shadow-md active:scale-95 transition-all"
        >
          Confirmar y Pedir Domicilio →
        </Link>
      </aside>
    </div>
  )
}
