import { CheckCircle2, Clock, MapPin, MessageSquare, ShieldCheck } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { formatTime, money, sellerUserId } from '../lib/format'
import { fetchOrders, saveOrder } from '../lib/storage-db'
import type { Order, OrderStatus } from '../types'

const labels: Record<OrderStatus, { label: string; color: string }> = {
  reservado: { label: 'Reservado', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  listo: { label: 'Listo para entrega', color: 'bg-primary/15 text-primary border-primary/30' },
  entregado: { label: 'Entregado', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  cancelado: { label: 'Cancelado', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
}

export function OrdersPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
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
  const selling = orders.filter(
    (order) => order.sellerKey.endsWith(`::${user?.id}`) || order.sellerKey === user?.id || order.sellerName === user?.name,
  )
  const list = tab === 'compras' ? mine : selling

  const setStatus = async (order: Order, status: OrderStatus) => {
    await saveOrder({ ...order, status })
    await refresh()
  }

  const openChatForOrder = (order: Order) => {
    const isBuyer = tab === 'compras'
    const partnerId = isBuyer ? sellerUserId(order.sellerKey) : order.buyerId
    const partnerName = isBuyer ? order.sellerName : order.buyerName
    const firstItem = order.items[0]?.name ?? 'Snack'

    navigate(
      `/mensajes?conv=order_${order.id}&partnerId=${encodeURIComponent(partnerId)}&partnerName=${encodeURIComponent(
        partnerName,
      )}&orderId=${order.id}&productName=${encodeURIComponent(firstItem)}`,
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Pedidos y Reservas</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Control de entregas y coordinación en campus.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-secondary p-1">
          <button
            type="button"
            onClick={() => setTab('compras')}
            className={`rounded-lg px-4 py-2 text-xs font-display font-semibold transition-all ${
              tab === 'compras'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Mis reservas ({mine.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('ventas')}
            className={`rounded-lg px-4 py-2 text-xs font-display font-semibold transition-all ${
              tab === 'ventas'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Entregas pendientes ({selling.length})
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center text-muted-foreground">
          <Clock size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-display font-semibold text-foreground">
            {tab === 'compras' ? 'No tienes reservas activas' : 'No tienes pedidos por entregar'}
          </p>
          <p className="mt-1 text-xs">
            {tab === 'compras'
              ? 'Explora el catálogo y aparta tus snacks favoritos antes de que se agoten.'
              : 'Publica tus snacks para que otros estudiantes puedan reservarte en el campus.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((order) => {
            const statusConfig = labels[order.status] ?? labels.reservado
            return (
              <article
                key={order.id}
                className="flex flex-col rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all hover:border-primary/40"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/60">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                      {tab === 'compras' ? 'Vendedor Estudiantil' : 'Comprador'}
                    </span>
                    <h3 className="font-display text-base font-bold text-foreground">
                      {tab === 'compras' ? order.sellerName : order.buyerName}
                    </h3>
                    <p className="flex items-center gap-1 text-xs text-primary font-medium mt-0.5">
                      <MapPin size={12} className="shrink-0" />
                      <span>{order.pickup}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-display font-semibold ${statusConfig.color}`}
                    >
                      {statusConfig.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{formatTime(order.createdAt)}</span>
                  </div>
                </div>

                {/* Items */}
                <ul className="my-3 space-y-1.5 text-xs divide-y divide-border/30">
                  {order.items.map((item) => (
                    <li key={item.productId} className="flex justify-between items-center pt-1.5 first:pt-0">
                      <span className="text-foreground">
                        <strong>{item.qty}×</strong> {item.name}
                      </span>
                      <span className="font-medium text-muted-foreground">{money(item.price * item.qty)}</span>
                    </li>
                  ))}
                </ul>

                {/* Guaranteed reserve tag & note */}
                <div className="space-y-1 my-1">
                  {order.isGuaranteed && (
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                      <ShieldCheck size={13} /> Reserva garantizada (Stock congelado)
                    </div>
                  )}
                  {order.note && (
                    <p className="rounded-lg bg-secondary/50 p-2 text-xs text-muted-foreground italic">
                      "{order.note}"
                    </p>
                  )}
                </div>

                {/* Total & Action Bar */}
                <div className="mt-auto pt-4 flex flex-col gap-3 border-t border-border/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Total:</span>
                    <span className="font-display text-lg font-bold text-primary">{money(order.total)}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {/* Chat button */}
                    <button
                      type="button"
                      onClick={() => openChatForOrder(order)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 py-2 text-xs font-display font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                      <MessageSquare size={14} />
                      <span>Chatear ({tab === 'compras' ? 'Vendedor' : 'Comprador'})</span>
                    </button>

                    {/* Seller status transition buttons */}
                    {tab === 'ventas' && order.status !== 'entregado' && order.status !== 'cancelado' && (
                      <>
                        {order.status === 'reservado' && (
                          <button
                            type="button"
                            onClick={() => void setStatus(order, 'listo')}
                            className="rounded-xl bg-primary px-3 py-2 text-xs font-display font-bold text-primary-foreground hover:opacity-90 transition-opacity"
                          >
                            Marcar Listo
                          </button>
                        )}
                        {order.status === 'listo' && (
                          <button
                            type="button"
                            onClick={() => void setStatus(order, 'entregado')}
                            className="flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-display font-bold text-white hover:bg-emerald-600 transition-colors"
                          >
                            <CheckCircle2 size={14} /> Entregado
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => void setStatus(order, 'cancelado')}
                          className="rounded-xl bg-secondary px-3 py-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/15 transition-colors"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
