import {
  Boxes,
  Building2,
  CreditCard,
  Lock,
  QrCode,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { fetchProduct, incrementMetric, updateProduct } from '../lib/api'
import { sendMessage } from '../lib/chat'
import { GUARANTEED_RESERVE_FEE, inputClass, labelClass } from '../lib/constants'
import { displaySeller, money, sellerUserId } from '../lib/format'
import {
  LOCKER_HUBS,
  PLATFORM_COMMISSION_RATE,
  assignLocker,
  generatePin,
  getLockersByHub,
} from '../lib/lockers'
import { playPaymentSuccess } from '../lib/sounds'
import { saveOrder } from '../lib/storage-db'
import type { Order, PaymentMethod } from '../types'

export function CheckoutPage() {
  const { user } = useAuth()
  const { items, total, clear } = useCart()
  const navigate = useNavigate()

  const [selectedHubId, setSelectedHubId] = useState('hub_edificio_d')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qr_nequi')
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 9012')
  const [cardHolder] = useState(user?.name || 'Estudiante Icesi')
  const [cardExp, setCardExp] = useState('08/28')
  const [cardCvv, setCardCvv] = useState('834')
  const [note] = useState('')
  const [guaranteedReserve, setGuaranteedReserve] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const activeHub = LOCKER_HUBS.find((h) => h.id === selectedHubId) ?? LOCKER_HUBS[0]
  const hubLockers = getLockersByHub(selectedHubId)
  const finalTotal = total + (guaranteedReserve ? GUARANTEED_RESERVE_FEE : 0)

  const targetLocker = hubLockers.find((l) => l.status === 'disponible') || hubLockers[0]

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!user || items.length === 0) return
    setLoading(true)
    setError('')

    try {
      // 1. Verify stock
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

      // 2. Group by seller
      const groups = new Map<string, typeof items>()
      items.forEach((item) => {
        const current = groups.get(item.seller) ?? []
        groups.set(item.seller, [...current, item])
      })

      const generatedClaimPin = generatePin(4)

      for (const [sellerKey, group] of groups) {
        const orderId = crypto.randomUUID()
        const sId = sellerUserId(sellerKey)
        const sName = displaySeller(sellerKey)

        const orderTotal =
          group.reduce((sum, item) => sum + item.price * item.qty, 0) +
          (guaranteedReserve ? GUARANTEED_RESERVE_FEE : 0)

        const commission = Math.round(orderTotal * PLATFORM_COMMISSION_RATE)
        const netRevenue = orderTotal - commission

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
          pickup: activeHub.name,
          note,
          status: 'listo',
          createdAt: new Date().toISOString(),
          isGuaranteed: guaranteedReserve,
          reserveFee: guaranteedReserve ? GUARANTEED_RESERVE_FEE : 0,
          lockerId: targetLocker?.id || 'lck_d_01',
          lockerHubId: activeHub.id,
          lockerHubName: activeHub.name,
          lockerNumber: targetLocker?.code || 'D-01',
          claimPin: generatedClaimPin,
          paymentMethod,
          paymentStatus: 'pagado',
          platformCommission: commission,
          sellerNetRevenue: netRevenue,
        }

        await saveOrder(order)

        // Assign and prime locker in system
        const primaryProduct = group[0]
        try {
          assignLocker({
            hubId: activeHub.id,
            productId: primaryProduct.productId,
            productName: primaryProduct.name,
            productPrice: primaryProduct.price,
            productImage: primaryProduct.image_url,
            sellerId: sId,
            sellerName: sName,
            buyerId: user.id,
            buyerName: user.name,
            orderId,
            preferredBuilding: (primaryProduct.building as 'D' | 'M' | 'L') || 'D',
            preferredLockerId: targetLocker?.id,
          })
        } catch {
          // Continue if already assigned
        }

        // Send confirmation chat message with digital PIN pass
        const itemsSummary = group.map((i) => `${i.qty}x ${i.name}`).join(', ')
        await sendMessage({
          conversationId: `order_${orderId}`,
          senderId: user.id,
          senderName: user.name,
          recipientId: sId,
          recipientName: sName,
          orderId,
          productName: itemsSummary,
          text: `🎉 ¡Snack Apartado en ${activeHub.name}!\n` +
            `📦 Producto(s): ${itemsSummary}\n` +
            `📍 Casillero #${targetLocker?.code || 'D-01'}\n` +
            `🔑 PIN de Retiro: ${generatedClaimPin}\n` +
            `💵 Total: ${money(orderTotal)} (Comisión Bocado 5%: ${money(commission)} · Neto Vendedor: ${money(netRevenue)})`,
          messageType: 'text',
        })
      }

      await incrementMetric('inventory_updates')
      playPaymentSuccess()
      clear()

      // Redirect directly to orders / claim passes
      navigate('/pedidos')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo procesar el apartado')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm text-muted-foreground">Tu lista de apartados está vacía.</p>
      </div>
    )
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:px-6">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-mono font-bold text-primary mb-2">
          <Sparkles size={13} />
          <span>Generación de Pase Digital & Asignación de Casillero</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-foreground">
          Confirmar Apartados y Generar PIN
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Al confirmar recibirás tu <strong>PIN de 4 dígitos</strong> para retirar sin contacto en los casilleros de los <strong>Edificios D, M o L</strong>.
        </p>
      </div>

      {/* 1. Building / Hub Selector */}
      <div className="rounded-3xl border border-border/80 bg-card/80 p-5 backdrop-blur-md shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Building2 size={14} className="text-primary" />
            1. Selecciona el Edificio de Retiro
          </span>
          <span className="text-xs font-mono text-emerald-400 font-bold">20 Casilleros por Edificio</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {LOCKER_HUBS.map((hub) => {
            const isSel = hub.id === selectedHubId
            const lks = getLockersByHub(hub.id)
            const availableCount = lks.filter((l) => l.status === 'disponible').length

            return (
              <button
                key={hub.id}
                type="button"
                onClick={() => setSelectedHubId(hub.id)}
                className={`rounded-2xl p-4 text-left border transition-all ${
                  isSel
                    ? 'border-primary bg-primary/15 shadow-md shadow-primary/10 ring-1 ring-primary'
                    : 'border-border/70 bg-secondary/30 hover:border-primary/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-display text-sm font-bold text-foreground flex items-center gap-1.5">
                    <span>{hub.icon}</span>
                    {hub.name}
                  </p>
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">{hub.zone}</p>
                <div className="mt-3 flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold">
                  <Boxes size={12} />
                  <span>{availableCount} casilleros libres</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Virtual Payment Method Selector */}
      <div className="rounded-3xl border border-border/80 bg-card/80 p-5 backdrop-blur-md shadow-sm space-y-5">
        <span className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <CreditCard size={14} className="text-primary" />
          2. Método de Pago Virtual para Retiro
        </span>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPaymentMethod('qr_nequi')}
            className={`flex items-center justify-center gap-2 rounded-2xl py-3 px-4 text-xs font-display font-bold border transition-all ${
              paymentMethod === 'qr_nequi'
                ? 'border-primary bg-primary/15 text-primary shadow-sm'
                : 'border-border bg-secondary/30 text-muted-foreground hover:text-foreground'
            }`}
          >
            <QrCode size={16} />
            QR Nequi / Bancolombia
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('tarjeta')}
            className={`flex items-center justify-center gap-2 rounded-2xl py-3 px-4 text-xs font-display font-bold border transition-all ${
              paymentMethod === 'tarjeta'
                ? 'border-primary bg-primary/15 text-primary shadow-sm'
                : 'border-border bg-secondary/30 text-muted-foreground hover:text-foreground'
            }`}
          >
            <CreditCard size={16} />
            Tarjeta Débito / Crédito
          </button>
        </div>

        {paymentMethod === 'qr_nequi' ? (
          <div className="rounded-2xl border border-border/80 bg-zinc-950/80 p-6 text-center space-y-3">
            <p className="text-xs text-muted-foreground">
              Al retirar en la vitrina del <strong>{activeHub.name}</strong>, escanearás el QR en pantalla para pagar con <strong>Nequi</strong> o <strong>Bancolombia</strong>.
            </p>
            <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-2xl border-2 border-dashed border-emerald-500/50 bg-white p-2 shadow-xl">
              <div className="h-full w-full bg-slate-900 rounded-lg flex flex-col items-center justify-center text-white p-2">
                <QrCode size={72} className="text-emerald-400 animate-pulse" />
                <span className="mt-1 text-[8px] font-mono text-zinc-300">PAGO CASILLERO ICESI</span>
              </div>
            </div>
            <p className="font-mono text-xs text-emerald-400 font-bold">
              Monto a Transferir: {money(finalTotal)}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-tr from-slate-900 via-indigo-950 to-emerald-950 p-5 text-white shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs tracking-widest text-emerald-300 font-bold">BOCADO PASS</span>
                <span className="font-display text-xs font-bold opacity-80">CAMPUS ICESI</span>
              </div>
              <p className="font-mono text-base tracking-widest sm:text-lg my-4">{cardNumber}</p>
              <div className="flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-[9px] uppercase text-zinc-400 block">Titular</span>
                  <span className="font-semibold">{cardHolder}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-zinc-400 block">Expira</span>
                  <span className="font-semibold">{cardExp}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="col-span-2">
                <label className={labelClass}>Número de Tarjeta</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Vencimiento</label>
                <input
                  type="text"
                  value={cardExp}
                  onChange={(e) => setCardExp(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>CVV</label>
                <input
                  type="password"
                  maxLength={4}
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Snacks & Order Summary */}
      <div className="rounded-3xl border border-border/80 bg-card/80 p-5 backdrop-blur-md shadow-sm space-y-3">
        <span className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
          Resumen de Apartados ({items.length})
        </span>
        <ul className="space-y-2 text-sm divide-y divide-border/40">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between items-center pt-2 first:pt-0">
              <div className="flex items-center gap-3">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-10 w-10 rounded-xl object-cover border border-border"
                  />
                )}
                <div>
                  <span className="font-medium text-foreground text-xs sm:text-sm">{item.name}</span>
                  <p className="text-[11px] text-muted-foreground">Cocinero: {displaySeller(item.seller)}</p>
                </div>
              </div>
              <span className="font-mono font-bold text-primary text-xs sm:text-sm">
                {item.qty} × {money(item.price)}
              </span>
            </li>
          ))}
        </ul>

        {/* Protection */}
        <div className="pt-3 border-t border-border/60">
          <label className="flex items-start gap-3 rounded-2xl bg-secondary/50 p-3.5 cursor-pointer hover:bg-secondary/70 transition-colors">
            <input
              type="checkbox"
              checked={guaranteedReserve}
              onChange={(e) => setGuaranteedReserve(e.target.checked)}
              className="mt-1 rounded text-primary focus:ring-primary h-4 w-4"
            />
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between font-display font-semibold text-foreground">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={14} className="text-primary" /> Mantenimiento & Sensor de Casillero
                </span>
                <span className="text-primary font-bold">+{money(GUARANTEED_RESERVE_FEE)}</span>
              </div>
              <p className="mt-1 text-muted-foreground leading-relaxed text-[11px]">
                Garantiza compartimento con ventilación o refrigeración activa para conservar tu snack fresco.
              </p>
            </div>
          </label>
        </div>

        <div className="pt-3 flex justify-between items-baseline border-t border-border font-display">
          <span className="text-sm font-semibold text-foreground">Total a pagar al retirar:</span>
          <span className="text-2xl font-black text-primary">{money(finalTotal)}</span>
        </div>
      </div>

      {error && <p className="rounded-2xl bg-destructive/10 p-3 text-xs text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-gradient-to-r from-primary to-amber-500 py-4 font-display text-sm font-extrabold text-primary-foreground shadow-xl shadow-primary/25 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          'Confirmando apartado y asignando casillero...'
        ) : (
          <>
            <Lock size={16} />
            Confirmar Apartado en {activeHub.name} & Obtener PIN
          </>
        )}
      </button>
    </form>
  )
}
