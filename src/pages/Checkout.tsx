import {
  AlertCircle,
  Bike,
  Building2,
  CheckCircle2,
  CreditCard,
  Lock,
  MapPin,
  QrCode,
  Receipt,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { PageTransition } from '../components/PageTransition'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { fetchProduct, incrementMetric, updateProduct } from '../lib/api'
import { PICKUP_POINTS } from '../lib/constants'
import { displaySeller, money } from '../lib/format'
import { computeOrderFinancials } from '../lib/pricing'
import { playPaymentSuccess } from '../lib/sounds'
import { saveOrder } from '../lib/storage-db'
import { openWompiCheckout } from '../lib/wompi'
import type { Order, PaymentMethod } from '../types'

export function CheckoutPage() {
  const { user } = useAuth()
  const { items, clear } = useCart()
  const { bonus } = useToast()

  // Campus location state
  const [selectedBuilding, setSelectedBuilding] = useState<string>(
    PICKUP_POINTS[0] || 'Edificio D (Plazoleta / Pisos)'
  )
  const [roomDetail, setRoomDetail] = useState('')
  const [note, setNote] = useState('')

  // Payment gateway state (Wompi como pasarela principal)
  const [gatewayMethod, setGatewayMethod] = useState<'wompi' | 'nequi' | 'daviplata' | 'pse' | 'tarjeta'>('wompi')
  const [gatewayPhone, setGatewayPhone] = useState('318 520 3344')
  const [gatewayBank, setGatewayBank] = useState('Bancolombia')
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8842')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [completedOrder, setCompletedOrder] = useState<{
    id: string
    transactionId: string
    total: number
    location: string
    financials: ReturnType<typeof computeOrderFinancials>
  } | null>(null)

  // Overall cart financials con cálculo dinámico de tarifa por distancia
  const financials = computeOrderFinancials(
    items.map((i) => ({ price: i.price, qty: i.qty })),
    { origin: 'Edificio D', destination: selectedBuilding }
  )

  const handleProcessPayment = async (e: FormEvent) => {
    e.preventDefault()
    if (!user || items.length === 0) return
    setError('')
    setLoading(true)

    try {
      // 1. Verify stock for each item
      for (const item of items) {
        const product = await fetchProduct(item.productId)
        if (!product || product.sold_out || product.stock < item.qty) {
          throw new Error(`Lo sentimos, ya no hay suficiente stock de "${item.name}".`)
        }
        const newStock = product.stock - item.qty
        await updateProduct(item.productId, {
          stock: newStock,
          sold_out: newStock === 0,
          intent_count: product.intent_count,
        })
      }

      // Procesamiento con pasarela Wompi o simulación de otros métodos
      let transactionId = ''
      if (gatewayMethod === 'wompi') {
        const wompiRes = await openWompiCheckout({
          amountInPesos: financials.totalBuyerPays,
          reference: `BOC-${Date.now().toString().slice(-6)}-WMP`,
          customerEmail: user.email,
          customerName: user.name,
        })
        if (wompiRes.status === 'DECLINED' || wompiRes.status === 'ERROR') {
          throw new Error('La transacción en Wompi fue cancelada o rechazada.')
        }
        transactionId = wompiRes.id || wompiRes.reference
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        transactionId = `BOC-${Math.floor(100000 + Math.random() * 900000)}-TX`
      }

      // 2. Group items by seller
      const groups = new Map<string, typeof items>()
      items.forEach((item) => {
        const current = groups.get(item.seller) ?? []
        groups.set(item.seller, [...current, item])
      })

      const fullDeliveryLocation = roomDetail.trim()
        ? `${selectedBuilding} · ${roomDetail.trim()}`
        : selectedBuilding

      let firstOrderId = ''

      // 3. Create orders (one per seller) with transparent split financials
      for (const [sellerKey, group] of groups) {
        const orderId = crypto.randomUUID()
        if (!firstOrderId) firstOrderId = orderId
        const sName = displaySeller(sellerKey)

        const groupFinancials = computeOrderFinancials(
          group.map((i) => ({ price: i.price, qty: i.qty })),
          { origin: 'Edificio D', destination: selectedBuilding }
        )

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
          total: groupFinancials.totalBuyerPays,
          pickup: `Edificio de ${sName}`,
          deliveryLocation: fullDeliveryLocation,
          deliveryFee: groupFinancials.deliveryFee,
          note,
          status: 'solicitado',
          createdAt: new Date().toISOString(),
          paymentMethod: (gatewayMethod === 'wompi' ? 'wompi' : gatewayMethod === 'tarjeta' ? 'tarjeta' : 'qr_nequi') as PaymentMethod,
          paymentStatus: 'pagado',
          platformCommission: groupFinancials.bocadoCommission,
          sellerNetRevenue: groupFinancials.vendorPayout,
          buyerBuilding: fullDeliveryLocation,
          sellerBuilding: 'Pendiente de confirmación por el vendedor',
          sellerBuildingConfirmed: false,
          bocadoCommission: groupFinancials.bocadoCommission,
          vendorPayout: groupFinancials.vendorPayout,
          tendederoPayout: groupFinancials.tendederoReimbursementAndFee,
          transactionId,
          tendederoConfirmed: false,
          buyerConfirmed: false,
          sellerPaidConfirmed: false,
        }

        await saveOrder(order)
      }

      await incrementMetric('inventory_updates')
      playPaymentSuccess()
      bonus('¡Pago Aprobado con Éxito!', `Transacción ${transactionId} liquidada. Buscando Tendedero en el campus.`)
      clear()

      setCompletedOrder({
        id: firstOrderId,
        transactionId,
        total: financials.totalBuyerPays,
        location: fullDeliveryLocation,
        financials,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pago con la pasarela')
    } finally {
      setLoading(false)
    }
  }

  // Confirmation view after approved payment
  if (completedOrder) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-xl px-4 py-12 space-y-6">
          <div className="rounded-3xl border border-emerald-300 dark:border-emerald-800 bg-card p-6 sm:p-8 shadow-xl text-center space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shadow-md">
              <CheckCircle2 size={40} />
            </div>

            <div className="space-y-1">
              <span className="inline-block rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
                Transacción Aprobada · {completedOrder.transactionId}
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">
                ¡Tu pedido está en camino!
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                El pago se dividió exitosamente según el modelo de liquidación Bocado.
              </p>
            </div>

            {/* Comprobante de División de Fondos Transparente */}
            <div className="rounded-2xl bg-secondary/80 p-4 text-xs text-left space-y-2 border border-border">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Comprobante de Liquidación Digital:
              </span>

              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">Punto de Entrega (Comprador):</span>
                <span className="font-bold text-foreground truncate max-w-[220px]">{completedOrder.location}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-border/60">
                <span>👨‍🍳 Al Vendedor (Costo Producto):</span>
                <span className="font-mono font-semibold text-foreground">
                  {money(completedOrder.financials.vendorPayout)}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-border/60">
                <span>🛵 Al Tendedero (Envío + Adelanto):</span>
                <span className="font-mono font-semibold text-emerald-600">
                  {money(completedOrder.financials.tendederoReimbursementAndFee)}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-border/60 text-[11px] text-muted-foreground">
                <span>🏢 Comisión Plataforma Bocado:</span>
                <span className="font-mono">{money(completedOrder.financials.bocadoCommission)} COP</span>
              </div>

              <div className="flex justify-between pt-2 font-display text-sm font-bold text-foreground">
                <span>Total debitado:</span>
                <span className="font-mono text-primary font-black">{money(completedOrder.total)}</span>
              </div>
            </div>

            <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3 text-xs text-amber-800 dark:text-amber-200 text-left flex items-center gap-2">
              <Building2 size={16} className="text-amber-600 shrink-0" />
              <span>
                Se ha notificado al vendedor para que confirme en qué edificio se encuentra para la recogida del Tendedero.
              </span>
            </div>

            <Link
              to="/pedidos"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-[#751010] py-4 text-xs sm:text-sm font-display font-bold text-white shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Receipt size={16} />
              <span>Ver Estado en Mis Pedidos</span>
            </Link>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-black text-foreground sm:text-3xl">
            Confirmación de Pedido & Pasarela de Pago
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Ingresa tu ubicación exacta en el campus y procesa tu pago mediante nuestra pasarela en línea segura.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-xs font-semibold text-destructive flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={(e) => void handleProcessPayment(e)} className="grid gap-8 lg:grid-cols-3">
          {/* Columna Izquierda: Ubicación y Pasarela */}
          <div className="space-y-6 lg:col-span-2">
            {/* 1. Ubicación en Campus */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-primary">
                <MapPin size={16} />
                <span>1. ¿En qué edificio te encuentras para la entrega?</span>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Edificio principal del campus
                </label>
                <select
                  value={selectedBuilding}
                  onChange={(e) => setSelectedBuilding(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-secondary/50 px-3.5 py-3 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                >
                  {PICKUP_POINTS.map((spot) => (
                    <option key={spot} value={spot}>
                      {spot}
                    </option>
                  ))}
                  <option value="Biblioteca Central - Sala de Estudio">Biblioteca Central - Sala de Estudio</option>
                  <option value="Edificio E (Ingeniería) - Aulas">Edificio E (Ingeniería) - Aulas</option>
                  <option value="Edificio D - Plazoleta Central">Edificio D - Plazoleta Central</option>
                  <option value="El Samán - Bancas Verdes">El Samán - Bancas Verdes</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Detalle específico (Piso, aula o mesa)
                </label>
                <input
                  type="text"
                  value={roomDetail}
                  onChange={(e) => setRoomDetail(e.target.value)}
                  placeholder="Ej: Piso 3, aula 302 / junto a la ventana"
                  className="w-full rounded-2xl border border-border bg-secondary/50 px-3.5 py-3 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Instrucción adicional para el Tendedero (Opcional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ej: Tengo camisa roja, avísame al llegar"
                  className="w-full rounded-2xl border border-border bg-secondary/50 px-3.5 py-3 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* 2. Pasarela de Pagos Real */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-primary">
                  <Lock size={16} />
                  <span>2. Pasarela de Pago Digital Bocado (TLS 256-bit)</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md font-bold">
                  Split Payment Automático
                </span>
              </div>

              {/* Pestañas de Métodos con Wompi Oficial */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button
                  type="button"
                  onClick={() => setGatewayMethod('wompi')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-display font-bold transition-all cursor-pointer col-span-2 sm:col-span-1 ${
                    gatewayMethod === 'wompi'
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-xs ring-1 ring-emerald-500'
                      : 'border-border bg-secondary/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <CreditCard size={18} className="mb-1 text-emerald-600 dark:text-emerald-400" />
                  <span>Wompi</span>
                  <span className="text-[9px] font-mono opacity-80">Bancolombia</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGatewayMethod('nequi')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-display font-bold transition-all cursor-pointer ${
                    gatewayMethod === 'nequi'
                      ? 'border-primary bg-primary/10 text-primary shadow-xs'
                      : 'border-border bg-secondary/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Smartphone size={18} className="mb-1" />
                  <span>Nequi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGatewayMethod('daviplata')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-display font-bold transition-all cursor-pointer ${
                    gatewayMethod === 'daviplata'
                      ? 'border-red-500 bg-red-500/10 text-red-600 shadow-xs'
                      : 'border-border bg-secondary/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Smartphone size={18} className="mb-1 text-red-600" />
                  <span>Daviplata</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGatewayMethod('pse')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-display font-bold transition-all cursor-pointer ${
                    gatewayMethod === 'pse'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-600 shadow-xs'
                      : 'border-border bg-secondary/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <QrCode size={18} className="mb-1 text-blue-600" />
                  <span>PSE</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGatewayMethod('tarjeta')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-display font-bold transition-all cursor-pointer ${
                    gatewayMethod === 'tarjeta'
                      ? 'border-primary bg-primary/10 text-primary shadow-xs'
                      : 'border-border bg-secondary/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <CreditCard size={18} className="mb-1" />
                  <span>Tarjeta</span>
                </button>
              </div>

              {/* Formulario según el método seleccionado */}
              <div className="rounded-2xl bg-secondary/60 p-4 border border-border/60 space-y-3">
                {gatewayMethod === 'wompi' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-sm text-foreground">
                          Pasarela Oficial Wompi (Bancolombia)
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                          Sandbox / Live
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Wompi procesa pagos de forma segura y centralizada. Al pulsar el botón inferior se desplegará el Widget oficial para pagar mediante:
                    </p>
                    <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                      <span className="rounded-lg bg-card px-2.5 py-1 border border-border">✓ Bancolombia App</span>
                      <span className="rounded-lg bg-card px-2.5 py-1 border border-border">✓ Nequi</span>
                      <span className="rounded-lg bg-card px-2.5 py-1 border border-border">✓ PSE (Todos los bancos)</span>
                      <span className="rounded-lg bg-card px-2.5 py-1 border border-border">✓ Visa / Mastercard</span>
                    </div>
                  </div>
                )}

                {gatewayMethod === 'nequi' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground block">
                      Número de Teléfono Nequi
                    </label>
                    <input
                      type="tel"
                      value={gatewayPhone}
                      onChange={(e) => setGatewayPhone(e.target.value)}
                      placeholder="318 000 0000"
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs font-mono font-bold text-foreground outline-none"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Recibirás una notificación push directa en tu App de Nequi para autorizar el debito.
                    </p>
                  </div>
                )}

                {gatewayMethod === 'daviplata' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground block">
                      Número de Celular Daviplata
                    </label>
                    <input
                      type="tel"
                      value={gatewayPhone}
                      onChange={(e) => setGatewayPhone(e.target.value)}
                      placeholder="300 000 0000"
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs font-mono font-bold text-foreground outline-none"
                    />
                  </div>
                )}

                {gatewayMethod === 'pse' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground block">
                      Selecciona tu Banco (PSE)
                    </label>
                    <select
                      value={gatewayBank}
                      onChange={(e) => setGatewayBank(e.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground outline-none"
                    >
                      <option value="Bancolombia">Bancolombia</option>
                      <option value="Davivienda">Davivienda</option>
                      <option value="Nu Colombia">Nu Colombia</option>
                      <option value="Lulo Bank">Lulo Bank</option>
                      <option value="Banco de Bogotá">Banco de Bogotá</option>
                    </select>
                  </div>
                )}

                {gatewayMethod === 'tarjeta' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground block">
                      Número de Tarjeta Débito/Crédito
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4532 0000 0000 0000"
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs font-mono font-bold text-foreground outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Desglose Contable de División de Fondos */}
          <aside className="h-fit space-y-4 rounded-3xl border border-border bg-card p-6 shadow-xl">
            <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>División de Fondos Transparente</span>
            </h2>

            <div className="space-y-2.5 border-y border-border py-4 text-xs font-mono">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal Snacks:</span>
                <span className="font-bold text-foreground">{money(financials.itemsSubtotal)}</span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span className="flex items-center gap-1 text-primary">
                  <Bike size={12} /> Domicilio por distancia:
                </span>
                <span className="font-bold text-emerald-600 font-mono">
                  +{money(financials.deliveryFee)} COP
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Comisión Servicio Bocado:</span>
                <span>{money(financials.bocadoCommission)} COP</span>
              </div>

              {/* Explicación del modelo de pago al vendedor y al tendedero */}
              <div className="rounded-xl bg-secondary/80 p-3 text-[11px] space-y-1 font-sans text-muted-foreground border border-border/40">
                <strong className="block text-foreground font-bold font-mono text-[10px] uppercase">
                  Distribución transparente:
                </strong>
                <p>• <strong>{money(financials.vendorPayout)}</strong> van al Vendedor por sus preparaciones.</p>
                <p>• <strong>+{money(financials.deliveryFee)} COP</strong> ganancia directa para el Tendedero.</p>
                <p>• <strong>{money(financials.bocadoCommission)} COP</strong> comisión de plataforma Bocado.</p>
              </div>
            </div>

            <div className="flex items-baseline justify-between pt-1 font-display">
              <span className="text-sm font-semibold text-muted-foreground">Total a Pagar:</span>
              <span className="text-2xl font-black text-primary">{money(financials.totalBuyerPays)}</span>
            </div>

            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-[#751010] py-4 text-center font-display text-xs sm:text-sm font-extrabold text-white shadow-md active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
            >
              {loading ? (
                <span>Procesando pago seguro...</span>
              ) : (
                <>
                  <Lock size={15} />
                  <span>Pagar {money(financials.totalBuyerPays)} en Línea</span>
                </>
              )}
            </button>
          </aside>
        </form>
      </div>
    </PageTransition>
  )
}
