import {
  Bike,
  CreditCard,
  MapPin,
  QrCode,
  Receipt,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { fetchProduct, incrementMetric, updateProduct } from '../lib/api'
import { sendMessage } from '../lib/chat'
import { DELIVERY_FEE, PICKUP_POINTS, inputClass, labelClass } from '../lib/constants'
import { displaySeller, money, sellerUserId } from '../lib/format'
import { playPaymentSuccess } from '../lib/sounds'
import { saveOrder } from '../lib/storage-db'
import type { Order, PaymentMethod } from '../types'

export function CheckoutPage() {
  const { user } = useAuth()
  const { items, total, clear } = useCart()
  const navigate = useNavigate()

  const [selectedSpot, setSelectedSpot] = useState<string>(PICKUP_POINTS[0])
  const [detailLocation, setDetailLocation] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qr_nequi')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const deliveryFee = DELIVERY_FEE // 200 COP
  const finalTotal = total + deliveryFee

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!user || items.length === 0) return
    setLoading(true)
    setError('')

    try {
      // 1. Verificar stock
      for (const item of items) {
        const product = await fetchProduct(item.productId)
        if (!product || product.sold_out || product.stock < item.qty) {
          throw new Error(`Ya no hay suficiente stock de ${item.name}`)
        }
        const stock = product.stock - item.qty
        await updateProduct(item.productId, {
          stock,
          sold_out: stock === 0,
          intent_count: product.intent_count,
        })
      }

      // 2. Agrupar por vendedor
      const groups = new Map<string, typeof items>()
      items.forEach((item) => {
        const current = groups.get(item.seller) ?? []
        groups.set(item.seller, [...current, item])
      })

      const fullDeliveryLocation = detailLocation.trim()
        ? `${selectedSpot} · ${detailLocation.trim()}`
        : selectedSpot

      for (const [sellerKey, group] of groups) {
        const orderId = crypto.randomUUID()
        const sId = sellerUserId(sellerKey)
        const sName = displaySeller(sellerKey)

        const subtotalGroup = group.reduce((sum, item) => sum + item.price * item.qty, 0)
        const orderTotal = subtotalGroup + deliveryFee
        const commission = Math.round(subtotalGroup * 0.05)
        const netRevenue = subtotalGroup - commission

        const order: Order = {
          id: orderId,
          buyerId: user.id,
          buyerName: user.name,
          buyerEmail: user.email,
          sellerKey,
          sellerName: sName,
          items: group.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            qty: item.qty,
            image_url: item.image_url,
          })),
          total: orderTotal,
          pickup: `Edificio de ${sName}`,
          deliveryLocation: fullDeliveryLocation,
          deliveryFee,
          note,
          status: 'solicitado',
          createdAt: new Date().toISOString(),
          paymentMethod,
          paymentStatus: 'pendiente',
          platformCommission: commission,
          sellerNetRevenue: netRevenue,
          tendederoConfirmed: false,
          buyerConfirmed: false,
          sellerPaidConfirmed: false,
        }

        await saveOrder(order)

        // Notificar en el chat
        const itemsSummary = group.map((i) => `${i.qty}x ${i.name}`).join(', ')
        await sendMessage({
          conversationId: `order_${orderId}`,
          senderId: user.id,
          senderName: user.name,
          recipientId: sId,
          recipientName: sName,
          orderId,
          productName: itemsSummary,
          text: `🎉 ¡Nuevo pedido solicitado!\n` +
            `📦 Producto(s): ${itemsSummary}\n` +
            `📍 Entrega en: ${fullDeliveryLocation}\n` +
            `🛵 Domicilio Tendedero: +$200 COP\n` +
            `💵 Total: ${money(orderTotal)}`,
          messageType: 'text',
        })
      }

      await incrementMetric('inventory_updates')
      playPaymentSuccess()
      clear()
      navigate('/pedidos')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo procesar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm text-muted-foreground">Tu carrito está vacío.</p>
      </div>
    )
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:px-6">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-mono font-bold text-primary mb-2">
          <Bike size={14} />
          <span>Servicio de Mensajería y Domicilio Universitario</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-foreground">
          Confirmar Pedido y Entrega
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Un <strong>Tendedero</strong> (estudiante repartidor) tomará tu solicitud, irá con el cocinero y te entregará el snack en tu ubicación en la U.
        </p>
      </div>

      {/* 1. Selector de Punto de Entrega en el Campus */}
      <div className="rounded-3xl border border-border/80 bg-card/80 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <MapPin size={14} className="text-primary" />
            1. ¿Dónde estás en el campus para recibir?
          </span>
          <span className="text-xs font-mono text-emerald-600 font-bold">Entrega directa en la U</span>
        </div>

        <div className="space-y-3">
          <div>
            <label className={labelClass}>Edificio / Zona de entrega</label>
            <select
              value={selectedSpot}
              onChange={(e) => setSelectedSpot(e.target.value)}
              className={inputClass}
            >
              {PICKUP_POINTS.map((spot) => (
                <option key={spot} value={spot}>
                  {spot}
                </option>
              ))}
              <option value="Biblioteca Central">Biblioteca Central</option>
              <option value="Edificio E (Ingeniería)">Edificio E (Ingeniería)</option>
              <option value="Cafetería Central">Cafetería Central</option>
              <option value="El Samán">El Samán</option>
              <option value="Plazoleta Las Palmas">Plazoleta Las Palmas</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Detalle de ubicación (Opcional)</label>
            <input
              type="text"
              placeholder="Ej: Piso 2, Mesa cerca a la ventana o Salón 204"
              value={detailLocation}
              onChange={(e) => setDetailLocation(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Nota o instrucción para el Tendedero (Opcional)</label>
            <input
              type="text"
              placeholder="Ej: Avisar por chat cuando llegues al edificio"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* 2. Método de Pago */}
      <div className="rounded-3xl border border-border/80 bg-card/80 p-5 shadow-sm space-y-4">
        <span className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <CreditCard size={14} className="text-primary" />
          2. Método de Pago Acordado
        </span>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPaymentMethod('qr_nequi')}
            className={`flex items-center justify-center gap-2 rounded-2xl py-3 px-4 text-xs font-display font-bold border transition-all ${
              paymentMethod === 'qr_nequi'
                ? 'border-primary bg-primary/15 text-primary'
                : 'border-border bg-secondary/40 text-foreground hover:bg-secondary'
            }`}
          >
            <QrCode size={16} /> Nequi / Dale
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('efectivo')}
            className={`flex items-center justify-center gap-2 rounded-2xl py-3 px-4 text-xs font-display font-bold border transition-all ${
              paymentMethod === 'efectivo'
                ? 'border-primary bg-primary/15 text-primary'
                : 'border-border bg-secondary/40 text-foreground hover:bg-secondary'
            }`}
          >
            💵 Efectivo al recibir
          </button>
        </div>
      </div>

      {/* 3. Recibo y Resumen Financiero con +$200 de Domicilio */}
      <div className="rounded-3xl border border-border/80 bg-secondary/40 p-5 space-y-3">
        <div className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
          <Receipt size={16} className="text-primary" />
          <span>Resumen de tu Pedido</span>
        </div>

        <div className="divide-y divide-border/60 text-xs">
          {items.map((it) => (
            <div key={it.productId} className="flex justify-between py-2 text-muted-foreground">
              <span>{it.qty}x {it.name}</span>
              <span className="font-mono">{money(it.price * it.qty)}</span>
            </div>
          ))}

          <div className="flex justify-between py-2 text-muted-foreground">
            <span>Subtotal snacks:</span>
            <span className="font-mono">{money(total)}</span>
          </div>

          <div className="flex justify-between py-2 text-primary font-semibold">
            <span className="flex items-center gap-1">
              <Bike size={13} /> Domicilio Tendedero en Campus:
            </span>
            <span className="font-mono">+$200 COP</span>
          </div>

          <div className="flex justify-between pt-3 font-display font-extrabold text-base text-foreground">
            <span>Total a Pagar:</span>
            <span className="font-mono text-primary text-lg">{money(finalTotal)}</span>
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary hover:opacity-90 py-4 font-display text-sm font-bold text-primary-foreground shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
      >
        <Bike size={18} />
        <span>{loading ? 'Generando solicitud...' : `Confirmar y Pedir (${money(finalTotal)})`}</span>
      </button>
    </form>
  )
}
