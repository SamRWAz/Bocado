import { CheckCircle2, Delete, KeyRound, QrCode, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { depositInLocker, unlockLockerWithPin } from '../../lib/lockers'
import { playErrorBuzz, playKeyBeep, playLockerUnlock, playPaymentSuccess } from '../../lib/sounds'
import type { Locker } from '../../types'

type Props = {
  onLockerUnlocked?: (locker: Locker) => void
  onClose?: () => void
}

export function LockerKeypad({ onLockerUnlocked, onClose }: Props) {
  const [pinInput, setPinInput] = useState('')
  const [mode, setMode] = useState<'pin' | 'qr'>('pin')
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleKeyPress = (char: string) => {
    if (pinInput.length >= 8) return
    playKeyBeep(700 + pinInput.length * 40)
    setPinInput((prev) => prev + char)
    setStatusMessage(null)
  }

  const handleDelete = () => {
    playKeyBeep(500)
    setPinInput((prev) => prev.slice(0, -1))
    setStatusMessage(null)
  }

  const handleClear = () => {
    playKeyBeep(450)
    setPinInput('')
    setStatusMessage(null)
  }

  const handleExecute = () => {
    if (!pinInput.trim()) return
    setIsProcessing(true)

    // Check if it's a deposit PIN (starts with DEP) or claim PIN (numeric)
    const isDeposit = pinInput.toUpperCase().startsWith('DEP')

    setTimeout(() => {
      let result
      if (isDeposit) {
        result = depositInLocker(pinInput)
      } else {
        result = unlockLockerWithPin(pinInput)
      }

      setIsProcessing(false)

      if (result.success && result.locker) {
        playPaymentSuccess()
        playLockerUnlock()
        setStatusMessage({ type: 'success', text: result.message })
        if (onLockerUnlocked) {
          onLockerUnlocked(result.locker)
        }
      } else {
        playErrorBuzz()
        setStatusMessage({ type: 'error', text: result.message })
      }
    }, 450)
  }

  const handleSimulateQrScan = (samplePin: string) => {
    setPinInput(samplePin)
    setMode('pin')
    playPaymentSuccess()
    playLockerUnlock()
    const result = unlockLockerWithPin(samplePin)
    if (result.success && result.locker) {
      setStatusMessage({ type: 'success', text: result.message })
      if (onLockerUnlocked) onLockerUnlocked(result.locker)
    }
  }

  return (
    <div className="relative rounded-3xl border border-border/80 bg-card/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X size={18} />
        </button>
      )}

      {/* Header */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-2">
          <KeyRound size={13} />
          <span>Terminal Kiosk de Apertura</span>
        </div>
        <h3 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl text-foreground">
          Digita tu PIN de Casillero
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Ingresa el PIN de 4 dígitos de tu Pase de Retiro o tu código de vendedor (ej. DEP-1021).
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex rounded-xl bg-secondary p-1 mb-5 max-w-xs mx-auto">
        <button
          type="button"
          onClick={() => {
            playKeyBeep(600)
            setMode('pin')
          }}
          className={`flex-1 rounded-lg py-1.5 text-xs font-display font-semibold transition-all ${
            mode === 'pin' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Teclado PIN
        </button>
        <button
          type="button"
          onClick={() => {
            playKeyBeep(600)
            setMode('qr')
          }}
          className={`flex-1 rounded-lg py-1.5 text-xs font-display font-semibold transition-all ${
            mode === 'qr' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Escanear QR
        </button>
      </div>

      {mode === 'pin' ? (
        <div className="max-w-xs mx-auto space-y-4">
          {/* Display screen */}
          <div className="relative rounded-2xl border-2 border-primary/40 bg-black/80 p-4 text-center shadow-inner">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-1">
              Código Ingresado
            </span>
            <div className="h-10 flex items-center justify-center font-mono text-2xl font-black tracking-widest text-primary">
              {pinInput ? (
                <span>{pinInput}</span>
              ) : (
                <span className="text-muted-foreground/40 animate-pulse">_ _ _ _</span>
              )}
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`rounded-xl p-3 text-xs font-semibold animate-in fade-in slide-in-from-top-1 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              <div className="flex items-center gap-2">
                {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : null}
                <span>{statusMessage.text}</span>
              </div>
            </div>
          )}

          {/* Numeric Keypad Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeyPress(digit)}
                className="flex h-14 items-center justify-center rounded-2xl border border-border/80 bg-secondary/80 font-display text-xl font-bold text-foreground transition-all hover:border-primary hover:bg-primary/10 active:scale-95 shadow-sm"
              >
                {digit}
              </button>
            ))}

            {/* Bottom Row */}
            <button
              type="button"
              onClick={handleClear}
              className="flex h-14 items-center justify-center rounded-2xl border border-border/80 bg-secondary/40 text-xs font-bold text-muted-foreground hover:bg-secondary hover:text-foreground active:scale-95"
            >
              C
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="flex h-14 items-center justify-center rounded-2xl border border-border/80 bg-secondary/80 font-display text-xl font-bold text-foreground transition-all hover:border-primary hover:bg-primary/10 active:scale-95 shadow-sm"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex h-14 items-center justify-center rounded-2xl border border-border/80 bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground active:scale-95"
              aria-label="Borrar dígito"
            >
              <Delete size={20} />
            </button>
          </div>

          {/* Deposit prefix shortcut for sellers */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playKeyBeep(800)
                setPinInput('DEP-')
              }}
              className="flex-1 rounded-xl border border-border bg-secondary/50 py-2 text-[11px] font-semibold text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
            >
              + Prefijo DEP- (Vendedor)
            </button>
          </div>

          {/* Submit / Unlock Button */}
          <button
            type="button"
            onClick={handleExecute}
            disabled={!pinInput.trim() || isProcessing}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary via-amber-500 to-primary py-4 font-display text-sm font-extrabold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-95 active:scale-95 disabled:opacity-40"
          >
            <Sparkles size={18} />
            <span>{isProcessing ? 'Validando código...' : '🔓 Desbloquear Casillero'}</span>
          </button>
        </div>
      ) : (
        /* QR Scanner Simulator */
        <div className="max-w-xs mx-auto text-center space-y-4">
          <div className="relative mx-auto flex h-48 w-48 items-center justify-center rounded-3xl border-2 border-dashed border-primary/50 bg-secondary/40 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-bounce" />
            <QrCode size={96} className="text-primary/70 animate-pulse" />
          </div>
          <p className="text-xs text-muted-foreground">
            Apunta la cámara del celular hacia el código QR de la vitrina inteligente para abrir tu casillero automáticamente.
          </p>
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-bold uppercase text-muted-foreground block">
              Prueba con pases de demostración:
            </span>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                type="button"
                onClick={() => handleSimulateQrScan('7492')}
                className="rounded-lg bg-primary/15 border border-primary/30 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                QR Casillero D-02 (PIN 7492)
              </button>
              <button
                type="button"
                onClick={() => handleSimulateQrScan('3184')}
                className="rounded-lg bg-primary/15 border border-primary/30 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                QR Casillero D-04 (PIN 3184)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
