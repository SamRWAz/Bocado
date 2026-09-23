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
import { formatTime, money, sellerUserId } from '../lib/format'
import { playKeyBeep } from '../lib/sounds'
import { fetchOrders, saveOrder } from '../lib/storage-db'
import type { Order, OrderStatus } from '../types'

const labels: Record<OrderStatus, { label: string; color: string }> = {
  reservado: { label: 'Apartado / Pendiente', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  listo: { label: 'En Casillero 24/7', color: 'bg-primary/15 text-primary border-primary/30' },
  entregado: { label: 'Retirado de Vitrina', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  cancelado: { label: 'Cancelado', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
}

export function OrdersPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [tab, setTab] = useState<'compras' | 'ventas'>('compras')
  const [copiedPin, setCopiedPin] = useState<string | null>(null)
  const [orderToAssign, setOrderToAssign] = useState<Order | null>(null)

  const refresh = useCallback(async () => {
    const all = await fetchOrders()
    setOrders(all.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const mine = orders.filter((order) => order.buyerId === user?.id)
  const selling = orders.filter(
    (order) =>
      order.sellerKey.endsWith(`::${user?.id}`) ||
      order.sellerKey === user?.id ||
      order.sellerName === user?.name,
  )
  const list = tab === 'compras' ? mine : selling

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

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-primary">
            <Sparkles size={13} />
            <span>Pases Digitales & Vitrina Icesi</span>
          </div>
          <h1 className="mt-1 font-display text-2xl font-black tracking-tight sm:text-3xl text-foreground">
            Tus Pases y Apartados
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Digita tu PIN en el teclado de la vitrina del <strong>Edificio D, M o L</strong> para desbloquear la compuerta.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-2xl bg-secondary/80 p-1 border border-border/60 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTab('compras')}
            className={`rounded-xl px-4 py-2 text-xs font-display font-bold transition-all ${
              tab === 'compras'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Mis Pases de Retiro ({mine.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('ventas')}
            className={`rounded-xl px-4 py-2 text-xs font-display font-bold transition-all ${
              tab === 'ventas'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Pases de Depósito ({selling.length})
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center text-muted-foreground">
          <Boxes size={44} className="mx-auto mb-3 opacity-30 text-primary" />
          <p className="font-display font-bold text-foreground">
            {tab === 'compras' ? 'No tienes pases de retiro activos' : 'No tienes depósitos pendientes'}
          </p>
          <p className="mt-1 text-xs max-w-sm mx-auto">
            {tab === 'compras'
              ? 'Explora el catálogo, aparta tus snacks y retíralos con PIN en los Edificios D, M o L.'
              : 'Cuando recibas una solicitud de compra, te aparecerá aquí para asignar automáticamente un casillero.'}
          </p>
          <div className="mt-4">
            <Link
              to={tab === 'compras' ? '/catalogo' : '/vender'}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:opacity-90"
            >
              {tab === 'compras' ? 'Ver Catálogo' : 'Publicar Snack'}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {list.map((order) => {
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
                className="flex flex-col rounded-3xl border border-border/80 bg-card/90 backdrop-blur-md p-6 shadow-xl transition-all hover:border-primary/50 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-emerald-400 to-cyan-400" />

                {/* Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/60">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-muted-foreground">
                      {tab === 'compras' ? 'Cocinero:' : 'Comprador:'}
                    </span>
                    <h3 className="font-brand text-base font-bold text-foreground">
                      {tab === 'compras' ? order.sellerName : order.buyerName}
                    </h3>
                    <p className="flex items-center gap-1.5 text-xs text-primary font-mono mt-0.5">
                      <Building2 size={13} className="shrink-0" />
                      <span>
                        {hasAssignedLocker
                          ? `${hubName} · Casillero #${slotNum}`
                          : 'Casillero pendiente por asignar'}
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
                  <div className="my-4 rounded-2xl border border-primary/40 bg-zinc-950/90 p-4 relative overflow-hidden">
                    <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-2">
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <KeyRound size={14} /> PIN DE RETIRO EN MÁQUINA
                      </span>
                      <span className="text-[10px]">
                        {hasAssignedLocker ? `CASILLERO #${slotNum}` : 'EN ESPERA'}
                      </span>
                    </div>

                    {claimPin ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-3xl font-black tracking-widest text-primary drop-shadow-[0_0_12px_rgba(249,115,22,0.6)]">
                            {claimPin}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyPin(claimPin)}
                            className="rounded-lg bg-secondary/80 p-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            title="Copiar PIN"
                          >
                            <Copy size={14} />
                          </button>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1">
                            <QrCode size={32} className="text-black" />
                          </div>
                          <span className="text-[8px] font-mono text-zinc-400 mt-0.5">PAGO QR</span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-2 text-center">
                        <p className="text-xs text-amber-400 font-mono">
                          ⏳ El cocinero está preparando tu pedido y asignando el casillero.
                        </p>
                      </div>
                    )}

                    {copiedPin === claimPin && (
                      <p className="mt-2 text-[10px] font-mono text-emerald-400 animate-fadeIn">
                        ✓ PIN copiado al portapapeles
                      </p>
                    )}
                  </div>
                )}

                {/* Seller Deposit Pass / Action Box */}
                {tab === 'ventas' && (
                  <div className="my-4 rounded-2xl border border-amber-500/40 bg-amber-950/20 p-4 space-y-3">
                    {hasAssignedLocker ? (
                      <>
                        <div className="flex items-center justify-between text-xs font-mono text-amber-400">
                          <span className="flex items-center gap-1 font-bold">
                            <Zap size={14} /> PIN DE DEPÓSITO
                          </span>
                          <span className="text-[10px]">CASILLERO #{slotNum}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Digita <strong>{depositPin}</strong> en la vitrina del {hubName} para abrir la compuerta #{slotNum} y guardar el snack.
                        </p>
                        <div className="flex items-center justify-between pt-1 font-mono">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold tracking-wider text-amber-400">
                              {depositPin}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyPin(depositPin)}
                              className="rounded-lg bg-secondary/80 p-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                              title="Copiar PIN"
                            >
                              <Copy size={13} />
                            </button>
                          </div>
                          <span className="text-[11px] text-emerald-400">
                            Neto: {money(netRevenue)} <span className="text-zinc-500">(5% com: -{money(commission)})</span>
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2 text-center sm:text-left">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
                          <Zap size={14} />
                          <span>Solicitud de compra recibida</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          El comprador apartó este snack. Asígnale un casillero automático en el <strong>Edificio D, M o L</strong> para generar el PIN de depósito.
                        </p>
                        <button
                          type="button"
                          onClick={() => setOrderToAssign(order)}
                          className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-amber-500 py-2.5 px-3 text-xs font-display font-bold text-white shadow-md hover:brightness-110 active:scale-95 transition-all"
                        >
                          <Zap size={14} />
                          <span>Asignar Casillero Automático</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Items */}
                <ul className="my-2 space-y-1.5 text-xs divide-y divide-border/30">
                  {order.items.map((item) => (
                    <li key={item.productId} className="flex justify-between items-center pt-1.5 first:pt-0">
                      <span className="text-foreground">
                        <strong>{item.qty}×</strong> {item.name}
                      </span>
                      <span className="font-mono text-muted-foreground">{money(item.price * item.qty)}</span>
                    </li>
                  ))}
                </ul>

                {/* Protection note */}
                {order.isGuaranteed && (
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 my-1 font-mono">
                    <ShieldCheck size={13} />
                    <span>Control de frescura garantizado</span>
                  </div>
                )}

                {/* Total & Action Bar */}
                <div className="mt-auto pt-4 flex flex-col gap-3 border-t border-border/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Total:</span>
                    <span className="font-mono text-lg font-bold text-primary">{money(order.total)}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {hasAssignedLocker && (
                      <Link
                        to="/vitrina"
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-display font-bold text-primary-foreground shadow-md shadow-primary/20 hover:brightness-110 transition-all"
                      >
                        <Unlock size={14} />
                        <span>{tab === 'compras' ? 'Abrir en Vitrina' : 'Ir a Vitrina'}</span>
                      </Link>
                    )}

                    {tab === 'ventas' && hasAssignedLocker && (
                      <button
                        type="button"
                        onClick={() => setOrderToAssign(order)}
                        className="flex items-center justify-center gap-1 rounded-xl border border-border bg-secondary/80 px-2.5 py-2.5 text-xs font-display font-semibold text-muted-foreground hover:text-foreground transition-all"
                        title="Reasignar a otro edificio"
                      >
                        <Building2 size={13} />
                        <span>Reasignar</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => openChatForOrder(order)}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary/80 px-3 py-2.5 text-xs font-display font-semibold text-foreground hover:bg-secondary transition-all"
                    >
                      <MessageSquare size={14} />
                      <span>Chat</span>
                    </button>

                    {tab === 'ventas' && order.status !== 'entregado' && order.status !== 'cancelado' && (
                      <button
                        type="button"
                        onClick={() => void setStatus(order, 'entregado')}
                        className="flex items-center gap-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-2 text-xs font-bold hover:bg-emerald-500/30 transition-colors"
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
