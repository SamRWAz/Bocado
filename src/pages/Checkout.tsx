import { MapPin, ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { fetchProduct, incrementMetric, updateProduct } from '../lib/api'
import { sendMessage } from '../lib/chat'
import { GUARANTEED_RESERVE_FEE, inputClass, labelClass, PICKUP_POINTS } from '../lib/constants'
import { displaySeller, money, sellerUserId } from '../lib/format'
import { saveOrder } from '../lib/storage-db'
import type { Order } from '../types'

export function CheckoutPage() {
  const { user } = useAuth()
  const { items, total, clear } = useCart()
  const navigate = useNavigate()
  const [pickup, setPickup] = useState<(typeof PICKUP_POINTS)[number]>(PICKUP_POINTS[0])
  const [note, setNote] = useState('')
  const [guaranteedReserve, setGuaranteedReserve] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const finalTotal = total + (guaranteedReserve ? GUARANTEED_RESERVE_FEE : 0)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!user || items.length === 0) return
    setLoading(true)
    setError('')
    try {
      const groups = new Map<string, typeof items>()
      items.forEach((item) => {
        const current = groups.get(item.seller) ?? []
        groups.set(item.seller, [...current, item])
      })

      // Check and update stock
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

      let lastOrderId = ''
      let lastSellerId = ''
      let lastSellerName = ''

      for (const [sellerKey, group] of groups) {
        const orderId = crypto.randomUUID()
        lastOrderId = orderId
        const sId = sellerUserId(sellerKey)
        const sName = displaySeller(sellerKey)
        lastSellerId = sId
        lastSellerName = sName

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
          total: group.reduce((sum, item) => sum + item.price * item.qty, 0) + (guaranteedReserve ? GUARANTEED_RESERVE_FEE : 0),
          pickup,
          note,
          status: 'reservado',
          createdAt: new Date().toISOString(),
          isGuaranteed: guaranteedReserve,
          reserveFee: guaranteedReserve ? GUARANTEED_RESERVE_FEE : 0,
        }
        await saveOrder(order)

        // Automatically create a coordination chat between buyer and seller
        const itemsSummary = group.map((i) => `${i.qty}x ${i.name}`).join(', ')
        await sendMessage({
          conversationId: `order_${orderId}`,
          senderId: user.id,
          senderName: user.name,
          recipientId: sId,
          recipientName: sName,
          orderId,
          productName: itemsSummary,
          text: `👋 ¡Hola ${sName}! Acabo de reservar: ${itemsSummary}. Punto de recogida: 📍 ${pickup}.${
            note ? ` Nota: "${note}"` : ''
          }`,
          messageType: 'text',
        })
      }

      await incrementMetric('inventory_updates')
      clear()

      // Redirect directly to the coordination chat for this order
      if (lastOrderId && lastSellerId) {
        navigate(
          `/mensajes?conv=order_${lastOrderId}&partnerId=${encodeURIComponent(
            lastSellerId,
          )}&partnerName=${encodeURIComponent(lastSellerName)}&orderId=${lastOrderId}`,
        )
      } else {
        navigate('/pedidos')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo apartar el snack')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm text-muted-foreground">Tu bolsa de reserva está vacía.</p>
      </div>
    )
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="mx-auto max-w-xl space-y-6 px-4 py-6 sm:px-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Coordinar Reserva</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aparta tus snacks para asegurar stock y coordina la entrega en el campus. Pagas al momento de recibir.
        </p>
      </div>

      {/* Summary Box */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Resumen de snacks ({items.length})
        </span>
        <ul className="space-y-2 text-sm divide-y divide-border/40">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between items-center pt-2 first:pt-0">
              <div>
                <span className="font-medium text-foreground">{item.name}</span>
                <p className="text-xs text-muted-foreground">Vendedor: {displaySeller(item.seller)}</p>
              </div>
              <span className="font-display font-bold text-primary">
                {item.qty} × {money(item.price)}
              </span>
            </li>
          ))}
        </ul>

        {/* Guaranteed Reserve Option */}
        <div className="pt-3 border-t border-border">
          <label className="flex items-start gap-3 rounded-xl bg-secondary/50 p-3 cursor-pointer hover:bg-secondary/70 transition-colors">
            <input
              type="checkbox"
              checked={guaranteedReserve}
              onChange={(e) => setGuaranteedReserve(e.target.checked)}
              className="mt-1 rounded text-primary focus:ring-primary h-4 w-4"
            />
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between font-display font-semibold text-foreground">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={14} className="text-primary" /> Tarifa de Reserva Garantizada
                </span>
                <span className="text-primary font-bold">+{money(GUARANTEED_RESERVE_FEE)}</span>
              </div>
              <p className="mt-1 text-muted-foreground leading-relaxed">
                Congela y aparta tu snack con máxima prioridad mientras te desplazas por el campus.
              </p>
            </div>
          </label>
        </div>

        <div className="pt-2 flex justify-between items-baseline border-t border-border font-display">
          <span className="text-sm font-semibold">Total a pagar en entrega:</span>
          <span className="text-2xl font-bold text-primary">{money(finalTotal)}</span>
        </div>
      </div>

      {/* Pickup Location */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
        <div>
          <label className={labelClass} htmlFor="pickup">
            Punto de encuentro en el campus
          </label>
          <div className="relative">
            <select
              id="pickup"
              value={pickup}
              onChange={(e) => setPickup(e.target.value as (typeof PICKUP_POINTS)[number])}
              className={`${inputClass} pl-10`}
            >
              {PICKUP_POINTS.map((point) => (
                <option key={point} value={point}>
                  {point}
                </option>
              ))}
            </select>
            <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="note">
            Indicaciones para el vendedor
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={inputClass}
            rows={2}
            placeholder="Ej. Salgo de clase a las 11:15 en el salón D204, tengo chompa azul."
          />
        </div>
      </div>

      {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-primary py-4 font-display text-sm font-bold text-primary-foreground shadow-lg transition-transform hover:opacity-90 active:scale-95 disabled:opacity-50"
      >
        {loading ? 'Apartando snack...' : 'Confirmar reserva y abrir Chat con el vendedor'}
      </button>
    </form>
  )
}
