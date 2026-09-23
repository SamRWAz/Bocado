import { CheckCircle2, Delete, KeyRound, LockOpen, QrCode, Sparkles, X, Zap } from 'lucide-react'
import { useState } from 'react'
import {
  depositInLocker,
  unlockLockerWithVirtualPayment,
  verifyClaimPin,
} from '../../lib/lockers'
import { money } from '../../lib/format'
import { playErrorBuzz, playKeyBeep, playLockerUnlock, playPaymentSuccess } from '../../lib/sounds'
import type { Locker, PaymentMethod } from '../../types'

type Props = {
  onLockerUnlocked?: (locker: Locker) => void
  onClose?: () => void
}

export function LockerKeypad({ onLockerUnlocked, onClose }: Props) {
  const [pinInput, setPinInput] = useState('')
  const [mode, setMode] = useState<'pin' | 'qr'>('pin')
  const [isProcessing, setIsProcessing] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Virtual Payment Step State for Buyer
  const [paymentModalLocker, setPaymentModalLocker] = useState<Locker | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('qr_nequi')
  const [isPayingVirtual, setIsPayingVirtual] = useState(false)
  const [paymentReceipt, setPaymentReceipt] = useState<{
    total: number
    commission: number
    netRevenue: number
    locker: Locker
  } | null>(null)

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

    const isDeposit = pinInput.toUpperCase().startsWith('DEP')

    setTimeout(() => {
      if (isDeposit) {
        // Seller Deposit Flow
        const result = depositInLocker(pinInput)
        setIsProcessing(false)
        if (result.success && result.locker) {
          playPaymentSuccess()
          playLockerUnlock()
          setStatusMessage({ type: 'success', text: result.message })
          if (onLockerUnlocked) onLockerUnlocked(result.locker)
        } else {
          playErrorBuzz()
          setStatusMessage({ type: 'error', text: result.message })
        }
      } else {
        // Buyer Claim Flow: Verify PIN and prompt for Virtual QR Payment
        const check = verifyClaimPin(pinInput)
        setIsProcessing(false)
        if (check.success && check.locker) {
          playPaymentSuccess()
          setPaymentModalLocker(check.locker)
        } else {
          playErrorBuzz()
          setStatusMessage({ type: 'error', text: check.message })
        }
      }
    }, 450)
  }

  const handleConfirmVirtualPayment = async () => {
    if (!paymentModalLocker) return
    setIsPayingVirtual(true)
    playKeyBeep(850)

    try {
      const res = await unlockLockerWithVirtualPayment({
        pin: paymentModalLocker.claimPin || pinInput,
        paymentMethod: selectedPaymentMethod,
      })

      setIsPayingVirtual(false)

      if (res.success && res.locker && res.receipt) {
        playPaymentSuccess()
        playLockerUnlock()
        setPaymentReceipt({
          total: res.receipt.total,
          commission: res.receipt.commission,
          netRevenue: res.receipt.netRevenue,
          locker: res.locker,
        })
        if (onLockerUnlocked) onLockerUnlocked(res.locker)
      } else {
        playErrorBuzz()
        alert(res.message)
      }
    } catch {
      setIsPayingVirtual(false)
      playErrorBuzz()
    }
  }

  const handleCloseAllModals = () => {
    setPaymentModalLocker(null)
    setPaymentReceipt(null)
    setPinInput('')
    if (onClose) onClose()
  }

  const handleSimulateQrScan = (samplePin: string) => {
    setPinInput(samplePin)
    setMode('pin')
    playPaymentSuccess()
    const check = verifyClaimPin(samplePin)
    if (check.success && check.locker) {
      setPaymentModalLocker(check.locker)
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
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-mono font-bold text-primary mb-2">
          <KeyRound size={13} />
          <span>Terminal Kiosk de Vitrina</span>
        </div>
        <h3 className="font-display text-xl font-black tracking-tight sm:text-2xl text-foreground">
          Digita tu PIN de Casillero
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Ingresa tu PIN de 4 dígitos para verificar tu snack y pagar por QR, o tu código de vendedor (ej. DEP-1021).
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
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-muted-foreground block mb-1">
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
              className={`rounded-2xl p-3 text-xs font-semibold animate-fadeIn ${
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
              className="flex-1 rounded-xl border border-border bg-secondary/50 py-2 text-[11px] font-mono font-semibold text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
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
            <span>{isProcessing ? 'Verificando código...' : 'Continuar / Validar PIN'}</span>
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
            <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground block">
              Prueba con pases demo activos:
            </span>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                type="button"
                onClick={() => handleSimulateQrScan('7492')}
                className="rounded-xl bg-primary/15 border border-primary/30 px-3 py-1.5 text-xs font-mono font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                QR Edificio D (PIN 7492)
              </button>
              <button
                type="button"
                onClick={() => handleSimulateQrScan('5820')}
                className="rounded-xl bg-primary/15 border border-primary/30 px-3 py-1.5 text-xs font-mono font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                QR Edificio M (PIN 5820)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIRTUAL QR PAYMENT MODAL FOR BUYER                        */}
      {/* ========================================================= */}
      {paymentModalLocker && !paymentReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl border-2 border-amber-500/50 bg-card p-6 shadow-2xl space-y-5">
            <button
              type="button"
              onClick={() => setPaymentModalLocker(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X size={18} />
            </button>

            <div className="text-center space-y-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-mono font-bold text-amber-400">
                <QrCode size={13} />
                <span>Pago Virtual de Retiro</span>
              </span>
              <h3 className="font-display text-xl font-bold text-foreground">
                Casillero #{paymentModalLocker.code} · {paymentModalLocker.hubName}
              </h3>
              <p className="text-xs text-muted-foreground">
                Producto asignado: <strong>{paymentModalLocker.productName}</strong>
              </p>
            </div>

            {/* QR Code Graphic */}
            <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-2xl border-2 border-dashed border-amber-400/60 bg-white p-2 shadow-xl">
              <div className="h-full w-full bg-slate-950 rounded-xl flex flex-col items-center justify-center text-white p-2">
                <QrCode size={80} className="text-amber-400 animate-pulse" />
                <span className="text-[8px] font-mono text-zinc-300 mt-1">NEQUI / BANCOLOMBIA</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedPaymentMethod('qr_nequi')}
                className={`py-2 px-3 rounded-xl text-xs font-mono font-bold border transition-all ${
                  selectedPaymentMethod === 'qr_nequi'
                    ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                    : 'border-border bg-secondary text-muted-foreground'
                }`}
              >
                QR Nequi
              </button>
              <button
                type="button"
                onClick={() => setSelectedPaymentMethod('qr_bancolombia')}
                className={`py-2 px-3 rounded-xl text-xs font-mono font-bold border transition-all ${
                  selectedPaymentMethod === 'qr_bancolombia'
                    ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                    : 'border-border bg-secondary text-muted-foreground'
                }`}
              >
                QR Bancolombia
              </button>
            </div>

            {/* Amount Summary */}
            <div className="rounded-2xl border border-border bg-secondary/50 p-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-muted-foreground">
                <span>Vendedor:</span>
                <span className="font-semibold text-foreground">{paymentModalLocker.sellerName}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Comisión Bocado (5%):</span>
                <span className="text-emerald-400 font-bold">
                  {money(Math.round((paymentModalLocker.productPrice || 3500) * 0.05))}
                </span>
              </div>
              <div className="border-t border-border/60 pt-2 flex justify-between font-bold text-sm">
                <span>Total a Pagar:</span>
                <span className="text-primary font-extrabold font-mono text-base">
                  {money(paymentModalLocker.productPrice || 3500)}
                </span>
              </div>
            </div>

            {/* Confirm Payment and Unlock Button */}
            <button
              type="button"
              onClick={handleConfirmVirtualPayment}
              disabled={isPayingVirtual}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-primary py-4 font-display text-sm font-extrabold text-black shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
            >
              <Zap size={16} />
              <span>{isPayingVirtual ? 'Procesando Pago Virtual...' : '✓ Realizar Pago Virtual & Abrir Casillero'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* RECEIPT MODAL WITH 5% COMMISSION BREAKDOWN               */}
      {/* ========================================================= */}
      {paymentReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl border-2 border-emerald-500/60 bg-card p-6 shadow-2xl space-y-5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <LockOpen size={36} className="animate-bounce" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-400">
                ¡Pago Exitoso & Casillero Abierto!
              </span>
              <h3 className="font-display text-xl font-bold text-foreground">
                Casillero #{paymentReceipt.locker.code} Destrabado
              </h3>
              <p className="text-xs text-muted-foreground">
                Retira tu <strong>{paymentReceipt.locker.productName}</strong>.
              </p>
            </div>

            {/* Receipt Details Box */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-left space-y-2 text-xs font-mono">
              <div className="flex justify-between text-zinc-300">
                <span>Total pagado:</span>
                <span className="font-bold text-white">{money(paymentReceipt.total)}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Comisión Bocado (5%):</span>
                <span>-{money(paymentReceipt.commission)}</span>
              </div>
              <div className="border-t border-emerald-500/20 pt-2 flex justify-between font-bold text-foreground">
                <span>Transferido al vendedor:</span>
                <span className="text-primary">{money(paymentReceipt.netRevenue)}</span>
              </div>
              <p className="text-[10px] text-zinc-400 pt-1">
                ✓ Comprobante electrónico despachado al chat de <strong>{paymentReceipt.locker.sellerName}</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCloseAllModals}
              className="w-full rounded-2xl bg-emerald-500 py-3.5 font-display text-xs font-bold text-black hover:bg-emerald-400 transition-all shadow-md"
            >
              ✓ Confirmar Retiro y Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
