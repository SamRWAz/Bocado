import {
  Bike,
  CheckCircle2,
  Clock,
  MessageCircle,
  Package,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageTransition } from '../components/PageTransition'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatTime, money, sellerUserId } from '../lib/format'
import { DELIVERY_FEE } from '../lib/pricing'
import { playKeyBeep, playPaymentSuccess } from '../lib/sounds'
import { fetchOrders, saveOrder, subscribeToOrderUpdates } from '../lib/storage-db'
import type { Order } from '../types'

export function DeliveriesPage() {
  const { user } = useAuth()
  const { success, bonus } = useToast()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [tab, setTab] = useState<'disponibles' | 'activas' | 'historial'>('disponibles')

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

  if (!user) {
    return (
      <div className="py-20 text-center space-y-4">
        <Bike size={48} className="mx-auto text-primary opacity-60" />
        <h2 className="font-display text-xl font-bold">Inicia sesión para ver solicitudes de Tendedero</h2>
        <p className="text-xs text-muted-foreground">Regístrate o inicia sesión como Tendedero para hacer entregas en el campus.</p>
        <Link to="/login" className="inline-block rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground">
          Iniciar sesión
        </Link>
      </div>
    )
  }

  // Solicitudes abiertas para cualquier tendedero
  const disponibles = orders.filter(
    (o) => (o.status === 'solicitado' || o.status === 'reservado') && !o.tendederoId && o.buyerId !== user.id,
  )

  // Entregas activas tomadas por el usuario actual
  const misActivas = orders.filter(
    (o) => o.tendederoId === user.id && o.status !== 'completado' && o.status !== 'cancelado',
  )

  // Historial de entregas completadas por el usuario actual
  const misCompletadas = orders.filter(
    (o) => o.tendederoId === user.id && (o.status === 'completado' || o.tendederoConfirmed),
  )

  const totalGanado = misCompletadas.reduce((sum, o) => sum + (o.deliveryFee || DELIVERY_FEE), 0)

  // Acción: Aceptar solicitud / Tomar pedido
  const handleTomarPedido = async (order: Order) => {
    playKeyBeep(800)
    const fee = order.deliveryFee || DELIVERY_FEE
    const updated: Order = {
      ...order,
      status: 'tomado',
      tendederoId: user.id,
      tendederoName: user.name,
      tendederoAcceptedAt: new Date().toISOString(),
      deliveryFee: fee,
    }
    // Optimistic update so it immediately transitions to active deliveries
    setOrders((prev) => [updated, ...prev.filter((o) => o.id !== order.id)])
    setTab('activas')
    bonus(`¡Tomaste el pedido para entrega!`, `Carrera asignada. Llévalo a ${order.deliveryLocation || 'punto acordado'}.`)
    await saveOrder(updated)
  }

  // Acción: Confirmar que entregó el pedido
  const handleConfirmarEntregaTendedero = async (order: Order) => {
    playPaymentSuccess()
    const fee = order.deliveryFee || DELIVERY_FEE
    const isCompleted = order.buyerConfirmed && order.sellerPaidConfirmed
    const updated: Order = {
      ...order,
      tendederoConfirmed: true,
      tendederoConfirmedAt: new Date().toISOString(),
      status: isCompleted ? 'completado' : 'entregado_por_tendedero',
    }
    setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)))
    success(`¡Pedido enviado!`, `Marcaste la entrega como enviada. Ganancia de carrera: +${money(fee)}.`)
    await saveOrder(updated)
  }

  // Navegar al chat con el comprador
  const handleChatComprador = (order: Order) => {
    const firstItem = order.items[0]?.name ?? 'Snack'
    navigate(
      `/mensajes?conv=order_${order.id}_tendedero_buyer&partnerId=${encodeURIComponent(
        order.buyerId,
      )}&partnerName=${encodeURIComponent(order.buyerName)}&orderId=${order.id}&productName=${encodeURIComponent(
        firstItem,
      )}`,
    )
  }

  // Navegar al chat con el vendedor
  const handleChatVendedor = (order: Order) => {
    const sId = sellerUserId(order.sellerKey)
    const firstItem = order.items[0]?.name ?? 'Snack'
    navigate(
      `/mensajes?conv=order_${order.id}_tendedero_seller&partnerId=${encodeURIComponent(
        sId,
      )}&partnerName=${encodeURIComponent(order.sellerName)}&orderId=${order.id}&productName=${encodeURIComponent(
        firstItem,
      )}`,
    )
  }

  return (
    <PageTransition>
      <div className="space-y-6 pb-16">
      {/* Banner Superior Tendedero */}
      <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card to-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider text-primary-foreground shadow-xs">
                <Bike size={14} /> Tendedero Universitario
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Activo en Campus
              </span>
            </div>
            <h1 className="mt-2 font-display text-2xl font-black tracking-tight sm:text-3xl text-foreground">
              Entregas y Domicilios en Campus
            </h1>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm max-w-xl">
              Gana <strong>$200 COP</strong> por cada entrega rápida entre edificios dentro de la universidad.
              Recoge el snack del vendedor y llévaselo al comprador sin salir de la U.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-xs sm:text-right min-w-[180px]">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground block">
              Ganancias acumuladas
            </span>
            <p className="font-mono text-2xl font-black text-primary">{money(totalGanado)}</p>
            <span className="text-[11px] text-muted-foreground block">
              {misCompletadas.length} {misCompletadas.length === 1 ? 'entrega realizada' : 'entregas realizadas'}
            </span>
          </div>
        </div>
      </div>


      {/* Tabs */}
      <div className="flex flex-wrap rounded-2xl bg-secondary p-1 border border-border gap-1">
        <button
          type="button"
          onClick={() => setTab('disponibles')}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-display font-bold transition-all cursor-pointer ${
            tab === 'disponibles'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Package size={14} />
          <span>Solicitudes Disponibles ({disponibles.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('activas')}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-display font-bold transition-all cursor-pointer ${
            tab === 'activas'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bike size={14} />
          <span>Mis Entregas en Curso ({misActivas.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('historial')}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-display font-bold transition-all cursor-pointer ${
            tab === 'historial'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Clock size={14} />
          <span>Historial ({misCompletadas.length})</span>
        </button>
      </div>

      {/* CONTENIDO PESTAÑA 1: SOLICITUDES DISPONIBLES */}
      {tab === 'disponibles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-foreground">
              Pedidos esperando por un Tendedero ({disponibles.length})
            </h2>
            <span className="text-xs text-muted-foreground font-mono">Actualizado en tiempo real</span>
          </div>

          {disponibles.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center text-muted-foreground space-y-2">
              <Package size={36} className="mx-auto opacity-30 text-primary" />
              <p className="font-display font-bold text-foreground text-sm">No hay solicitudes de entrega en este momento</p>
              <p className="text-xs max-w-sm mx-auto">
                Tan pronto un estudiante aparte un snack en el campus, aparecerá aquí para que puedas tomar el pedido y realizar la entrega en el campus.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {disponibles.map((order) => {
                return (
                  <article
                    key={order.id}
                    className="flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-5 shadow-sm space-y-4 hover:border-primary/50 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="text-[10px] font-mono font-bold uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                            Entrega en Campus
                          </span>
                          <h3 className="font-display text-base font-bold text-foreground truncate mt-1">
                            {order.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                          </h3>
                        </div>
                        <span className="rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-1 text-xs font-mono font-bold shrink-0">
                          +{money(order.deliveryFee || DELIVERY_FEE)} COP
                        </span>
                      </div>

                      {/* Ruta de entrega de edificio a edificio */}
                      <div className="rounded-2xl bg-secondary/60 p-3 space-y-2 text-xs border border-border/60">
                        <div className="flex items-start gap-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[#8F1414] dark:bg-red-950 dark:text-red-300 text-[10px] font-bold">
                            1
                          </span>
                          <div>
                            <span className="text-[10px] text-muted-foreground font-mono uppercase block">Punto 1 (Recoger con Vendedor):</span>
                            <span className="font-bold text-foreground">{order.sellerBuilding || order.pickup || 'Campus Icesi'}</span>
                            <span className="text-[11px] text-muted-foreground block">Cocinero(a): {order.sellerName}</span>
                          </div>
                        </div>

                        <div className="border-l-2 border-dashed border-border ml-2.5 h-3" />

                        <div className="flex items-start gap-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                            2
                          </span>
                          <div>
                            <span className="text-[10px] text-muted-foreground font-mono uppercase block">Punto 2 (Entregar a Comprador):</span>
                            <span className="font-bold text-foreground">
                              {order.buyerBuilding || order.deliveryLocation || 'Punto acordado en campus'}
                            </span>
                            <span className="text-[11px] text-muted-foreground block">Cliente: {order.buyerName}</span>
                          </div>
                        </div>
                      </div>

                      {/* Transparencia financiera para el tendedero */}
                      <div className="rounded-xl bg-card p-2.5 text-[11px] space-y-1 border border-border/50 font-mono">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Pago en mano a vendedor:</span>
                          <span className="font-bold text-foreground">
                            {money(order.vendorPayout || Math.max(0, order.total - (order.deliveryFee || DELIVERY_FEE)))}
                          </span>
                        </div>
                        <div className="flex justify-between text-emerald-600 font-bold">
                          <span>Cobro a tu favor al entregar:</span>
                          <span>{money(order.tendederoPayout || order.total)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleTomarPedido(order)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:opacity-90 py-3 text-xs font-display font-bold text-primary-foreground shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      <Bike size={16} />
                      <span>Tomar Pedido y Entregar</span>
                    </button>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* CONTENIDO PESTAÑA 2: MIS ENTREGAS ACTIVAS */}
      {tab === 'activas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-foreground">
              Tus entregas en proceso ({misActivas.length})
            </h2>
          </div>

          {misActivas.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center text-muted-foreground space-y-3">
              <Bike size={36} className="mx-auto opacity-30 text-primary" />
              <p className="font-display font-bold text-foreground text-sm">No tienes entregas activas ahora</p>
              <button
                type="button"
                onClick={() => setTab('disponibles')}
                className="inline-block rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground cursor-pointer"
              >
                Ver Solicitudes Disponibles
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {misActivas.map((order) => {
                return (
                  <article
                    key={order.id}
                    className="flex flex-col justify-between rounded-3xl border-2 border-primary/30 bg-card p-5 shadow-md space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-mono font-bold text-primary">
                          {order.tendederoConfirmed ? 'Entregado por ti' : 'En camino / Entrega activa'}
                        </span>
                        <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          +{money(order.deliveryFee || DELIVERY_FEE)} COP
                        </span>
                      </div>

                      <h3 className="font-display text-lg font-bold text-foreground">
                        {order.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                      </h3>

                      {/* Ruta visual de edificio a edificio */}
                      <div className="rounded-2xl bg-secondary/80 p-3.5 space-y-2 text-xs border border-border">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] uppercase text-muted-foreground">Paso 1 (Recoger):</span>
                          <span className="font-bold text-foreground">{order.sellerBuilding || order.pickup || 'Campus Icesi'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] uppercase text-muted-foreground">Paso 2 (Entregar):</span>
                          <span className="font-bold text-foreground">{order.buyerBuilding || order.deliveryLocation || 'Campus Icesi'}</span>
                        </div>
                      </div>

                      {/* Estado de las 3 confirmaciones */}
                      <div className="rounded-xl border border-border bg-card p-3 space-y-1.5 text-xs">
                        <span className="font-mono text-[10px] uppercase text-muted-foreground block font-bold">
                          Estado de Confirmaciones:
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={order.tendederoConfirmed ? 'text-emerald-600' : 'text-muted-foreground'}>
                            {order.tendederoConfirmed ? '✅' : '⏳'} Tu entrega: {order.tendederoConfirmed ? 'Confirmada' : 'Pendiente'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={order.buyerConfirmed ? 'text-emerald-600' : 'text-muted-foreground'}>
                            {order.buyerConfirmed ? '✅' : '⏳'} Cliente recibió: {order.buyerConfirmed ? 'Confirmado' : 'Pendiente'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={order.sellerPaidConfirmed ? 'text-emerald-600' : 'text-muted-foreground'}>
                            {order.sellerPaidConfirmed ? '✅' : '⏳'} Dinero recibido: {order.sellerPaidConfirmed ? 'Confirmado' : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border/60">
                      {/* Chats con ambas partes */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleChatVendedor(order)}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary py-2.5 text-xs font-semibold hover:bg-secondary/80 transition-colors"
                        >
                          <MessageCircle size={14} className="text-primary" />
                          <span>Chat Vendedor</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChatComprador(order)}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary py-2.5 text-xs font-semibold hover:bg-secondary/80 transition-colors"
                        >
                          <MessageCircle size={14} className="text-primary" />
                          <span>Chat Comprador</span>
                        </button>
                      </div>

                      {/* Botón de confirmación final del tendedero */}
                      {!order.tendederoConfirmed ? (
                        <button
                          type="button"
                          onClick={() => void handleConfirmarEntregaTendedero(order)}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-[#751010] py-3 text-xs font-display font-bold text-white shadow-sm active:scale-95 transition-all cursor-pointer"
                        >
                          <CheckCircle2 size={16} />
                          <span>Confirmar: Pedido enviado</span>
                        </button>
                      ) : (
                        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-2 text-center text-xs text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                          ✓ Marcaste este pedido como enviado
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* CONTENIDO PESTAÑA 3: HISTORIAL */}
      {tab === 'historial' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-foreground">
              Historial de Entregas Realizadas ({misCompletadas.length})
            </h2>
          </div>

          {misCompletadas.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center text-muted-foreground space-y-2">
              <Clock size={36} className="mx-auto opacity-30 text-primary" />
              <p className="font-display font-bold text-foreground text-sm">Aún no tienes entregas en el historial</p>
              <p className="text-xs">Toma solicitudes de entrega para ganar $200 COP por cada domicilio en campus.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {misCompletadas.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-border bg-card p-4 gap-3 shadow-xs"
                >
                  <div>
                    <h4 className="font-display font-bold text-foreground text-sm">
                      {order.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      De {order.pickup} → Para {order.buyerName} en {order.deliveryLocation || 'Campus'}
                    </p>
                    <span className="text-[11px] text-muted-foreground font-mono">{formatTime(order.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-3 py-1 text-xs font-mono font-bold">
                      +$200 COP Ganados
                    </span>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={14} /> Completado
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </div>
    </PageTransition>
  )
}
