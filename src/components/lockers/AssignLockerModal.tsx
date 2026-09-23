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
  accentColor: string
}[] = [
  {
    code: 'D',
    name: 'Edificio D',
    zone: 'Plazoleta Central · Piso 1',
    icon: '⚡',
    accentColor: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-400',
  },
  {
    code: 'M',
    name: 'Edificio M',
    zone: 'Hall de Aulas y Labs · Piso 1',
    icon: '🏛️',
    accentColor: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/40 text-cyan-400',
  },
  {
    code: 'L',
    name: 'Edificio L',
    zone: 'Zona de Estudios 24/7 · Piso 1',
    icon: '🌿',
    accentColor: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-400',
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
        {/* Top accent glow */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-emerald-400 to-cyan-400" />

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
                <span className="text-emerald-400 font-bold">
                  Neto a recibir: {money(netRevenue)} <span className="text-zinc-500 font-normal">(5% comisión: -{money(commission)})</span>
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
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-rose-500/15 text-rose-400'
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
              <div className="rounded-xl bg-rose-500/15 border border-rose-500/30 p-2.5 text-xs text-rose-400 font-mono">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-border bg-secondary/80 py-2.5 text-xs font-display font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleAssign()}
                disabled={loading}
                className="flex-[2] flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-display font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110 disabled:opacity-50 transition-all"
              >
                <Sparkles size={14} />
                <span>{loading ? 'Asignando casillero...' : 'Asignar Automáticamente'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Success Screen */
          <div className="space-y-4 text-center py-2 animate-fadeIn">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 ring-4 ring-emerald-500/10">
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
            <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-4 space-y-3 text-left">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Zap size={14} /> TU PIN DE DEPÓSITO
                </span>
                <span className="rounded-md bg-secondary px-2 py-0.5 text-foreground font-bold">
                  {result.locker.hubName} · Casillero #{result.locker.number}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-black/60 p-3 border border-white/10">
                <span className="font-mono text-2xl font-black tracking-widest text-amber-400">
                  {result.depositPin}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(result.depositPin)}
                  className="flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1.5 text-xs font-mono font-medium text-foreground hover:bg-secondary/80 transition-colors"
                >
                  <Copy size={13} />
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>

              <div className="space-y-1 text-[11px] text-muted-foreground font-mono">
                <p>
                  📍 <strong>Instrucciones:</strong> Ve al {result.locker.hubName}, digita{' '}
                  <strong className="text-amber-400">{result.depositPin}</strong> en la vitrina para abrir la compuerta #{result.locker.number} y guarda el pedido.
                </p>
                <p>
                  🔑 <strong>PIN del comprador:</strong> {result.claimPin} (enviado a {order.buyerName} por chat).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-primary py-2.5 text-xs font-display font-bold text-primary-foreground shadow-md hover:brightness-110 transition-all"
            >
              Listo, entendido
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
