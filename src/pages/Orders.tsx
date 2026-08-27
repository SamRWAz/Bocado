import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { money } from '../lib/format'
import { fetchOrders, saveOrder } from '../lib/storage-db'
import type { Order, OrderStatus } from '../types'

const labels: Record<OrderStatus, string> = {
  reservado: 'Reservado',
  listo: 'Listo para recoger',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

export function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [tab, setTab] = useState<'compras' | 'ventas'>('compras')

  const refresh = useCallback(async () => {
    const all = await fetchOrders()
    setOrders(all.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const mine = orders.filter((order) => order.buyerId === user?.id)
  const selling = orders.filter((order) => order.sellerKey.endsWith(`::${user?.id}`))
  const list = tab === 'compras' ? mine : selling

  const setStatus = async (order: Order, status: OrderStatus) => {
    await saveOrder({ ...order, status })
    await refresh()
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl font-bold">Pedidos</h1>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab('compras')}
          className={`rounded-lg px-4 py-2 text-sm font-display font-semibold ${tab === 'compras' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
        >
          Mis compras ({mine.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('ventas')}
          className={`rounded-lg px-4 py-2 text-sm font-display font-semibold ${tab === 'ventas' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
        >
          Pedidos de mi puesto ({selling.length})
        </button>
      </div>
      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aún no hay pedidos aquí.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((order) => (
            <article key={order.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display font-semibold">
                    {tab === 'compras' ? order.sellerName : order.buyerName}
                  </p>
                  <p className="text-xs text-muted-foreground">{order.pickup}</p>
                </div>
                <span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-display font-semibold">
                  {labels[order.status]}
                </span>
              </div>
              <ul className="mt-3 space-y-1 text-sm">
                {order.items.map((item) => (
                  <li key={item.productId}>
                    {item.qty} × {item.name}
                  </li>
                ))}
              </ul>
              <p className="mt-3 font-display font-bold text-primary">{money(order.total)}</p>
              {order.note && <p className="mt-2 text-xs text-muted-foreground">{order.note}</p>}
              {tab === 'ventas' && order.status !== 'entregado' && order.status !== 'cancelado' && (
                <div className="mt-4 flex gap-2">
                  {order.status === 'reservado' && (
                    <button
                      type="button"
                      onClick={() => void setStatus(order, 'listo')}
                      className="flex-1 rounded-lg bg-primary py-2 text-sm font-display font-semibold text-primary-foreground"
                    >
                      Marcar listo
                    </button>
                  )}
                  {order.status === 'listo' && (
                    <button
                      type="button"
                      onClick={() => void setStatus(order, 'entregado')}
                      className="flex-1 rounded-lg bg-primary py-2 text-sm font-display font-semibold text-primary-foreground"
                    >
                      Entregado
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void setStatus(order, 'cancelado')}
                    className="rounded-lg bg-secondary px-3 py-2 text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
