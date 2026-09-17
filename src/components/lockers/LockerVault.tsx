import {
  ChevronRight,
  KeyRound,
  Lock,
  LockOpen,
  PackageCheck,
  ShoppingBag,
  Sparkles,
  Thermometer,
  Zap,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  closeAndResetLocker,
  getLockerHubs,
  getLockersByHub,
  subscribeToLockerUpdates,
} from '../../lib/lockers'
import { playPaymentSuccess } from '../../lib/sounds'
import type { Locker } from '../../types'
import { money } from '../../lib/format'

type Props = {
  selectedHubId?: string
  onSelectHub?: (hubId: string) => void
  onOpenKeypad?: () => void
  highlightLockerCode?: string
  onSelectLocker?: (locker: Locker) => void
  onUnlockLocker?: (locker: Locker) => void
}

export function LockerVault({
  selectedHubId = 'hub_edificio_d',
  onSelectHub,
  onOpenKeypad,
  highlightLockerCode,
  onSelectLocker,
  onUnlockLocker: _onUnlockLocker,
}: Props) {
  const hubs = getLockerHubs()
  const [activeHubId, setActiveHubId] = useState(selectedHubId)
  const [lockers, setLockers] = useState<Locker[]>([])
  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null)
  const [celebratingLockerId, setCelebratingLockerId] = useState<string | null>(null)

  const currentHub = hubs.find((h) => h.id === activeHubId) ?? hubs[0]

  const loadHubLockers = () => {
    const list = getLockersByHub(activeHubId)
    setLockers(list)
  }

  useEffect(() => {
    loadHubLockers()
    const unsubscribe = subscribeToLockerUpdates(() => {
      loadHubLockers()
    })
    return () => unsubscribe()
  }, [activeHubId])

  const handleHubChange = (id: string) => {
    setActiveHubId(id)
    if (onSelectHub) onSelectHub(id)
  }

  const handleRetrieveSnack = (locker: Locker) => {
    playPaymentSuccess()
    setCelebratingLockerId(locker.id)
    setTimeout(() => {
      closeAndResetLocker(locker.id)
      setCelebratingLockerId(null)
      setSelectedLocker(null)
    }, 2800)
  }

  // Count stats
  const availableCount = lockers.filter((l) => l.status === 'disponible').length
  const readyCount = lockers.filter((l) => l.status === 'listo_para_retiro').length

  return (
    <div className="space-y-6">
      {/* Hub Selector Tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {hubs.map((hub) => {
            const isActive = hub.id === activeHubId
            return (
              <button
                key={hub.id}
                type="button"
                onClick={() => handleHubChange(hub.id)}
                className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-display font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-102'
                    : 'border-border/80 bg-card/80 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-secondary'
                }`}
              >
                <span>{hub.icon}</span>
                <span>{hub.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    isActive ? 'bg-black/30 text-white' : 'bg-secondary text-foreground'
                  }`}
                >
                  {hub.totalLockers} casilleros
                </span>
              </button>
            )
          })}
        </div>

        {onOpenKeypad && (
          <button
            type="button"
            onClick={onOpenKeypad}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-amber-500 px-4 py-2.5 font-display text-xs font-extrabold text-primary-foreground shadow-md transition-transform hover:opacity-90 active:scale-95 self-start sm:self-auto"
          >
            <KeyRound size={15} />
            <span>Digitar PIN / Abrir</span>
          </button>
        )}
      </div>

      {/* Hub Info Banner */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card/60 p-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-xl text-primary">
            {currentHub.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base font-bold text-foreground">{currentHub.name}</h2>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" /> En línea 24/7
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{currentHub.zone} · {currentHub.detail}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 led-glow-emerald" />
            <span>{availableCount} Disponibles</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span className="h-2 w-2 rounded-full bg-cyan-500 led-glow-cyan" />
            <span>{readyCount} Listos para retiro</span>
          </div>
        </div>
      </div>

      {/* 3D Physical Locker Kiosk Grid */}
      <div className="rounded-3xl border-2 border-border/90 bg-gradient-to-b from-card/90 via-card/70 to-card/90 p-5 shadow-2xl backdrop-blur-xl locker-vault-perspective">
        <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-primary" />
            <span className="font-display text-xs font-extrabold uppercase tracking-wider text-foreground">
              Vitrina Física Inteligente · Matriz de Casilleros
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Toca un casillero para ver su contenido o ingresar código
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {lockers.map((locker) => {
            const isOpen = locker.status === 'abierto'
            const isReady = locker.status === 'listo_para_retiro'
            const isWaiting = locker.status === 'esperando_deposito'
            const isHighlighted = highlightLockerCode && locker.code === highlightLockerCode

            return (
              <div
                key={locker.id}
                onClick={() => {
                  setSelectedLocker(locker)
                  if (onSelectLocker) onSelectLocker(locker)
                }}
                className={`group relative flex flex-col justify-between rounded-2xl border-2 p-4 transition-all duration-300 cursor-pointer overflow-hidden min-h-[190px] ${
                  isOpen
                    ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                    : isReady
                    ? 'border-cyan-500/50 bg-cyan-950/20 hover:border-cyan-400 shadow-md'
                    : isWaiting
                    ? 'border-amber-500/50 bg-amber-950/20 hover:border-amber-400'
                    : 'border-border/80 bg-secondary/30 hover:border-emerald-500/50 hover:bg-secondary/50'
                } ${isHighlighted ? 'ring-2 ring-primary animate-pulse' : ''}`}
              >
                {/* Top Status Bar with LED & Code */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black tracking-wider text-foreground">
                    #{locker.code}
                  </span>

                  {/* LED Indicator Light */}
                  <div className="flex items-center gap-1.5">
                    {locker.tempType === 'refrigerado' && (
                      <span className="rounded-full bg-cyan-500/15 p-1 text-cyan-400 text-[10px]" title="Climatizado / Refrigerado">
                        <Thermometer size={11} />
                      </span>
                    )}
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        isOpen
                          ? 'bg-primary led-glow-primary'
                          : isReady
                          ? 'bg-cyan-400 led-glow-cyan'
                          : isWaiting
                          ? 'bg-amber-400 led-glow-amber'
                          : 'bg-emerald-400 led-glow-emerald'
                      }`}
                    />
                  </div>
                </div>

                {/* Locker Content / Food Preview */}
                <div className="my-2 flex flex-1 flex-col items-center justify-center text-center">
                  {isOpen ? (
                    <div className="animate-in fade-in zoom-in-95 space-y-1">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                        <LockOpen size={22} className="animate-bounce" />
                      </div>
                      <p className="font-display text-xs font-extrabold text-primary">¡Casillero Abierto!</p>
                      {locker.productName && (
                        <p className="text-[11px] font-semibold text-foreground line-clamp-1">{locker.productName}</p>
                      )}
                    </div>
                  ) : isReady ? (
                    <div className="space-y-1">
                      {locker.productImage ? (
                        <img
                          src={locker.productImage}
                          alt={locker.productName ?? 'Snack'}
                          className="mx-auto h-12 w-12 rounded-xl object-cover shadow-sm border border-cyan-500/30"
                        />
                      ) : (
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
                          <ShoppingBag size={20} />
                        </div>
                      )}
                      <p className="font-display text-xs font-bold text-foreground line-clamp-1">{locker.productName}</p>
                      <p className="text-[10px] font-extrabold text-cyan-400">{locker.productPrice ? money(locker.productPrice) : ''}</p>
                    </div>
                  ) : isWaiting ? (
                    <div className="space-y-1 text-amber-400">
                      <PackageCheck size={24} className="mx-auto opacity-75 animate-pulse" />
                      <p className="font-display text-[11px] font-bold">Esperando depósito</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{locker.productName || 'Snack reservado'}</p>
                    </div>
                  ) : (
                    <div className="space-y-1 text-muted-foreground/60">
                      <Lock size={22} className="mx-auto opacity-40 group-hover:text-emerald-400 transition-colors" />
                      <p className="font-display text-[11px] font-bold text-muted-foreground">Casillero Libre</p>
                      <span className="text-[9px] text-emerald-400 font-semibold block">Listo para guardar</span>
                    </div>
                  )}
                </div>

                {/* Bottom Action / Pin Helper */}
                <div className="mt-1 border-t border-border/40 pt-2 flex items-center justify-between text-[10px]">
                  {isOpen ? (
                    <span className="text-primary font-bold">Puerta destrabada</span>
                  ) : isReady ? (
                    <span className="text-cyan-400 font-bold flex items-center gap-1">
                      <KeyRound size={10} /> PIN requerido
                    </span>
                  ) : isWaiting ? (
                    <span className="text-amber-400 font-semibold">PIN vendedor</span>
                  ) : (
                    <span className="text-emerald-400 font-semibold">Disponible</span>
                  )}
                  <ChevronRight size={13} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected Locker Detail Modal / Bottom Drawer */}
      {selectedLocker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border-2 border-primary/40 bg-card p-6 shadow-2xl space-y-4">
            <button
              type="button"
              onClick={() => setSelectedLocker(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl font-mono text-lg font-black ${
                  selectedLocker.status === 'abierto'
                    ? 'bg-primary text-primary-foreground'
                    : selectedLocker.status === 'listo_para_retiro'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : selectedLocker.status === 'esperando_deposito'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                #{selectedLocker.code}
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Casillero #{selectedLocker.code} · {selectedLocker.hubName}
                </h3>
                <span className="text-xs text-muted-foreground capitalize">
                  {selectedLocker.tempType === 'refrigerado' ? '❄️ Climatizado refrigerado' : '🌡️ Temperatura ambiente'}
                </span>
              </div>
            </div>

            {/* Content Status */}
            {selectedLocker.status === 'abierto' ? (
              <div className="rounded-2xl bg-primary/15 border border-primary/40 p-4 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                  <Sparkles size={28} />
                </div>
                <h4 className="font-display text-base font-extrabold text-foreground">
                  ¡Puerta Desbloqueada!
                </h4>
                <p className="text-xs text-muted-foreground">
                  Retira tu <strong>{selectedLocker.productName || 'snack'}</strong> del casillero.
                </p>
                <button
                  type="button"
                  onClick={() => handleRetrieveSnack(selectedLocker)}
                  disabled={Boolean(celebratingLockerId)}
                  className="w-full rounded-xl bg-primary py-3 font-display text-xs font-extrabold text-primary-foreground shadow-md hover:opacity-90 active:scale-95"
                >
                  {celebratingLockerId ? '¡Snack Recogido! Cerrando casillero...' : '✓ Confirmar que ya recogí mi snack'}
                </button>
              </div>
            ) : selectedLocker.status === 'listo_para_retiro' ? (
              <div className="rounded-2xl bg-secondary/50 p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-cyan-400">Snack en casillero:</span>
                    <h4 className="font-display text-base font-bold text-foreground">{selectedLocker.productName}</h4>
                    <p className="text-xs text-muted-foreground">Vendedor: {selectedLocker.sellerName}</p>
                  </div>
                  {selectedLocker.productPrice && (
                    <span className="font-display text-base font-extrabold text-primary">
                      {money(selectedLocker.productPrice)}
                    </span>
                  )}
                </div>

                <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-3 text-xs text-cyan-300">
                  <p className="font-semibold flex items-center gap-1.5">
                    <KeyRound size={14} /> Para abrir este casillero:
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Digita tu PIN de 4 dígitos o usa el botón de teclado Kiosk.
                    {selectedLocker.claimPin && (
                      <span className="block mt-1 text-foreground font-mono font-bold text-sm">
                        PIN Demo de prueba: <strong className="text-primary">{selectedLocker.claimPin}</strong>
                      </span>
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedLocker(null)
                    if (onOpenKeypad) onOpenKeypad()
                  }}
                  className="w-full rounded-xl bg-cyan-500 py-3 font-display text-xs font-bold text-white shadow-md hover:bg-cyan-600 transition-colors"
                >
                  Digitar PIN en el Kiosk →
                </button>
              </div>
            ) : selectedLocker.status === 'esperando_deposito' ? (
              <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 text-xs text-amber-300 space-y-2">
                <p className="font-display font-bold">Esperando que el vendedor deposite la comida.</p>
                <p className="text-muted-foreground text-[11px]">
                  El vendedor tiene asignado el código de depósito <strong>{selectedLocker.depositPin}</strong> para abrir la vitrina y guardar el snack.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLocker(null)
                    if (onOpenKeypad) onOpenKeypad()
                  }}
                  className="w-full rounded-xl bg-amber-500 py-2.5 font-display text-xs font-bold text-black hover:bg-amber-400"
                >
                  Digitar PIN de Depósito (Vendedor) →
                </button>
              </div>
            ) : (
              <div className="rounded-2xl bg-secondary/50 p-4 text-center space-y-3">
                <p className="text-xs text-muted-foreground">
                  Este casillero está disponible y libre para que cualquier estudiante vendedor guarde sus snacks.
                </p>
                <Link
                  to="/vender"
                  className="inline-block w-full rounded-xl bg-primary py-2.5 font-display text-xs font-bold text-primary-foreground hover:opacity-90"
                >
                  Guardar un Snack en este Casillero
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
