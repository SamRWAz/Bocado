import {
  CheckCircle2,
  Copy,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { autoAssignLockerForSellerOrder, getLockersByBuilding } from '../../lib/lockers'
import { money } from '../../lib/format'
import { playKeyBeep, playPaymentSuccess } from '../../lib/sounds'
import type { Locker, Order } from '../../types'

type BuildingCode = 'D' | 'M' | 'L'

interface AssignLockerModalProps {
  order: Order
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedOrder: Order, locker: Locker) => void
}

const BUILDINGS: {
  code: BuildingCode
  name: string
  zone: string
  icon: string
}[] = [
  {
    code: 'D',
    name: 'Edificio D',
    zone: 'Plazoleta Central · Piso 1',
    icon: '⚡',
  },
  {
    code: 'M',
    name: 'Edificio M',
    zone: 'Hall de Aulas y Labs · Piso 1',
    icon: '🏛️',
  },
  {
    code: 'L',
    name: 'Edificio L',
    zone: 'Zona de Estudios 24/7 · Piso 1',
    icon: '🌿',
  },
]

export function AssignLockerModal({
  order,
  isOpen,
  onClose,
  onSuccess,
}: AssignLockerModalProps) {
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingCode>('D')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    locker: Locker
    depositPin: string
    claimPin: string
  } | null>(null)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleAssign = async () => {
    setLoading(true)
    setError(null)
    playKeyBeep(600)
    try {
      const res = await autoAssignLockerForSellerOrder({
        order,
        building: selectedBuilding,
      })
      playPaymentSuccess()
      setResult({
        locker: res.locker,
        depositPin: res.depositPin,
        claimPin: res.claimPin,
      })
      onSuccess(res.updatedOrder, res.locker)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al asignar casillero')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    playKeyBeep(880)
    void navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const commission = order.platformCommission || Math.round(order.total * 0.05)
  const netRevenue = order.sellerNetRevenue || order.total - commission

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 shadow-2xl overflow-hidden">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8F1414]" />

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <X size={18} />
        </button>

        {!result ? (
          <div className="space-y-5">
            {/* Header */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-primary">
                <Zap size={14} />
                <span>Asignación Automática de Vitrina</span>
              </div>
              <h2 className="mt-1 font-display text-xl font-black text-foreground">
                Asignar Casillero a la Venta
              </h2>
              <p className="text-xs text-muted-foreground">
                Elige en qué edificio vas a dejar el producto y el sistema reservará el casillero libre de inmediato.
              </p>
            </div>

            {/* Order Summary Card */}
            <div className="rounded-2xl border border-border/60 bg-secondary/30 p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center font-mono">
                <span className="text-muted-foreground">Comprador:</span>
                <span className="font-bold text-foreground">{order.buyerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Productos:</span>
                <span className="font-medium text-foreground truncate max-w-[240px]">
                  {order.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-border/40 font-mono text-[11px]">
                <span className="text-muted-foreground">Total Venta: <strong>{money(order.total)}</strong></span>
                <span className="text-primary font-bold">
                  Neto a recibir: {money(netRevenue)} <span className="text-muted-foreground font-normal">(5% comisión: -{money(commission)})</span>
                </span>
              </div>
            </div>

            {/* Question: Building Selector */}
            <div className="space-y-2.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                ¿En qué edificio vas a depositar el producto?
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {BUILDINGS.map((b) => {
                  const availableCount = getLockersByBuilding(b.code).filter(
                    (l) => l.status === 'disponible',
                  ).length
                  const isSelected = selectedBuilding === b.code

                  return (
                    <button
                      key={b.code}
                      type="button"
                      onClick={() => {
                        playKeyBeep(520)
                        setSelectedBuilding(b.code)
                      }}
                      className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all relative ${
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary/40'
                          : 'border-border bg-card/60 hover:border-border hover:bg-secondary/40'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-base">{b.icon}</span>
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                            availableCount > 0
                              ? 'bg-primary/15 text-primary'
                              : 'bg-secondary text-muted-foreground'
                          }`}
                        >
                          {availableCount}/20 libres
                        </span>
                      </div>
                      <span className="font-display font-bold text-sm text-foreground">
                        {b.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                        {b.zone}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-destructive/15 border border-destructive/30 p-2.5 text-xs text-destructive font-mono">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-border bg-secondary/80 py-2.5 text-xs font-display font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleAssign()}
                disabled={loading}
                className="flex-[2] flex items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-[#751010] py-2.5 text-xs font-display font-bold text-white shadow-md disabled:opacity-50 transition-all cursor-pointer"
              >
                <Sparkles size={14} />
                <span>{loading ? 'Asignando casillero...' : 'Asignar Automáticamente'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Success Screen */
          <div className="space-y-4 text-center py-2 animate-fadeIn">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 text-primary ring-4 ring-primary/10">
              <CheckCircle2 size={32} />
            </div>

            <div>
              <h2 className="font-display text-xl font-black text-foreground">
                ¡Casillero Asignado con Éxito!
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Se ha reservado el casillero para tu entrega. El comprador ha sido notificado por chat.
              </p>
            </div>

            {/* Deposit Box Card */}
            <div className="rounded-2xl border-2 border-border bg-card p-5 space-y-4 text-left shadow-sm">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <span className="text-foreground font-black text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Zap size={15} className="text-[#8F1414]" /> TU PIN DE DEPÓSITO
                </span>
                <span className="rounded-xl bg-[#8F1414] text-white px-3 py-1 text-xs font-bold font-mono shadow-xs">
                  {result.locker.hubName} · Casillero #{result.locker.number}
                </span>
              </div>

              {/* PIN Big Box */}
              <div className="flex items-center justify-between rounded-2xl bg-[#1C1917] dark:bg-black p-4 border border-border shadow-inner">
                <span className="font-mono text-3xl font-black tracking-widest text-[#FAF6F0]">
                  {result.depositPin}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(result.depositPin)}
                  className="flex items-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 px-3 py-2 text-xs font-mono font-bold text-white transition-colors cursor-pointer"
                >
                  <Copy size={14} />
                  <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              {/* High Contrast Instructions Box */}
              <div className="rounded-2xl bg-secondary/80 border border-border p-4 space-y-2.5 text-xs text-foreground font-sans leading-relaxed">
                <p>
                  <strong>📍 Instrucciones:</strong> Ve al <strong>{result.locker.hubName}</strong>, digita el PIN{' '}
                  <strong className="text-[#8F1414] dark:text-red-300 font-mono px-1.5 py-0.5 bg-card rounded border border-border">
                    {result.depositPin}
                  </strong>{' '}
                  en la vitrina para abrir la compuerta <strong>#{result.locker.number}</strong> y guarda el pedido.
                </p>
                <p className="border-t border-border/60 pt-2 text-foreground/90">
                  <strong>🔑 PIN del comprador:</strong>{' '}
                  <span className="font-mono font-bold text-foreground px-1.5 py-0.5 bg-card rounded border border-border">
                    {result.claimPin}
                  </span>{' '}
                  (enviado automáticamente a <strong>{order.buyerName}</strong> por chat).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-2xl bg-[#8F1414] hover:bg-[#751010] py-3 font-display text-sm font-bold text-white shadow-md transition-all cursor-pointer"
            >
              Listo, entendido
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
