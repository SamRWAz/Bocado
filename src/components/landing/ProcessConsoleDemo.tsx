import { useState } from 'react'
import {
  CheckCircle2,
  KeyRound,
  QrCode,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react'
import { playKeyBeep, playLockerUnlock, playPaymentSuccess } from '../../lib/sounds'

type Step = 'pin' | 'qr' | 'unlocked'

export function ProcessConsoleDemo() {
  const [step, setStep] = useState<Step>('pin')
  const [pinInput, setPinInput] = useState('')
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const [isPaying, setIsPaying] = useState(false)

  const sampleSnack = {
    name: 'Brownie Melcochudo con Nueces',
    price: 3500,
    commission: 175, // 5%
    net: 3325, // 95%
    slot: 'D-02',
    building: 'Edificio D (Icesi)',
    pin: '7492',
  }

  // Handle typing a single digit or setting pin
  const handleDigit = (digit: string) => {
    if (pinInput.length >= 4) return
    playKeyBeep(650 + pinInput.length * 60)
    const next = pinInput + digit
    setPinInput(next)

    if (next === sampleSnack.pin || next.length === 4) {
      setTimeout(() => {
        playPaymentSuccess()
        setStep('qr')
      }, 350)
    }
  }

  const handleClear = () => {
    playKeyBeep(450)
    setPinInput('')
    setStep('pin')
  }

  const handlePayAndUnlock = () => {
    setIsPaying(true)
    playKeyBeep(880)

    setTimeout(() => {
      setIsPaying(false)
      playPaymentSuccess()
      playLockerUnlock()
      setStep('unlocked')
    }, 600)
  }

  const handleReset = () => {
    playKeyBeep(500)
    setPinInput('')
    setStep('pin')
    setIsPaying(false)
    setIsAutoPlaying(false)
  }

  const handleStartAutoDemo = () => {
    setIsAutoPlaying(true)
    handleReset()

    // Step 1: Type PIN
    setTimeout(() => handleDigit('7'), 300)
    setTimeout(() => handleDigit('4'), 700)
    setTimeout(() => handleDigit('9'), 1100)
    setTimeout(() => handleDigit('2'), 1500)

    // Step 2: Pay QR
    setTimeout(() => {
      setIsPaying(true)
    }, 2400)

    // Step 3: Unlock
    setTimeout(() => {
      setIsPaying(false)
      playPaymentSuccess()
      playLockerUnlock()
      setStep('unlocked')
      setIsAutoPlaying(false)
    }, 3200)
  }

  return (
    <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border-2 border-primary/40 bg-zinc-950/90 p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
      {/* Top Header / Kiosk Terminal Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 mb-6 gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          <div className="text-left">
            <span className="font-mono text-xs font-bold tracking-widest text-emerald-400">
              TERMINAL INTERACTIVA BOCADO
            </span>
            <p className="text-[11px] text-zinc-400 font-mono">
              Simulador de Casillero #{sampleSnack.slot} · {sampleSnack.building}
            </p>
          </div>
        </div>

        {/* Demo Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleStartAutoDemo}
            disabled={isAutoPlaying}
            className="flex items-center gap-1.5 rounded-xl bg-primary/20 border border-primary/40 px-3 py-1.5 text-xs font-mono font-bold text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-50"
          >
            <Sparkles size={13} className={isAutoPlaying ? 'animate-spin' : ''} />
            <span>{isAutoPlaying ? 'Demostrando...' : 'Animación Automática'}</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center justify-center rounded-xl bg-white/5 border border-white/10 p-2 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Reiniciar simulador"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Progress Steps Indicators */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <button
          type="button"
          onClick={() => {
            setStep('pin')
            setPinInput('')
          }}
          className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-mono font-bold border transition-all ${
            step === 'pin'
              ? 'border-primary bg-primary/20 text-primary shadow-md shadow-primary/20'
              : 'border-white/10 bg-zinc-900/50 text-zinc-500'
          }`}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px]">
            1
          </span>
          <span className="hidden sm:inline">Ingresar PIN</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStep('qr')
            setPinInput(sampleSnack.pin)
          }}
          className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-mono font-bold border transition-all ${
            step === 'qr'
              ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-md shadow-amber-500/20'
              : 'border-white/10 bg-zinc-900/50 text-zinc-500'
          }`}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-[10px]">
            2
          </span>
          <span className="hidden sm:inline">Pago QR Virtual</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStep('unlocked')
            setPinInput(sampleSnack.pin)
          }}
          className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-mono font-bold border transition-all ${
            step === 'unlocked'
              ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-md shadow-emerald-500/20'
              : 'border-white/10 bg-zinc-900/50 text-zinc-500'
          }`}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px]">
            3
          </span>
          <span className="hidden sm:inline">Apertura & Recibo</span>
        </button>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Column: Virtual Machine Screen & Inputs */}
        <div className="md:col-span-7 space-y-4">
          {step === 'pin' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="rounded-2xl border-2 border-primary/30 bg-black/90 p-4 text-center">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Digita el PIN de tu pase (Demo: {sampleSnack.pin})
                </span>
                <div className="flex h-12 items-center justify-center font-mono text-3xl font-black tracking-widest text-primary">
                  {pinInput ? (
                    <span>{pinInput.padEnd(4, ' • ')}</span>
                  ) : (
                    <span className="text-zinc-600 animate-pulse">_ _ _ _</span>
                  )}
                </div>
              </div>

              {/* Numeric Keypad Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleDigit(digit)}
                    className="flex h-12 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 font-display text-lg font-bold text-white transition-all hover:border-primary hover:bg-primary/20 active:scale-95"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex h-12 items-center justify-center rounded-xl border border-white/10 bg-zinc-900/60 font-mono text-xs font-bold text-zinc-400 hover:text-white"
                >
                  BORRAR
                </button>
                <button
                  type="button"
                  onClick={() => handleDigit('0')}
                  className="flex h-12 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 font-display text-lg font-bold text-white transition-all hover:border-primary hover:bg-primary/20 active:scale-95"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playKeyBeep(800)
                    setPinInput(sampleSnack.pin)
                    setTimeout(() => {
                      playPaymentSuccess()
                      setStep('qr')
                    }, 300)
                  }}
                  className="flex h-12 items-center justify-center rounded-xl border border-primary/40 bg-primary/20 font-mono text-xs font-bold text-primary hover:bg-primary hover:text-white"
                >
                  AUTO {sampleSnack.pin}
                </button>
              </div>
            </div>
          )}

          {step === 'qr' && (
            <div className="rounded-2xl border-2 border-amber-500/40 bg-zinc-900/90 p-5 text-center space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs font-mono">
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <QrCode size={15} /> PAGO VIRTUAL EN LÍNEA
                </span>
                <span className="text-zinc-400">CASILLERO #{sampleSnack.slot}</span>
              </div>

              <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-2xl border-2 border-dashed border-amber-400/60 bg-white p-2 shadow-xl">
                <div className="h-full w-full bg-slate-950 rounded-xl flex flex-col items-center justify-center text-white p-2">
                  <QrCode size={68} className="text-amber-400 animate-pulse" />
                  <span className="text-[8px] font-mono text-zinc-300 mt-1">NEQUI / BANCOLOMBIA</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="font-display text-sm font-bold text-white">{sampleSnack.name}</p>
                <p className="font-mono text-xl font-extrabold text-amber-400">
                  ${sampleSnack.price.toLocaleString('es-CO')} COP
                </p>
              </div>

              <button
                type="button"
                onClick={handlePayAndUnlock}
                disabled={isPaying}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-primary py-3 font-display text-xs font-bold text-black hover:brightness-110 active:scale-95 shadow-lg shadow-amber-500/25 transition-all"
              >
                <Zap size={14} />
                <span>{isPaying ? 'Procesando Pago Virtual...' : 'Simular Pago Exitoso → Abrir Casillero'}</span>
              </button>
            </div>
          )}

          {step === 'unlocked' && (
            <div className="rounded-2xl border-2 border-emerald-500/50 bg-emerald-950/20 p-5 text-left space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2 text-xs font-mono">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> ¡CASILLERO DESBLOQUEADO!
                </span>
                <span className="text-zinc-400">SLOT #{sampleSnack.slot}</span>
              </div>

              {/* Automatic Platform Receipt */}
              <div className="rounded-xl border border-white/10 bg-black/60 p-3.5 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-zinc-300">
                  <span>Valor del snack:</span>
                  <span className="font-bold">${sampleSnack.price.toLocaleString('es-CO')} COP</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span className="flex items-center gap-1">
                    <Sparkles size={11} /> Comisión Bocado (5%):
                  </span>
                  <span>-${sampleSnack.commission.toLocaleString('es-CO')} COP</span>
                </div>
                <div className="border-t border-white/10 pt-1.5 flex justify-between font-bold text-white">
                  <span>Transferencia al vendedor (95%):</span>
                  <span className="text-primary">${sampleSnack.net.toLocaleString('es-CO')} COP</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full rounded-xl bg-emerald-500 py-3 text-center font-display text-xs font-bold text-black hover:bg-emerald-400 transition-all shadow-md"
                >
                  ✓ Retirar Snack & Probar de Nuevo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: 3D Locker Door Physical Simulation */}
        <div className="md:col-span-5 flex justify-center">
          <div className="locker-vault-perspective w-full max-w-[240px]">
            <div
              className={`relative h-64 w-full rounded-3xl border-2 transition-all duration-700 flex flex-col items-center justify-center p-4 text-center ${
                step === 'unlocked'
                  ? 'border-emerald-500 bg-emerald-950/40 locker-door is-open shadow-[0_0_35px_rgba(16,185,129,0.35)]'
                  : step === 'qr'
                  ? 'border-amber-400/80 bg-zinc-900 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
                  : 'border-white/20 bg-zinc-900/90 shadow-xl'
              }`}
            >
              {step === 'unlocked' ? (
                <div className="space-y-2 animate-fadeIn">
                  <img
                    src="/images/real_brownie.jpg"
                    alt="Brownie"
                    className="h-24 w-24 object-cover rounded-xl mx-auto shadow-lg border border-emerald-400/40"
                  />
                  <p className="text-xs font-bold text-emerald-300">¡Compuerta Abierta!</p>
                  <p className="text-[10px] text-zinc-400 font-mono">Slot #{sampleSnack.slot} Destrabado</p>
                </div>
              ) : step === 'qr' ? (
                <div className="space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/40 animate-pulse">
                    <QrCode size={28} />
                  </div>
                  <p className="font-mono text-xs font-bold text-amber-300">Esperando Pago QR</p>
                  <span className="inline-block rounded-lg bg-black/60 px-2.5 py-1 text-[10px] font-mono text-zinc-300 border border-white/10">
                    Slot #{sampleSnack.slot}
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 text-primary border border-primary/30">
                    <KeyRound size={26} />
                  </div>
                  <p className="font-brand text-xs font-bold text-white">Casillero #{sampleSnack.slot}</p>
                  <span className="inline-block rounded-lg bg-black/60 px-2.5 py-1 text-[10px] font-mono text-zinc-400 border border-white/10">
                    Digita PIN 7492
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
