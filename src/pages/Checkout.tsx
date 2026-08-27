import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { fetchProduct, incrementMetric, updateProduct } from '../lib/api'
import { inputClass, labelClass, PICKUP_POINTS } from '../lib/constants'
import { displaySeller, money } from '../lib/format'
import { saveOrder } from '../lib/storage-db'
import type { Order } from '../types'

export function CheckoutPage() {
  const { user } = useAuth()
  const { items, total, clear } = useCart()
  const navigate = useNavigate()
  const [pickup, setPickup] = useState<(typeof PICKUP_POINTS)[number]>(PICKUP_POINTS[0])
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

      for (const [sellerKey, group] of groups) {
        const order: Order = {
          id: crypto.randomUUID(),
          buyerId: user.id,
          buyerName: user.name,
          buyerEmail: user.email,
          sellerKey,
          sellerName: displaySeller(sellerKey),
          items: group.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            qty: item.qty,
            image_url: item.image_url,
          })),
          total: group.reduce((sum, item) => sum + item.price * item.qty, 0),
          pickup,
          note,
          status: 'reservado',
          createdAt: new Date().toISOString(),
        }
        await saveOrder(order)
      }

      await incrementMetric('inventory_updates')
      clear()
      navigate('/pedidos')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo reservar')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay nada para reservar.</p>
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="mx-auto max-w-xl space-y-5">
      <h1 className="font-display text-3xl font-bold">Checkout</h1>
      <p className="text-sm text-muted-foreground">
        Reservarás {items.length} producto(s) por {money(total)}. Pagas cuando recojas.
      </p>
      <div>
        <label className={labelClass} htmlFor="pickup">
          Punto de encuentro
        </label>
        <select
          id="pickup"
          value={pickup}
          onChange={(e) => setPickup(e.target.value as (typeof PICKUP_POINTS)[number])}
          className={inputClass}
        >
          {PICKUP_POINTS.map((point) => (
            <option key={point} value={point}>
              {point}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass} htmlFor="note">
          Nota para el vendedor
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={inputClass}
          rows={3}
          placeholder="Ej. paso a las 12:30 por la cafetería"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary py-3 font-display font-bold text-primary-foreground disabled:opacity-50"
      >
        {loading ? 'Reservando...' : 'Confirmar reserva'}
      </button>
    </form>
  )
}
