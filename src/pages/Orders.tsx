import {
  Boxes,
  Building2,
  CheckCircle2,
  Copy,
  KeyRound,
  MessageSquare,
  QrCode,
  ShieldCheck,
  Sparkles,
  Unlock,
  Zap,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AssignLockerModal } from '../components/lockers/AssignLockerModal'
import { useAuth } from '../context/AuthContext'
import { formatTime, money, ownsListing, sellerUserId } from '../lib/format'
import { playKeyBeep } from '../lib/sounds'
import { fetchOrders, saveOrder, subscribeToOrderUpdates } from '../lib/storage-db'
import type { Order, OrderStatus } from '../types'

const labels: Record<OrderStatus, { label: string; color: string }> = {
  reservado: { label: 'Apartado / Pendiente', color: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700' },
  listo: { label: 'Listo en Casillero', color: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700' },
  entregado: { label: 'Retirado / Completado', color: 'bg-zinc-100 text-zinc-800 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700' },
  cancelado: { label: 'Cancelado', color: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700' },
}

export function OrdersPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [tab, setTab] = useState<'compras' | 'ventas' | 'historial'>('compras')
  const [copiedPin, setCopiedPin] = useState<string | null>(null)
  const [orderToAssign, setOrderToAssign] = useState<Order | null>(null)

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

  // Active sales vs completed sales
  const activeSelling = allSellerOrders.filter((o) => o.status !== 'entregado' && o.status !== 'cancelado')
  const historySelling = allSellerOrders.filter((o) => o.status === 'entregado')

  // Financial statistics for seller history
  const totalGross = historySelling.reduce((sum, o) => sum + o.total, 0)
  const totalNet = historySelling.reduce(
    (sum, o) => sum + (o.sellerNetRevenue || o.total - (o.platformCommission || Math.round(o.total * 0.05))),
    0,
  )
  const totalCommission = historySelling.reduce(
    (sum, o) => sum + (o.platformCommission || Math.round(o.total * 0.05)),
    0,
  )
  const totalItemsSold = historySelling.reduce(
    (sum, o) => sum + o.items.reduce((s, it) => s + it.qty, 0),
    0,
  )

  const setStatus = async (order: Order, status: OrderStatus) => {
    await saveOrder({ ...order, status })
    await refresh()
  }

  const handleCopyPin = (pin: string) => {
    playKeyBeep(880)
    void navigator.clipboard.writeText(pin)
    setCopiedPin(pin)
    setTimeout(() => setCopiedPin(null), 2000)
  }

  const openChatForOrder = (order: Order) => {
    const isBuyer = tab === 'compras'
    const partnerId = isBuyer ? sellerUserId(order.sellerKey) : order.buyerId
    const partnerName = isBuyer ? order.sellerName : order.buyerName
    const firstItem = order.items[0]?.name ?? 'Snack'

    navigate(
      `/mensajes?conv=order_${order.id}&partnerId=${encodeURIComponent(
        partnerId,
      )}&partnerName=${encodeURIComponent(partnerName)}&orderId=${order.id}&productName=${encodeURIComponent(
        firstItem,
      )}`,
    )
  }

  const displayedList = tab === 'compras' ? mine : tab === 'ventas' ? activeSelling : historySelling

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-primary">
            <Sparkles size={13} />
            <span>Pases Digitales & Vitrina Icesi</span>
          </div>
          <h1 className="mt-1 font-display text-2xl font-black tracking-tight sm:text-3xl text-foreground">
            Tus Pases y Apartados
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Digita tu PIN en el teclado de la vitrina del <strong>Edificio D, M o L</strong> para retirar tus preparaciones.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap rounded-2xl bg-secondary p-1 border border-border self-start sm:self-auto gap-1">
          <button
            type="button"
            onClick={() => setTab('compras')}
            className={`rounded-xl px-3.5 py-2 text-xs font-display font-bold transition-all cursor-pointer ${
              tab === 'compras'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Mis Pases de Retiro ({mine.length})
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
            Pases de Depósito ({activeSelling.length})
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
            Historial de Ventas ({historySelling.length})
          </button>
        </div>
      </div>

      {/* Historial de Ventas - Metrics Summary Box */}
      {tab === 'historial' && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono block">
              Ventas Totales
            </span>
            <p className="mt-1 font-mono text-xl font-black text-foreground">{money(totalGross)}</p>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">{historySelling.length} pedidos cerrados</span>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono block">
              Ganancias Netas (95%)
            </span>
            <p className="mt-1 font-mono text-xl font-black text-emerald-600 dark:text-emerald-400">
              {money(totalNet)}
            </p>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">Liquidado al cocinero</span>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono block">
              Snacks Entregados
            </span>
            <p className="mt-1 font-mono text-xl font-black text-primary">{totalItemsSold}</p>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">Unidades retiradas</span>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono block">
              Comisión Bocado (5%)
            </span>
            <p className="mt-1 font-mono text-xl font-black text-zinc-700 dark:text-zinc-300">{money(totalCommission)}</p>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">Uso de vitrina & app</span>
          </div>
        </div>
      )}

      {displayedList.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
          <Boxes size={44} className="mx-auto mb-3 opacity-30 text-primary" />
          <p className="font-display font-bold text-foreground">
            {tab === 'compras'
              ? 'No tienes pases de retiro activos'
              : tab === 'ventas'
              ? 'No tienes depósitos pendientes'
              : 'Aún no tienes ventas completadas en el historial'}
          </p>
          <p className="mt-1 text-xs max-w-sm mx-auto">
            {tab === 'compras'
              ? 'Explora el catálogo, aparta tus snacks y retíralos con PIN en los Edificios D, M o L.'
              : tab === 'ventas'
              ? 'Cuando recibas una solicitud de compra, te aparecerá aquí para asignar automáticamente un casillero.'
              : 'Cuando tus compradores retiren sus snacks en los casilleros inteligentes, aparecerán registrados aquí.'}
          </p>
          <div className="mt-4">
            <Link
              to={tab === 'compras' ? '/catalogo' : '/vender'}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90"
            >
              {tab === 'compras' ? 'Ver Catálogo' : 'Publicar Snack'}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {displayedList.map((order) => {
            const statusConfig = labels[order.status] ?? labels.reservado
            const claimPin = order.claimPin
            const depositPin = order.depositPin || `DEP-${claimPin || '1234'}`
            const hubName = order.lockerHubName || order.pickup || 'Edificio D'
            const slotNum = order.lockerNumber
            const hasAssignedLocker = Boolean(slotNum)
            const commission = order.platformCommission || Math.round(order.total * 0.05)
            const netRevenue = order.sellerNetRevenue || order.total - commission

            return (
              <article
                key={order.id}
                className="flex flex-col rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/40 relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-border">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-muted-foreground">
                      {tab === 'compras' ? 'Cocinero:' : 'Comprador:'}
                    </span>
                    <h3 className="font-display text-base font-bold text-foreground">
                      {tab === 'compras' ? order.sellerName : order.buyerName}
                    </h3>
                    <p className="flex items-center gap-1.5 text-xs text-primary font-mono mt-0.5">
                      <Building2 size={13} className="shrink-0" />
                      <span>
                        {hasAssignedLocker
                          ? `${hubName} · Casillero #${slotNum}`
                          : 'Casillero en proceso de asignación'}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`rounded-full border px-3 py-0.5 text-[11px] font-mono font-bold ${statusConfig.color}`}
                    >
                      {statusConfig.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">{formatTime(order.createdAt)}</span>
                  </div>
                </div>

                {/* Buyer Digital Claim Pass */}
                {tab === 'compras' && (
                  <div className="my-4 rounded-2xl border border-border bg-secondary/70 p-4 relative overflow-hidden">
                    <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-2">
                      <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                        <KeyRound size={14} /> PIN DE RETIRO EN VITRINA
                      </span>
                      <span className="text-[10px] font-bold text-foreground">
                        {hasAssignedLocker ? `${hubName} · Casillero #${slotNum}` : 'EN PREPARACIÓN'}
                      </span>
                    </div>

                    {claimPin ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-3xl font-black tracking-widest text-primary">
                            {claimPin}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyPin(claimPin)}
                            className="rounded-lg bg-card p-1.5 text-xs text-muted-foreground hover:text-foreground border border-border transition-colors cursor-pointer"
                            title="Copiar PIN"
                          >
                            <Copy size={14} />
                          </button>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1 border border-border">
                            <QrCode size={32} className="text-black" />
                          </div>
                          <span className="text-[8px] font-mono text-muted-foreground mt-0.5">PAGO QR</span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-2 text-center">
                        <p className="text-xs text-amber-700 dark:text-amber-400 font-mono">
                          ⏳ El cocinero está preparando tu pedido y asignando el casillero.
                        </p>
                      </div>
                    )}

                    {copiedPin === claimPin && (
                      <p className="mt-2 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                        ✓ PIN copiado al portapapeles
                      </p>
                    )}
                  </div>
                )}

                {/* Seller Active Deposit Pass / Action Box */}
                {tab === 'ventas' && (
                  <div className="my-4 rounded-2xl border border-border bg-secondary/70 p-4">
                    {hasAssignedLocker ? (
                      <>
                        <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-2">
                          <span className="text-primary font-bold flex items-center gap-1">
                            <Zap size={14} /> CASILLERO ASIGNADO
                          </span>
                          <span className="font-bold text-foreground">
                            {hubName} · #{slotNum}
                          </span>
                        </div>

                        <div className="flex items-center justify-between rounded-xl bg-card p-3 border border-border">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-mono block">
                              PIN de Depósito:
                            </span>
                            <span className="font-mono text-xl font-black text-foreground">
                              {depositPin}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-mono block">
                              PIN del Comprador:
                            </span>
                            <span className="font-mono text-sm font-bold text-primary">
                              {claimPin || 'Automático'}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2 text-center sm:text-left">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                          <Zap size={14} />
                          <span>Solicitud de compra recibida</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          El comprador apartó este snack. Asígnale un casillero automático en el <strong>Edificio D, M o L</strong> para generar el PIN.
                        </p>
                        <button
                          type="button"
                          onClick={() => setOrderToAssign(order)}
                          className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 px-3 text-xs font-display font-bold text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                        >
                          <Zap size={14} />
                          <span>Asignar Casillero Automático</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Items */}
                <ul className="my-2 space-y-1.5 text-xs divide-y divide-border/40">
                  {order.items.map((item) => (
                    <li key={item.productId} className="flex justify-between items-center pt-1.5 first:pt-0">
                      <span className="text-foreground">
                        <strong>{item.qty}×</strong> {item.name}
                      </span>
                      <span className="font-mono text-muted-foreground">{money(item.price * item.qty)}</span>
                    </li>
                  ))}
                </ul>

                {/* Seller Financial Breakdown for Historial */}
                {tab === 'historial' && (
                  <div className="mt-2 rounded-xl bg-secondary/50 p-2.5 text-[11px] font-mono space-y-1 border border-border/60">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Total venta cobrada:</span>
                      <span className="font-bold text-foreground">{money(order.total)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Comisión Bocado (5%):</span>
                      <span>-{money(commission)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-emerald-700 dark:text-emerald-400 pt-1 border-t border-border/40">
                      <span>Neto pagado a ti:</span>
                      <span>{money(netRevenue)}</span>
                    </div>
                  </div>
                )}

                {/* Protection note */}
                {order.isGuaranteed && (
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 my-1 font-mono">
                    <ShieldCheck size={13} />
                    <span>Control de frescura garantizado</span>
                  </div>
                )}

                {/* Total & Action Bar */}
                <div className="mt-auto pt-4 flex flex-col gap-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Total:</span>
                    <span className="font-mono text-lg font-bold text-primary">{money(order.total)}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {hasAssignedLocker && (
                      <Link
                        to="/vitrina"
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-display font-bold text-primary-foreground shadow-sm hover:opacity-90 transition-all"
                      >
                        <Unlock size={14} />
                        <span>{tab === 'compras' ? 'Abrir en Vitrina' : 'Ir a Vitrina'}</span>
                      </Link>
                    )}

                    {tab === 'ventas' && hasAssignedLocker && (
                      <button
                        type="button"
                        onClick={() => setOrderToAssign(order)}
                        className="flex items-center justify-center gap-1 rounded-xl border border-border bg-secondary px-2.5 py-2.5 text-xs font-display font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                        title="Reasignar a otro edificio"
                      >
                        <Building2 size={13} />
                        <span>Reasignar</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => openChatForOrder(order)}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary px-3 py-2.5 text-xs font-display font-semibold text-foreground hover:bg-secondary/80 transition-all cursor-pointer"
                    >
                      <MessageSquare size={14} />
                      <span>Chat</span>
                    </button>

                    {tab === 'ventas' && order.status !== 'entregado' && order.status !== 'cancelado' && (
                      <button
                        type="button"
                        onClick={() => void setStatus(order, 'entregado')}
                        className="flex items-center gap-1 rounded-xl bg-emerald-600 text-white px-3 py-2 text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 size={14} /> Marcar Retirado
                      </button>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Assignment Modal for Seller */}
      {orderToAssign && (
        <AssignLockerModal
          order={orderToAssign}
          isOpen={Boolean(orderToAssign)}
          onClose={() => setOrderToAssign(null)}
          onSuccess={() => {
            void refresh()
          }}
        />
      )}
    </div>
  )
}
