import { ArrowLeft, ShoppingBag, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BrandMark } from '../components/BrandMark'
import { useCart } from '../context/CartContext'
import { displaySeller, money } from '../lib/format'

export function CartPage() {
  const { items, total, setQty, remove } = useCart()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <ShoppingBag size={32} />
        </div>
        <h1 className="font-display text-2xl font-bold">Tu bolsa de reserva está vacía</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Explora los snacks disponibles hoy en la universidad y apártalos antes de tu receso.
        </p>
        <Link
          to="/catalogo"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-display text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90"
        >
          Ver snacks disponibles →
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Bolsa de Reserva</h1>
            <p className="text-xs text-muted-foreground">
              {items.length} snack(s) listos para coordinar entrega en campus.
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
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 rounded-2xl border border-border/80 bg-card p-4 shadow-sm items-center"
            >
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="h-20 w-20 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                  <BrandMark size={28} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="truncate font-display font-bold text-foreground text-sm sm:text-base">
                      {item.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">Vendido por: {displaySeller(item.seller)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.productId)}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    title="Eliminar snack"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="mt-2.5 flex items-center justify-between gap-3">
                  <p className="font-display font-extrabold text-primary text-base">
                    {money(item.price * item.qty)}
                  </p>

                  <div className="flex items-center gap-2 rounded-lg bg-secondary/80 p-1">
                    <button
                      type="button"
                      onClick={() => setQty(item.productId, item.qty - 1)}
                      className="flex h-6 w-6 items-center justify-center rounded bg-card text-xs font-bold hover:bg-card/80 active:scale-95"
                    >
                      -
                    </button>
                    <span className="min-w-5 text-center font-display text-xs font-bold">{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(item.productId, item.qty + 1)}
                      className="flex h-6 w-6 items-center justify-center rounded bg-card text-xs font-bold hover:bg-card/80 active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="h-fit space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-display text-base font-bold text-foreground">Resumen de entrega</h2>
        <div className="space-y-2 border-y border-border py-4 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal de snacks:</span>
            <span className="font-semibold text-foreground">{money(total)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Método de pago:</span>
            <span className="font-semibold text-foreground">Efectivo / Nequi al recibir</span>
          </div>
        </div>

        <div className="flex items-baseline justify-between pt-1 font-display">
          <span className="text-sm font-semibold text-muted-foreground">Total estimado:</span>
          <span className="text-2xl font-bold text-primary">{money(total)}</span>
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed">
          En el siguiente paso podrás elegir el punto de encuentro en el campus y coordinar por chat con el vendedor.
        </p>

        <Link
          to="/checkout"
          className="block w-full rounded-xl bg-primary py-3.5 text-center font-display text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition-all"
        >
          Continuar a elegir punto de encuentro →
        </Link>
      </aside>
    </div>
  )
}
