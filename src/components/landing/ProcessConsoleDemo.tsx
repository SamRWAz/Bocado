import { useState } from 'react'
import {
  CheckCircle2,
  KeyRound,
  QrCode,
  RotateCcw,
  Sparkles,
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
    <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border-2 border-neutral-800 bg-[#171412] p-6 shadow-xl sm:p-8 text-white">
      {/* Top Header / Kiosk Terminal Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-neutral-800 pb-4 mb-6 gap-3">
        <div className="flex items-center gap-2.5">
          <span className="h-3 w-3 rounded-full bg-[#8F1414] inline-block" />
          <div className="text-left">
            <span className="font-mono text-xs font-bold tracking-widest text-red-300">
              TERMINAL FÍSICA BOCADO
            </span>
            <p className="text-[11px] text-neutral-400 font-mono">
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
            className="flex items-center gap-1.5 rounded-xl bg-[#8F1414] px-3.5 py-1.5 text-xs font-mono font-bold text-white hover:bg-[#781010] transition-all disabled:opacity-50 cursor-pointer"
          >
            <Sparkles size={13} className={isAutoPlaying ? 'animate-spin' : ''} />
            <span>{isAutoPlaying ? 'Demostrando...' : 'Demo Automática'}</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center justify-center rounded-xl bg-neutral-800 border border-neutral-700 p-2 text-neutral-300 hover:text-white transition-colors cursor-pointer"
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
          className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-mono font-bold border transition-all cursor-pointer ${
            step === 'pin'
              ? 'border-white bg-[#8F1414] text-white shadow-xs'
              : 'border-neutral-800 bg-neutral-900/60 text-neutral-400'
          }`}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/40 text-[10px]">
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
          className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-mono font-bold border transition-all cursor-pointer ${
            step === 'qr'
              ? 'border-white bg-[#751010] text-white shadow-xs'
              : 'border-neutral-800 bg-neutral-900/60 text-neutral-400'
          }`}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/40 text-[10px]">
            2
          </span>
          <span className="hidden sm:inline">Pago QR</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStep('unlocked')
            setPinInput(sampleSnack.pin)
          }}
          className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-mono font-bold border transition-all cursor-pointer ${
            step === 'unlocked'
              ? 'border-white bg-[#5C0C0C] text-white shadow-xs'
              : 'border-neutral-800 bg-neutral-900/60 text-neutral-400'
          }`}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/40 text-[10px]">
            3
          </span>
          <span className="hidden sm:inline">Apertura</span>
        </button>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Column: Virtual Machine Screen & Inputs */}
        <div className="md:col-span-7 space-y-4">
          {step === 'pin' && (
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-neutral-700 bg-black p-4 text-center">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Digita el PIN de tu pase (Demo: {sampleSnack.pin})
                </span>
                <div className="flex h-12 items-center justify-center font-mono text-3xl font-black tracking-widest text-white">
                  {pinInput ? (
                    <span>{pinInput.padEnd(4, ' • ')}</span>
                  ) : (
                    <span className="text-neutral-600">_ _ _ _</span>
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
                    className="flex h-12 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 font-display text-lg font-bold text-white transition-all hover:bg-neutral-800 active:scale-95 cursor-pointer"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex h-12 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-800 font-mono text-xs font-bold text-neutral-300 hover:bg-neutral-700 active:scale-95 cursor-pointer"
                >
                  BORRAR
                </button>
                <button
                  type="button"
                  onClick={() => handleDigit('0')}
                  className="flex h-12 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 font-display text-lg font-bold text-white transition-all hover:bg-neutral-800 active:scale-95 cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => handleDigit('7')}
                  className="flex h-12 items-center justify-center rounded-xl border border-red-900/60 bg-red-950/40 font-mono text-xs font-bold text-red-300 hover:bg-red-900/60 active:scale-95 cursor-pointer"
                >
                  OK
                </button>
              </div>
            </div>
          )}

          {step === 'qr' && (
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-[#8F1414] bg-black p-4 text-center space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-xs font-mono text-neutral-400">PAGO VIRTUAL</span>
                  <span className="font-mono text-xs font-bold text-red-300">PIN VALIDADO ✓</span>
                </div>

                <div className="py-2">
                  <p className="text-xs text-neutral-300 font-medium">{sampleSnack.name}</p>
                  <p className="font-mono text-2xl font-black text-white mt-1">
                    ${sampleSnack.price.toLocaleString('es-CO')} COP
                  </p>
                </div>

                <div className="rounded-xl bg-neutral-900 p-3 border border-neutral-800 flex items-center justify-center gap-3">
                  <div className="h-16 w-16 bg-white p-1 rounded-lg shrink-0 flex items-center justify-center">
                    <QrCode size={56} className="text-black" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white">Escanea con Nequi / Bancolombia</p>
                    <p className="text-[10px] text-neutral-400 font-mono">Comprobante automático</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePayAndUnlock}
                disabled={isPaying}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#8F1414] py-3.5 font-display text-sm font-bold text-white hover:bg-[#751010] transition-all cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 size={16} />
                <span>{isPaying ? 'Validando pago...' : 'Simular Pago Exitoso & Destrabar'}</span>
              </button>
            </div>
          )}

          {step === 'unlocked' && (
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-[#8F1414] bg-black p-4 space-y-3">
                <div className="flex items-center gap-2 text-red-300 text-xs font-mono font-bold">
                  <CheckCircle2 size={16} />
                  <span>COMPROBANTE DE RETIRO EMITIDO</span>
                </div>

                <div className="border-t border-neutral-800 pt-2 space-y-1 text-xs font-mono text-neutral-300">
                  <div className="flex justify-between">
                    <span>Producto:</span>
                    <span className="font-bold text-white">{sampleSnack.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Casillero:</span>
                    <span className="text-white font-bold">#{sampleSnack.slot} ({sampleSnack.building})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total pagado:</span>
                    <span className="font-bold text-white">${sampleSnack.price.toLocaleString('es-CO')} COP</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Comisión Bocado (5%):</span>
                    <span>-${sampleSnack.commission.toLocaleString('es-CO')} COP</span>
                  </div>
                  <div className="border-t border-neutral-800 pt-1.5 flex justify-between font-bold text-white">
                    <span>Neto al vendedor (95%):</span>
                    <span className="text-red-300 font-bold">${sampleSnack.net.toLocaleString('es-CO')} COP</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full rounded-xl bg-white py-3 text-center font-display text-xs font-black text-black hover:bg-neutral-200 transition-all cursor-pointer"
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
                  ? 'border-[#8F1414] bg-[#2A0E0E] locker-door is-open'
                  : step === 'qr'
                  ? 'border-[#751010] bg-neutral-900'
                  : 'border-neutral-800 bg-neutral-900'
              }`}
            >
              {step === 'unlocked' ? (
                <div className="space-y-2">
                  <img
                    src="/images/real_brownie.jpg"
                    alt="Brownie"
                    className="h-24 w-24 object-cover rounded-xl mx-auto shadow-md border border-[#8F1414]/50"
                  />
                  <p className="text-xs font-bold text-red-300">¡Compuerta Abierta!</p>
                  <p className="text-[10px] text-neutral-400 font-mono">Slot #{sampleSnack.slot} Destrabado</p>
                </div>
              ) : step === 'qr' ? (
                <div className="space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-950/40 text-red-300 border border-[#8F1414]">
                    <QrCode size={28} />
                  </div>
                  <p className="font-mono text-xs font-bold text-red-200">Esperando Pago QR</p>
                  <span className="inline-block rounded-lg bg-black px-2.5 py-1 text-[10px] font-mono text-neutral-300 border border-neutral-800">
                    Slot #{sampleSnack.slot}
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8F1414] text-white">
                    <KeyRound size={26} />
                  </div>
                  <p className="font-display text-xs font-bold text-white">Casillero #{sampleSnack.slot}</p>
                  <span className="inline-block rounded-lg bg-black px-2.5 py-1 text-[10px] font-mono text-neutral-400 border border-neutral-800">
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
