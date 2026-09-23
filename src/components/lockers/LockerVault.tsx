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
import { money } from '../../lib/format'
import { playPaymentSuccess } from '../../lib/sounds'
import type { Locker } from '../../types'

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
    }, 2500)
  }

  // Count stats
  const availableCount = lockers.filter((l) => l.status === 'disponible').length
  const readyCount = lockers.filter((l) => l.status === 'listo_para_retiro').length

  return (
    <div className="space-y-6">
      {/* Hub Selector Tabs (Edificios D, M, L) */}
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
            className="flex items-center gap-2 rounded-2xl bg-primary hover:bg-[#751010] px-4 py-2.5 font-display text-xs font-extrabold text-white shadow-md transition-transform active:scale-95 self-start sm:self-auto cursor-pointer"
          >
            <KeyRound size={15} />
            <span>Digitar PIN / Abrir</span>
          </button>
        )}
      </div>

      {/* Hub Info Banner */}
      <div className="flex flex-col gap-3 rounded-3xl border border-border/80 bg-card/60 p-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-xl text-primary">
            {currentHub.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base font-bold text-foreground">{currentHub.name}</h2>
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" /> En línea 24/7
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{currentHub.zone} · {currentHub.detail}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold font-mono">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-muted-foreground" />
            <span>{availableCount} Libres</span>
          </div>
          <div className="flex items-center gap-1.5 text-primary">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span>{readyCount} Con Snack</span>
          </div>
        </div>
      </div>

      {/* 20 Locker Grid for active hub */}
      <div className="rounded-3xl border-2 border-border/90 bg-card p-5 shadow-sm backdrop-blur-xl locker-vault-perspective">
        <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-primary" />
            <span className="font-display text-xs font-extrabold uppercase tracking-wider text-foreground">
              Matriz de 20 Casilleros · {currentHub.name}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Toca un casillero para ver su contenido o ingresar código
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
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
                className={`group relative flex flex-col justify-between rounded-2xl border-2 p-3.5 transition-all duration-300 cursor-pointer overflow-hidden min-h-[175px] ${
                  isOpen
                    ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                    : isReady
                    ? 'border-red-200 dark:border-red-900 bg-red-50/70 dark:bg-red-950/30 hover:border-primary shadow-xs'
                    : isWaiting
                    ? 'border-border bg-secondary/40 hover:border-primary/40'
                    : 'border-border/80 bg-card hover:border-primary/50 hover:bg-secondary/30'
                } ${isHighlighted ? 'ring-2 ring-primary animate-pulse' : ''}`}
              >
                {/* Top Status Bar */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black tracking-wider text-foreground">
                    #{locker.code}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {locker.tempType === 'refrigerado' && (
                      <span className="rounded-full bg-secondary p-1 text-primary text-[10px]" title="Climatizado refrigerado">
                        <Thermometer size={11} />
                      </span>
                    )}
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        isOpen
                          ? 'bg-primary'
                          : isReady
                          ? 'bg-primary'
                          : isWaiting
                          ? 'bg-muted-foreground/60'
                          : 'bg-muted-foreground/30'
                      }`}
                    />
                  </div>
                </div>

                {/* Locker Content */}
                <div className="my-2 flex flex-1 flex-col items-center justify-center text-center">
                  {isOpen ? (
                    <div className="animate-in fade-in zoom-in-95 space-y-1">
                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary">
                        <LockOpen size={20} className="animate-bounce" />
                      </div>
                      <p className="font-display text-[11px] font-extrabold text-primary">¡Abierto!</p>
                      {locker.productName && (
                        <p className="text-[10px] font-semibold text-foreground line-clamp-1">{locker.productName}</p>
                      )}
                    </div>
                  ) : isReady ? (
                    <div className="space-y-1">
                      {locker.productImage ? (
                        <img
                          src={locker.productImage}
                          alt={locker.productName ?? 'Snack'}
                          className="mx-auto h-11 w-11 rounded-xl object-cover shadow-xs border border-red-200 dark:border-red-900"
                        />
                      ) : (
                        <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-[#8F1414] dark:bg-red-900 dark:text-red-300">
                          <ShoppingBag size={18} />
                        </div>
                      )}
                      <p className="font-display text-[11px] font-bold text-foreground line-clamp-1">{locker.productName}</p>
                      <p className="text-[10px] font-extrabold text-primary">{locker.productPrice ? money(locker.productPrice) : ''}</p>
                    </div>
                  ) : isWaiting ? (
                    <div className="space-y-1 text-muted-foreground">
                      <PackageCheck size={22} className="mx-auto opacity-75 animate-pulse text-primary" />
                      <p className="font-display text-[10px] font-bold">Esperando depósito</p>
                      <p className="text-[9px] text-muted-foreground line-clamp-1">{locker.productName || 'Reservado'}</p>
                    </div>
                  ) : (
                    <div className="space-y-1 text-muted-foreground/60">
                      <Lock size={20} className="mx-auto opacity-40 group-hover:text-primary transition-colors" />
                      <p className="font-display text-[10px] font-bold text-muted-foreground">Disponible</p>
                      <span className="text-[8px] text-muted-foreground font-semibold block">Libre</span>
                    </div>
                  )}
                </div>

                {/* Bottom Action */}
                <div className="mt-1 border-t border-border/40 pt-1.5 flex items-center justify-between text-[10px]">
                  {isOpen ? (
                    <span className="text-primary font-bold">Destrabado</span>
                  ) : isReady ? (
                    <span className="text-primary font-bold flex items-center gap-1">
                      <KeyRound size={10} /> Con PIN
                    </span>
                  ) : isWaiting ? (
                    <span className="text-muted-foreground font-semibold">PIN vendedor</span>
                  ) : (
                    <span className="text-muted-foreground font-semibold">Libre</span>
                  )}
                  <ChevronRight size={12} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected Locker Detail Modal */}
      {selectedLocker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
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
                    ? 'bg-red-100 text-[#8F1414] dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-800'
                    : 'bg-secondary text-foreground border border-border'
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
                    <span className="text-[10px] font-bold uppercase text-primary font-mono">Snack en casillero:</span>
                    <h4 className="font-display text-base font-bold text-foreground">{selectedLocker.productName}</h4>
                    <p className="text-xs text-muted-foreground">Vendedor: {selectedLocker.sellerName}</p>
                  </div>
                  {selectedLocker.productPrice && (
                    <span className="font-display text-base font-extrabold text-primary">
                      {money(selectedLocker.productPrice)}
                    </span>
                  )}
                </div>

                <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50/60 dark:bg-red-950/30 p-3 text-xs text-foreground">
                  <p className="font-semibold flex items-center gap-1.5 font-mono text-primary">
                    <KeyRound size={14} /> Para abrir este casillero:
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Digita el PIN en el teclado Kiosk para validar tu producto y abrir con pago virtual QR.
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
                  className="w-full rounded-xl bg-primary hover:bg-[#751010] py-3 font-display text-xs font-bold text-white shadow-md transition-colors cursor-pointer"
                >
                  Digitar PIN en el Kiosk →
                </button>
              </div>
            ) : selectedLocker.status === 'esperando_deposito' ? (
              <div className="rounded-2xl bg-secondary/80 border border-border p-4 text-xs text-foreground space-y-2">
                <p className="font-display font-bold text-primary">Esperando que el vendedor deposite la comida.</p>
                <p className="text-muted-foreground text-[11px]">
                  El vendedor tiene asignado el código de depósito <strong>{selectedLocker.depositPin}</strong> para abrir la vitrina y guardar el snack.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLocker(null)
                    if (onOpenKeypad) onOpenKeypad()
                  }}
                  className="w-full rounded-xl bg-primary hover:bg-[#751010] py-2.5 font-display text-xs font-bold text-white transition-colors cursor-pointer"
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
