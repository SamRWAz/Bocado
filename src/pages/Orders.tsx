import {
  Bike,
  Building,
  CheckCircle2,
  DollarSign,
  MapPin,
  MessageCircle,
  Package,
  RotateCw,
  Store,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PageTransition } from '../components/PageTransition'
import { canBuy, canSell, isTendedero, useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
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
  const { success, bonus } = useToast()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [orders, setOrders] = useState<Order[]>([])
  
  const role = user?.role
  const tabParam = searchParams.get('tab') as 'compras' | 'ventas' | 'domicilios' | 'historial' | null

  const isCourier = isTendedero(role) && !canSell(role)
  const isOnlySeller = canSell(role) && !canBuy(role)

  const defaultTab: 'compras' | 'ventas' | 'domicilios' | 'historial' = isCourier
    ? 'domicilios'
    : isOnlySeller
    ? 'ventas'
    : tabParam && ['compras', 'ventas', 'domicilios', 'historial'].includes(tabParam)
    ? tabParam
    : 'compras'

  const [tab, setTabState] = useState<'compras' | 'ventas' | 'domicilios' | 'historial'>(
    tabParam && ['compras', 'ventas', 'domicilios', 'historial'].includes(tabParam) ? tabParam : defaultTab,
  )

  const setTab = (nextTab: 'compras' | 'ventas' | 'domicilios' | 'historial') => {
    setTabState(nextTab)
    setSearchParams({ tab: nextTab }, { replace: true })
  }

  const [isSyncing, setIsSyncing] = useState(false)

  const refresh = useCallback(async () => {
    const all = await fetchOrders()
    setOrders(all.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  }, [])

  const handleManualRefresh = async () => {
    setIsSyncing(true)
    await refresh()
    setTimeout(() => setIsSyncing(false), 400)
  }

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

  // Orders needing seller location confirmation
  const unconfirmedSellerOrders = activeSelling.filter((o) => !o.sellerBuildingConfirmed)

  // Métricas financieras
  const totalGross = historySelling.reduce((sum, o) => sum + o.total, 0)
  const totalNet = historySelling.reduce(
    (sum, o) => sum + (o.sellerNetRevenue || o.total - (o.platformCommission || Math.round(o.total * 0.05))),
    0,
  )

  // 1. Confirmación del CLIENTE (Comprador) -> "Pedido recibido"
  const handleConfirmarCliente = async (order: Order) => {
    playPaymentSuccess()
    const isCompleted = order.tendederoConfirmed && order.sellerPaidConfirmed
    const updated: Order = {
      ...order,
      buyerConfirmed: true,
      buyerConfirmedAt: new Date().toISOString(),
      status: isCompleted ? 'completado' : 'entregado',
    }
    setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)))
    await saveOrder(updated)
    success('¡Pedido recibido!', 'Has confirmado la recepción de tu snack con éxito.')
  }

  // 2. Confirmación del VENDEDOR (Dinero recibido) -> "Pago recibido"
  const handleConfirmarVendedorPago = async (order: Order) => {
    playPaymentSuccess()
    const isCompleted = order.tendederoConfirmed && order.buyerConfirmed
    const updated: Order = {
      ...order,
      sellerPaidConfirmed: true,
      sellerPaidConfirmedAt: new Date().toISOString(),
      status: isCompleted ? 'completado' : order.status,
    }
    setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)))
    await saveOrder(updated)
    bonus('¡Pago recibido!', 'Confirmaste el pago del pedido con éxito.')
  }

  // 3. Confirmación del TENDEDERO (Entrega realizada) -> "Pedido enviado"
  const handleConfirmarTendedero = async (order: Order) => {
    playPaymentSuccess()
    const isCompleted = order.buyerConfirmed && order.sellerPaidConfirmed
    const updated: Order = {
      ...order,
      tendederoConfirmed: true,
      tendederoConfirmedAt: new Date().toISOString(),
      status: isCompleted ? 'completado' : 'entregado_por_tendedero',
    }
    setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)))
    await saveOrder(updated)
    success('¡Pedido enviado!', 'Confirmaste la entrega del pedido.')
  }

  // Confirmar edificio actual del vendedor
  const handleConfirmSellerBuilding = async (order: Order, building: string) => {
    const updated: Order = {
      ...order,
      sellerBuilding: building,
      sellerBuildingConfirmed: true,
      pickup: building,
    }
    setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)))
    await saveOrder(updated)
    success('¡Ubicación de recogida confirmada!', `Se actualizó a ${building} para los Tendederos.`)
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
    <PageTransition>
      <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-primary">
            <Bike size={14} />
            <span>Domicilios y Entregas en Campus Icesi</span>
          </div>
          <h1 className="mt-1 font-display text-2xl font-black tracking-tight sm:text-3xl text-foreground">
            Mis Pedidos & Ventas en Campus
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Monitorea el estado de tus compras y pedidos recibidos, chatea con tu tendedero y confirma entregas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sincronización en vivo</span>
          </div>

          <button
            type="button"
            onClick={() => void handleManualRefresh()}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card hover:bg-secondary px-3 py-2 text-xs font-display font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            title="Refrescar estado de pedidos y confirmaciones"
          >
            <RotateCw size={13} className={isSyncing ? 'animate-spin text-primary' : 'text-muted-foreground'} />
            <span>{isSyncing ? 'Actualizando...' : 'Actualizar'}</span>
          </button>

          {canSell(role) && (
            <Link
              to="/vender"
              className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 px-3.5 py-2 text-xs font-display font-bold text-primary transition-colors cursor-pointer"
            >
              <Store size={14} />
              <span>Mis Snacks →</span>
            </Link>
          )}
        </div>
      </div>

      {/* Tab switcher filtrado por el rol del usuario */}
      <div className="flex flex-wrap rounded-2xl bg-secondary p-1 border border-border gap-1">
        {(canBuy(role) || !role) && (
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
        )}

        {canSell(role) && (
          <button
            type="button"
            onClick={() => setTab('ventas')}
            className={`rounded-xl px-3.5 py-2 text-xs font-display font-bold transition-all cursor-pointer ${
              tab === 'ventas'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Pedidos Recibidos / Ventas ({activeSelling.length})
          </button>
        )}

        {isTendedero(role) && (
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
        )}

        {canSell(role) && (
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
        )}
      </div>

      {/* Notificación interactiva al vendedor para confirmar su edificio actual */}
      {tab === 'ventas' && unconfirmedSellerOrders.length > 0 && (
        <div className="rounded-3xl border-2 border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 p-5 space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-display font-bold text-sm">
            <Building size={18} className="text-amber-600 animate-bounce" />
            <span>¿En qué edificio te encuentras ahora mismo para entregar tus pedidos?</span>
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300">
            Tienes {unconfirmedSellerOrders.length} {unconfirmedSellerOrders.length === 1 ? 'pedido pendiente' : 'pedidos pendientes'}. Los Tendederos necesitan saber tu ubicación para recoger la preparación gastronómica:
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {['Edificio D', 'Edificio E', 'Edificio C (Cafetería)', 'Edificio M', 'Biblioteca', 'El Samán'].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => {
                  unconfirmedSellerOrders.forEach((o) => void handleConfirmSellerBuilding(o, b))
                }}
                className="rounded-xl border border-amber-300 dark:border-amber-700 bg-card hover:bg-primary hover:text-white px-3.5 py-2 text-xs font-display font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
              >
                Estoy en {b}
              </button>
            ))}
          </div>
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
            ) : tab === 'ventas' || tab === 'historial' ? (
              <Link
                to="/vender"
                className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90 inline-block"
              >
                Ir al Panel Vendedor / Mis Snacks
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
        <div className="space-y-4">
          {displayedList.map((order) => {
            const statusInfo = statusLabels[order.status] || {
              label: order.status,
              color: 'bg-secondary text-foreground border-border',
            }
            const isOrderFullyComplete = Boolean(order.tendederoConfirmed && order.buyerConfirmed && order.sellerPaidConfirmed)
            const isUserBuyer = user?.id === order.buyerId
            const isUserSeller = Boolean(user && (
              order.sellerKey.toLowerCase().endsWith(`::${user.id.toLowerCase()}`) ||
              order.sellerKey.toLowerCase() === user.id.toLowerCase() ||
              order.sellerName.trim().toLowerCase() === user.name.trim().toLowerCase() ||
              ownsListing(order.sellerKey, user.id, user.name)
            ))
            const isUserTendedero = user?.id === order.tendederoId

            return (
              <article
                key={order.id}
                className={`rounded-3xl border bg-card p-5 sm:p-6 shadow-sm transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-5 ${
                  isOrderFullyComplete
                    ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-500/[0.03]'
                    : 'border-border/80 hover:border-primary/40'
                }`}
              >
                {/* 1. Izquierda: Imagen y Resumen del Pedido */}
                <div className="flex items-start sm:items-center gap-4 xl:w-[28%] shrink-0">
                  <div className="h-16 w-16 shrink-0 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden border border-border shadow-2xs">
                    {order.items[0]?.image_url ? (
                      <img src={order.items[0].image_url} alt={order.items[0].name} className="h-full w-full object-cover" />
                    ) : (
                      <Package size={26} className="text-primary opacity-60" />
                    )}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-mono font-bold border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">ID: #{order.id.slice(0, 6)}</span>
                    </div>
                    <h3 className="font-display text-base font-bold text-foreground truncate">
                      {order.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      👨‍🍳 <strong>{order.sellerName}</strong> · 🙋‍♂️ <strong>{order.buyerName}</strong>
                    </p>
                  </div>
                </div>

                {/* 2. Centro: Ruta en Campus Icesi */}
                <div className="rounded-2xl bg-secondary/60 p-3.5 text-xs space-y-1.5 border border-border/60 xl:w-[24%] shrink-0">
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-primary shrink-0" />
                    <span className="text-muted-foreground font-mono text-[10px] uppercase">Recogida:</span>
                    <span className="font-semibold text-foreground truncate">{order.sellerBuilding || order.pickup}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bike size={13} className="text-emerald-600 shrink-0" />
                    <span className="text-muted-foreground font-mono text-[10px] uppercase">Entrega:</span>
                    <span className="font-semibold text-foreground truncate">{order.deliveryLocation || 'Campus Icesi'}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/40 flex items-center justify-between">
                    <span>Repartidor:</span>
                    <span className="font-bold text-foreground truncate max-w-[150px]">
                      {order.tendederoName || '⏳ Buscando Tendedero...'}
                    </span>
                  </div>
                </div>

                {/* 3. Centro-Derecha: Verificación Tripartita Visible para los 3 en Horizontal */}
                <div className="rounded-2xl border border-border bg-card p-3 space-y-2 xl:w-[32%] shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Verificación Tripartita en Vivo:
                    </span>
                    {isOrderFullyComplete ? (
                      <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                        ✓ 100% Cerrado
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400">
                        En proceso
                      </span>
                    )}
                  </div>

                  {/* 3 Bloques de verificación horizontal lado a lado */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {/* Tendedero */}
                    <div
                      className={`p-2 rounded-xl border text-center transition-all ${
                        order.tendederoConfirmed
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                          : 'bg-secondary/40 border-border text-muted-foreground'
                      }`}
                    >
                      <span className="text-[9px] uppercase font-mono block font-bold truncate">1. Tendedero</span>
                      <span className="text-xs font-bold block mt-0.5">
                        {order.tendederoConfirmed ? '✓ Enviado' : '⏳ Pendiente'}
                      </span>
                    </div>

                    {/* Cliente */}
                    <div
                      className={`p-2 rounded-xl border text-center transition-all ${
                        order.buyerConfirmed
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                          : 'bg-secondary/40 border-border text-muted-foreground'
                      }`}
                    >
                      <span className="text-[9px] uppercase font-mono block font-bold truncate">2. Cliente</span>
                      <span className="text-xs font-bold block mt-0.5">
                        {order.buyerConfirmed ? '✓ Recibido' : '⏳ Pendiente'}
                      </span>
                    </div>

                    {/* Vendedor */}
                    <div
                      className={`p-2 rounded-xl border text-center transition-all ${
                        order.sellerPaidConfirmed
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                          : 'bg-secondary/40 border-border text-muted-foreground'
                      }`}
                    >
                      <span className="text-[9px] uppercase font-mono block font-bold truncate">3. Vendedor</span>
                      <span className="text-xs font-bold block mt-0.5">
                        {order.sellerPaidConfirmed ? '✓ Cobrado' : '⏳ Pendiente'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Derecha: Importe Total & Acciones */}
                <div className="flex flex-row xl:flex-col items-center xl:items-end justify-between xl:justify-center gap-3 xl:w-[16%] border-t xl:border-t-0 pt-3 xl:pt-0 border-border">
                  <div className="text-left xl:text-right">
                    <span className="font-mono text-lg font-black text-primary block leading-none">{money(order.total)}</span>
                    <span className="text-[10px] font-mono text-emerald-600 block mt-0.5 font-bold">
                      {order.deliveryFee ? `Envío: +${money(order.deliveryFee)} COP` : 'Envío en campus'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 w-full xl:w-full">
                    {/* Botón de confirmación si el usuario es el Comprador y falta su visto bueno */}
                    {((tab === 'compras' && !order.buyerConfirmed) || (isUserBuyer && !order.buyerConfirmed)) && (
                      <button
                        type="button"
                        onClick={() => void handleConfirmarCliente(order)}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 px-3 text-xs font-display font-bold text-white shadow-xs active:scale-95 transition-all cursor-pointer"
                      >
                        <CheckCircle2 size={14} />
                        <span>Confirmar: Recibido</span>
                      </button>
                    )}

                    {/* Botón de confirmación si el usuario es el Vendedor y falta confirmar pago */}
                    {((tab === 'ventas' && !order.sellerPaidConfirmed) || (isUserSeller && !order.sellerPaidConfirmed)) && (
                      <button
                        type="button"
                        onClick={() => void handleConfirmarVendedorPago(order)}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 px-3 text-xs font-display font-bold text-white shadow-xs active:scale-95 transition-all cursor-pointer"
                      >
                        <DollarSign size={14} />
                        <span>Confirmar: Pago</span>
                      </button>
                    )}

                    {/* Botón de confirmación si el usuario es el Tendedero y falta confirmar entrega */}
                    {((tab === 'domicilios' && !order.tendederoConfirmed) || (isUserTendedero && !order.tendederoConfirmed)) && (
                      <button
                        type="button"
                        onClick={() => void handleConfirmarTendedero(order)}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary hover:opacity-90 py-2.5 px-3 text-xs font-display font-bold text-primary-foreground shadow-xs active:scale-95 transition-all cursor-pointer"
                      >
                        <CheckCircle2 size={14} />
                        <span>Confirmar: Enviado</span>
                      </button>
                    )}

                    {/* Canales de Chat Contextuales */}
                    {tab === 'compras' || isUserBuyer ? (
                      order.tendederoId ? (
                        <button
                          type="button"
                          onClick={() => openChatWith(order, 'tendedero')}
                          className="w-full flex items-center justify-center gap-1 rounded-xl border border-border bg-secondary py-2 px-2.5 text-xs font-semibold hover:bg-secondary/80 transition-colors cursor-pointer"
                        >
                          <Bike size={13} className="text-emerald-600" />
                          <span className="truncate">Chat Tendedero</span>
                        </button>
                      ) : null
                    ) : tab === 'ventas' || isUserSeller ? (
                      order.tendederoId ? (
                        <button
                          type="button"
                          onClick={() => openChatWith(order, 'tendedero')}
                          className="w-full flex items-center justify-center gap-1 rounded-xl border border-border bg-secondary py-2 px-2.5 text-xs font-semibold hover:bg-secondary/80 transition-colors cursor-pointer"
                        >
                          <Bike size={13} className="text-emerald-600" />
                          <span className="truncate">Chat Tendedero</span>
                        </button>
                      ) : null
                    ) : tab === 'domicilios' || isUserTendedero ? (
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => openChatWith(order, 'seller')}
                          className="flex items-center justify-center gap-1 rounded-xl border border-border bg-secondary py-2 text-[11px] font-semibold hover:bg-secondary/80 transition-colors cursor-pointer"
                        >
                          <MessageCircle size={12} className="text-primary" />
                          <span>Vendedor</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openChatWith(order, 'buyer')}
                          className="flex items-center justify-center gap-1 rounded-xl border border-border bg-secondary py-2 text-[11px] font-semibold hover:bg-secondary/80 transition-colors cursor-pointer"
                        >
                          <MessageCircle size={12} className="text-primary" />
                          <span>Cliente</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
      </div>
    </PageTransition>
  )
}
