import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { displaySeller, money } from '../lib/format'

export function CartPage() {
  const { items, total, setQty, remove } = useCart()

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Tu carrito está vacío</h1>
        <Link to="/catalogo" className="mt-4 inline-block text-primary">
          Volver al catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-3">
        <h1 className="font-display text-3xl font-bold">Carrito</h1>
        {items.map((item) => (
          <div key={item.productId} className="flex gap-4 rounded-lg border border-border bg-card p-4">
            {item.image_url ? (
              <img src={item.image_url} alt={item.name} className="h-20 w-20 rounded-md object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-md bg-secondary">🍿</div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-display font-semibold">{item.name}</p>
              <p className="text-xs text-muted-foreground">{displaySeller(item.seller)}</p>
              <p className="mt-1 font-bold text-primary">{money(item.price)}</p>
              <div className="mt-2 flex items-center gap-2">
                <button type="button" onClick={() => setQty(item.productId, item.qty - 1)} className="rounded bg-secondary px-2">
                  -
                </button>
                <span>{item.qty}</span>
                <button type="button" onClick={() => setQty(item.productId, item.qty + 1)} className="rounded bg-secondary px-2">
                  +
                </button>
                <button type="button" onClick={() => remove(item.productId)} className="ml-auto text-xs text-destructive">
                  Quitar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <aside className="h-fit rounded-lg border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">Total</p>
        <p className="font-display text-3xl font-bold text-primary">{money(total)}</p>
        <p className="mt-2 text-xs text-muted-foreground">Pagas al recoger. Aquí solo reservas la comida.</p>
        <Link
          to="/checkout"
          className="mt-5 block rounded-lg bg-primary py-3 text-center font-display font-bold text-primary-foreground"
        >
          Reservar pedido
        </Link>
      </aside>
    </div>
  )
}
