import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Boxes,
  HelpCircle,
  KeyRound,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'
import { LOCKER_HUBS, getLockersByHub } from '../lib/lockers'
import { LockerVault } from '../components/lockers/LockerVault'
import { LockerKeypad } from '../components/lockers/LockerKeypad'
import { useAuth, canSell } from '../context/AuthContext'
import type { Locker } from '../types'

export function LockerHubPage() {
  const { user } = useAuth()
  const [selectedHubId, setSelectedHubId] = useState('hub_edificio_d')
  const [showKeypadModal, setShowKeypadModal] = useState(false)
  const [highlightCode, setHighlightCode] = useState<string | undefined>(undefined)

  const isSeller = canSell(user?.role)
  const hubs = LOCKER_HUBS
  const activeHub = hubs.find((h) => h.id === selectedHubId) ?? hubs[0]

  const handleLockerSelect = (locker: Locker) => {
    setHighlightCode(locker.code)
    if (locker.claimPin || locker.depositPin) {
      setShowKeypadModal(true)
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] space-y-8 pb-16">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute -top-10 left-1/2 -z-10 h-96 w-full -translate-x-1/2 max-w-5xl rounded-full bg-primary/10 blur-3xl" />

      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider text-primary border border-primary/20">
              <Sparkles size={13} className="animate-spin" />
              Red de 60 Casilleros Inteligentes
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              Edificios D · M · L (Icesi)
            </span>
          </div>
          <h1 className="mt-2 font-display text-2xl font-black tracking-tight sm:text-3xl text-foreground">
            Locker Hub Campus Icesi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Retira tus snacks apartados o deposita tus preparaciones sin esperas ni encuentros personales.
            Ingresa tu código PIN en el teclado de la vitrina para validar el pago QR y abrir la compuerta.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowKeypadModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-amber-500 px-5 py-3 text-xs sm:text-sm font-display font-extrabold text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110 active:scale-95 transition-all"
          >
            <KeyRound size={16} />
            Digitar PIN en Vitrina
          </button>
          <Link
            to="/catalogo"
            className="flex items-center gap-2 rounded-2xl bg-secondary/80 px-4 py-3 text-xs sm:text-sm font-display font-semibold text-foreground hover:bg-secondary border border-border/70 transition-all"
          >
            <Boxes size={16} className="text-primary" />
            Explorar Snacks
          </Link>
          {isSeller && (
            <Link
              to="/vender"
              className="flex items-center gap-2 rounded-2xl bg-amber-500/15 border border-amber-500/30 px-4 py-3 text-xs sm:text-sm font-display font-semibold text-amber-400 hover:bg-amber-500/20 transition-all"
            >
              <Zap size={16} />
              Guardar en Casillero
            </Link>
          )}
        </div>
      </div>

      {/* Campus Hub Selectors (Edificio D, M, L) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {hubs.map((hub) => {
          const isActive = hub.id === activeHub.id
          const hubLockers = getLockersByHub(hub.id)
          const totalLockers = hubLockers.length
          const readyCount = hubLockers.filter((l) => l.status === 'listo_para_retiro').length
          const availableCount = hubLockers.filter((l) => l.status === 'disponible').length

          return (
            <button
              key={hub.id}
              type="button"
              onClick={() => setSelectedHubId(hub.id)}
              className={`group relative flex flex-col justify-between rounded-3xl p-5 text-left transition-all ${
                isActive
                  ? 'border-2 border-primary bg-primary/10 shadow-2xl shadow-primary/15 ring-2 ring-primary scale-102'
                  : 'border border-border/80 bg-card/60 hover:border-primary/50 hover:bg-card/90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-display text-base font-bold text-foreground">
                    <span className="text-lg">{hub.icon}</span>
                    {hub.name}
                  </span>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isActive ? 'bg-primary shadow-[0_0_8px_currentColor]' : 'bg-muted'
                    }`}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{hub.zone}</p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs font-mono">
                <span className="text-emerald-400 font-bold">
                  {readyCount} con comida lista
                </span>
                <span className="text-muted-foreground">
                  {availableCount}/{totalLockers} libres
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Main Grid: Locker Vault 3D & Side Keypad */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Interactive 3D Locker Matrix */}
        <div className="lg:col-span-8">
          <LockerVault
            selectedHubId={selectedHubId}
            onSelectHub={setSelectedHubId}
            onSelectLocker={handleLockerSelect}
            highlightLockerCode={highlightCode}
            onOpenKeypad={() => setShowKeypadModal(true)}
          />
        </div>

        {/* Physical Keypad Simulator & Info Panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* Keypad */}
          <div className="rounded-3xl border border-border/80 bg-card/80 p-5 backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary">
                  <KeyRound size={16} />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold">Terminal de Apertura</h3>
                  <p className="text-[10px] text-muted-foreground font-mono">PIN de 4 dígitos o DEP-PIN</p>
                </div>
              </div>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <LockerKeypad
              onLockerUnlocked={(locker) => {
                setHighlightCode(locker.code)
              }}
            />
          </div>

          {/* How it works info card */}
          <div className="rounded-3xl border border-border/60 bg-secondary/30 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground font-mono">
              <HelpCircle size={15} className="text-primary" />
              ¿Cómo funciona el ciclo de casillero?
            </div>
            <ul className="space-y-3 text-xs text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                  1
                </span>
                <span>
                  <strong>Comprador:</strong> Aparta en el catálogo y recibe su <strong>PIN de 4 dígitos</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-[10px] font-bold text-amber-400">
                  2
                </span>
                <span>
                  <strong>Vendedor:</strong> Elige Edificio D, M o L y guarda la comida fresca con su PIN <code>DEP-XXXX</code>.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">
                  3
                </span>
                <span>
                  <strong>Pago QR & Retiro:</strong> El comprador digita su PIN en la máquina, paga por QR virtual y la compuerta se abre de inmediato descontando el 5% de comisión.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Floating Keypad Modal for mobile or header trigger */}
      {showKeypadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2 font-display text-base font-bold">
                <KeyRound size={18} className="text-primary" />
                <span>Teclado de Vitrina Kiosk</span>
              </div>
              <button
                type="button"
                onClick={() => setShowKeypadModal(false)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <LockerKeypad
              onLockerUnlocked={(locker) => {
                setHighlightCode(locker.code)
                setTimeout(() => setShowKeypadModal(false), 2200)
              }}
              onClose={() => setShowKeypadModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
