import {
  Bike,
  CheckCircle2,
  DollarSign,
  MapPin,
  MessageCircle,
  Package,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { money, ownsListing, sellerUserId } from '../lib/format'
import { playPaymentSuccess } from '../lib/sounds'
import { fetchOrders, saveOrder, subscribeToOrderUpdates } from '../lib/storage-db'
import type { Order } from '../types'

const statusLabels: Record<string, { label: string; color: string }> = {
  solicitado: { label: 'Buscando Tendedero', color: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700' },
  tomado: { label: 'Tendedero en camino', color: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-700' },
  en_camino: { label: 'En camino a tu punto', color: 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-200 dark:border-indigo-700' },
  entregado_por_tendedero: { label: 'Entregado por Tendedero', color: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-700' },
  entregado: { label: 'Entregado', color: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700' },
  completado: { label: 'Completado 🎉', color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700' },
  reservado: { label: 'Pendiente de entrega', color: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700' },
  listo: { label: 'Listo para entrega', color: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-700' },
  cancelado: { label: 'Cancelado', color: 'bg-secondary text-muted-foreground border-border' },
}

export function OrdersPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [tab, setTab] = useState<'compras' | 'ventas' | 'domicilios' | 'historial'>('compras')
  const [feedback, setFeedback] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const all = await fetchOrders()
    setOrders(all.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  }, [])

  useEffect(() => {
    void refresh()
    const unsub = subscribeToOrderUpdates(() => {
      void refresh()
    })
    return () => unsub()
  }, [refresh])

  const mine = orders.filter((order) => order.buyerId === user?.id)

  const allSellerOrders = orders.filter((order) => {
    if (!user) return false
    const sKey = order.sellerKey || ''
    const sName = (order.sellerName || '').trim().toLowerCase()
    const uName = (user.name || '').trim().toLowerCase()
    const uId = user.id.toLowerCase()

    return (
      sKey.toLowerCase().endsWith(`::${uId}`) ||
      sKey.toLowerCase() === uId ||
      sKey.toLowerCase() === uName ||
      sName === uName ||
      ownsListing(order.sellerKey, user.id, user.name)
    )
  })

  // Domicilios tomados por el usuario
  const myDeliveries = orders.filter((order) => order.tendederoId === user?.id)

  const activeSelling = allSellerOrders.filter((o) => o.status !== 'completado' && o.status !== 'cancelado')
  const historySelling = allSellerOrders.filter((o) => o.status === 'completado' || o.status === 'entregado')

  // Métricas financieras
  const totalGross = historySelling.reduce((sum, o) => sum + o.total, 0)
  const totalNet = historySelling.reduce(
    (sum, o) => sum + (o.sellerNetRevenue || o.total - (o.platformCommission || Math.round(o.total * 0.05))),
    0,
  )

  // 1. Confirmación del CLIENTE (Comprador)
  const handleConfirmarCliente = async (order: Order) => {
    playPaymentSuccess()
    const isCompleted = order.tendederoConfirmed && order.sellerPaidConfirmed
    const updated: Order = {
      ...order,
      buyerConfirmed: true,
      buyerConfirmedAt: new Date().toISOString(),
      status: isCompleted ? 'completado' : 'entregado',
    }
    await saveOrder(updated)
    await refresh()
    setFeedback('¡Confirmaste que recibiste tu pedido con éxito!')
    setTimeout(() => setFeedback(null), 3500)
  }

  // 2. Confirmación del VENDEDOR (Pago / dinero recibido)
  const handleConfirmarVendedorPago = async (order: Order) => {
    playPaymentSuccess()
    const isCompleted = order.tendederoConfirmed && order.buyerConfirmed
    const updated: Order = {
      ...order,
      sellerPaidConfirmed: true,
      sellerPaidConfirmedAt: new Date().toISOString(),
      status: isCompleted ? 'completado' : order.status,
    }
    await saveOrder(updated)
    await refresh()
    setFeedback('¡Confirmaste que recibiste el dinero del pedido!')
    setTimeout(() => setFeedback(null), 3500)
  }

  // 3. Confirmación del TENDEDERO (Entrega realizada)
  const handleConfirmarTendedero = async (order: Order) => {
    playPaymentSuccess()
    const isCompleted = order.buyerConfirmed && order.sellerPaidConfirmed
    const updated: Order = {
      ...order,
      tendederoConfirmed: true,
      tendederoConfirmedAt: new Date().toISOString(),
      status: isCompleted ? 'completado' : 'entregado_por_tendedero',
    }
    await saveOrder(updated)
    await refresh()
    setFeedback('¡Confirmaste que entregaste el pedido al comprador!')
    setTimeout(() => setFeedback(null), 3500)
  }

  // Navegación de chats
  const openChatWith = (order: Order, role: 'seller' | 'buyer' | 'tendedero') => {
    const firstItem = order.items[0]?.name ?? 'Snack'
    let partnerId = order.buyerId
    let partnerName = order.buyerName
    let convSuffix = 'buyer'

    if (role === 'seller') {
      partnerId = sellerUserId(order.sellerKey)
      partnerName = order.sellerName
      convSuffix = 'seller'
    } else if (role === 'tendedero') {
      partnerId = order.tendederoId || ''
      partnerName = order.tendederoName || 'Tendedero'
      convSuffix = 'tendedero'
    }

    navigate(
      `/mensajes?conv=order_${order.id}_${convSuffix}&partnerId=${encodeURIComponent(
        partnerId,
      )}&partnerName=${encodeURIComponent(partnerName)}&orderId=${order.id}&productName=${encodeURIComponent(
        firstItem,
      )}`,
    )
  }

  const displayedList =
    tab === 'compras'
      ? mine
      : tab === 'ventas'
      ? activeSelling
      : tab === 'domicilios'
      ? myDeliveries
      : historySelling

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-primary">
            <Bike size={14} />
            <span>Domicilios y Entregas en Campus Icesi</span>
          </div>
          <h1 className="mt-1 font-display text-2xl font-black tracking-tight sm:text-3xl text-foreground">
            Gestión de Pedidos & Entregas
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Monitorea el estado de tus snacks, chatea con el comprador, vendedor o tendedero y confirma recepciones.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap rounded-2xl bg-secondary p-1 border border-border gap-1">
          <button
            type="button"
            onClick={() => setTab('compras')}
            className={`rounded-xl px-3.5 py-2 text-xs font-display font-bold transition-all cursor-pointer ${
              tab === 'compras'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Mis Compras ({mine.length})
          </button>

          <button
            type="button"
            onClick={() => setTab('ventas')}
            className={`rounded-xl px-3.5 py-2 text-xs font-display font-bold transition-all cursor-pointer ${
              tab === 'ventas'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Mis Ventas ({activeSelling.length})
          </button>

          <button
            type="button"
            onClick={() => setTab('domicilios')}
            className={`rounded-xl px-3.5 py-2 text-xs font-display font-bold transition-all cursor-pointer ${
              tab === 'domicilios'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Mis Entregas ({myDeliveries.length})
          </button>

          <button
            type="button"
            onClick={() => setTab('historial')}
            className={`rounded-xl px-3.5 py-2 text-xs font-display font-bold transition-all cursor-pointer ${
              tab === 'historial'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Historial ({historySelling.length})
          </button>
        </div>
      </div>

      {feedback && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800 p-4 text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Historial Resumen Financiero */}
      {tab === 'historial' && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono block">
              Ventas Totales
            </span>
            <p className="mt-1 font-mono text-xl font-black text-foreground">{money(totalGross)}</p>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">{historySelling.length} pedidos cerrados</span>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono block">
              Ingreso Neto Vendedor
            </span>
            <p className="mt-1 font-mono text-xl font-black text-primary">{money(totalNet)}</p>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">Ganancia limpia</span>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm col-span-2 sm:col-span-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono block">
              Domicilios en Campus
            </span>
            <p className="mt-1 font-mono text-xl font-black text-emerald-600">
              {historySelling.length * 200 > 0 ? money(historySelling.length * 200) : '$0'}
            </p>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">Generado para Tendederos ($200 c/u)</span>
          </div>
        </div>
      )}

      {/* Listado de Pedidos */}
      {displayedList.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center text-muted-foreground space-y-3">
          <Package size={40} className="mx-auto opacity-30 text-primary" />
          <p className="font-display font-bold text-foreground text-sm">
            {tab === 'compras'
              ? 'No tienes pedidos de snacks en este momento.'
              : tab === 'ventas'
              ? 'No tienes ventas activas en proceso.'
              : tab === 'domicilios'
              ? 'Aún no has tomado entregas como Tendedero.'
              : 'No hay pedidos en el historial.'}
          </p>
          <div className="pt-2">
            {tab === 'compras' ? (
              <Link
                to="/catalogo"
                className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90 inline-block"
              >
                Explorar Catálogo
              </Link>
            ) : tab === 'domicilios' ? (
              <Link
                to="/entregas"
                className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90 inline-block"
              >
                Ver Solicitudes de Tendedero
              </Link>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayedList.map((order) => {
            const statusInfo = statusLabels[order.status] || {
              label: order.status,
              color: 'bg-secondary text-foreground border-border',
            }

            return (
              <article
                key={order.id}
                className="flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-5 shadow-sm space-y-4 hover:border-primary/40 transition-colors"
              >
                <div className="space-y-3">
                  {/* Status & Delivery badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-mono font-bold border ${statusInfo.color}`}
                    >
                      {statusInfo.label}
                    </span>
                    <span className="font-mono text-xs font-extrabold text-primary">{money(order.total)}</span>
                  </div>

                  {/* Items list */}
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground">
                      {order.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Cocinero: <strong>{order.sellerName}</strong> · Cliente: <strong>{order.buyerName}</strong>
                    </p>
                  </div>

                  {/* Detalles de Entrega en Campus */}
                  <div className="rounded-2xl bg-secondary/60 p-3 text-xs space-y-2 border border-border/60">
                    <div className="flex items-start gap-2">
                      <MapPin size={13} className="text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase font-mono text-muted-foreground block">Recogida:</span>
                        <span className="font-semibold text-foreground">{order.pickup}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Bike size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase font-mono text-muted-foreground block">Entrega en U:</span>
                        <span className="font-semibold text-foreground">
                          {order.deliveryLocation || 'Punto acordado en campus'}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          Envío: +$200 COP {order.tendederoName ? `(Asignado a: ${order.tendederoName})` : '(Buscando Tendedero...)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Matriz de las 3 Confirmaciones Clave */}
                  <div className="rounded-2xl border border-border bg-card p-3 space-y-2 text-xs">
                    <span className="font-mono text-[10px] font-bold uppercase text-muted-foreground block">
                      Confirmaciones del Pedido:
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px]">1. Tendedero entregó:</span>
                      <span className={`font-bold ${order.tendederoConfirmed ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {order.tendederoConfirmed ? '✓ Confirmado' : '⏳ Pendiente'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px]">2. Cliente recibió:</span>
                      <span className={`font-bold ${order.buyerConfirmed ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {order.buyerConfirmed ? '✓ Confirmado' : '⏳ Pendiente'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px]">3. Dinero / pago recibido:</span>
                      <span className={`font-bold ${order.sellerPaidConfirmed ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {order.sellerPaidConfirmed ? '✓ Confirmado' : '⏳ Pendiente'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acciones y Botones de Confirmación según el Rol */}
                <div className="space-y-2 pt-2 border-t border-border/60">
                  {/* Botón de Confirmación para el CLIENTE */}
                  {tab === 'compras' && !order.buyerConfirmed && (
                    <button
                      type="button"
                      onClick={() => void handleConfirmarCliente(order)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-display font-bold text-white shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      <CheckCircle2 size={15} />
                      <span>Confirmar que recibí mi pedido</span>
                    </button>
                  )}

                  {/* Botón de Confirmación para el VENDEDOR (Pago recibido) */}
                  {tab === 'ventas' && !order.sellerPaidConfirmed && (
                    <button
                      type="button"
                      onClick={() => void handleConfirmarVendedorPago(order)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-display font-bold text-white shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      <DollarSign size={15} />
                      <span>Confirmar dinero / pago recibido</span>
                    </button>
                  )}

                  {/* Botón de Confirmación para el TENDEDERO */}
                  {tab === 'domicilios' && !order.tendederoConfirmed && (
                    <button
                      type="button"
                      onClick={() => void handleConfirmarTendedero(order)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:opacity-90 py-3 text-xs font-display font-bold text-primary-foreground shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      <CheckCircle2 size={15} />
                      <span>Confirmar que entregué el pedido</span>
                    </button>
                  )}

                  {/* Chats directos para coordinar entrega en campus */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {tab === 'compras' && (
                      <>
                        <button
                          type="button"
                          onClick={() => openChatWith(order, 'seller')}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary py-2.5 text-xs font-semibold hover:bg-secondary/80 transition-colors"
                        >
                          <MessageCircle size={13} className="text-primary" />
                          <span>Chat Cocinero</span>
                        </button>
                        {order.tendederoId ? (
                          <button
                            type="button"
                            onClick={() => openChatWith(order, 'tendedero')}
                            className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary py-2.5 text-xs font-semibold hover:bg-secondary/80 transition-colors"
                          >
                            <Bike size={13} className="text-emerald-600" />
                            <span>Chat Tendedero</span>
                          </button>
                        ) : (
                          <span className="flex items-center justify-center text-[10px] text-muted-foreground bg-secondary/40 rounded-xl py-2 text-center">
                            Sin tendedero aún
                          </span>
                        )}
                      </>
                    )}

                    {tab === 'ventas' && (
                      <>
                        <button
                          type="button"
                          onClick={() => openChatWith(order, 'buyer')}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary py-2.5 text-xs font-semibold hover:bg-secondary/80 transition-colors"
                        >
                          <MessageCircle size={13} className="text-primary" />
                          <span>Chat Comprador</span>
                        </button>
                        {order.tendederoId ? (
                          <button
                            type="button"
                            onClick={() => openChatWith(order, 'tendedero')}
                            className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary py-2.5 text-xs font-semibold hover:bg-secondary/80 transition-colors"
                          >
                            <Bike size={13} className="text-emerald-600" />
                            <span>Chat Tendedero</span>
                          </button>
                        ) : (
                          <span className="flex items-center justify-center text-[10px] text-muted-foreground bg-secondary/40 rounded-xl py-2 text-center">
                            Esperando Tendedero
                          </span>
                        )}
                      </>
                    )}

                    {tab === 'domicilios' && (
                      <>
                        <button
                          type="button"
                          onClick={() => openChatWith(order, 'seller')}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary py-2.5 text-xs font-semibold hover:bg-secondary/80 transition-colors"
                        >
                          <MessageCircle size={13} className="text-primary" />
                          <span>Chat Vendedor</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openChatWith(order, 'buyer')}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary py-2.5 text-xs font-semibold hover:bg-secondary/80 transition-colors"
                        >
                          <MessageCircle size={13} className="text-primary" />
                          <span>Chat Comprador</span>
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
