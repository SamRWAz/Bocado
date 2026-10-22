import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Sparkles,
  X,
} from 'lucide-react'
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { playKeyBeep, playPaymentSuccess } from '../lib/sounds'

export type ToastType = 'success' | 'info' | 'bonus' | 'error'

export type ToastMessage = {
  id: string
  title: string
  message?: string
  type?: ToastType
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

type ToastContextValue = {
  toast: (opts: Omit<ToastMessage, 'id'>) => void
  success: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
  bonus: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    ({ title, message, type = 'info', duration = 3800, action }: Omit<ToastMessage, 'id'>) => {
      const id = crypto.randomUUID()
      if (type === 'success' || type === 'bonus') {
        playPaymentSuccess()
      } else {
        playKeyBeep(700)
      }

      const item: ToastMessage = { id, title, message, type, duration, action }
      setToasts((prev) => [...prev.slice(-3), item]) // Keep at most 4 toasts

      if (duration > 0) {
        window.setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [removeToast],
  )

  const success = useCallback(
    (title: string, message?: string) => toast({ title, message, type: 'success' }),
    [toast],
  )
  const info = useCallback(
    (title: string, message?: string) => toast({ title, message, type: 'info' }),
    [toast],
  )
  const bonus = useCallback(
    (title: string, message?: string) => toast({ title, message, type: 'bonus' }),
    [toast],
  )
  const error = useCallback(
    (title: string, message?: string) => toast({ title, message, type: 'error' }),
    [toast],
  )

  return (
    <ToastContext.Provider value={{ toast, success, info, bonus, error }}>
      {children}
      {/* Toast floating container */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed top-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2.5 px-4 sm:px-0"
      >
        <AnimatePresence>
          {toasts.map((t) => {
            const isSuccess = t.type === 'success'
            const isBonus = t.type === 'bonus'
            const isError = t.type === 'error'

            const borderColors = isBonus
              ? 'border-amber-400/80 bg-amber-50/95 dark:bg-amber-950/90 text-amber-950 dark:text-amber-100'
              : isSuccess
              ? 'border-emerald-500/80 bg-emerald-50/95 dark:bg-emerald-950/90 text-emerald-950 dark:text-emerald-100'
              : isError
              ? 'border-rose-500/80 bg-rose-50/95 dark:bg-rose-950/90 text-rose-950 dark:text-rose-100'
              : 'border-border bg-card/95 text-foreground'

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: -16, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-3.5 shadow-xl backdrop-blur-md ${borderColors}`}
              >
                <div className="mt-0.5 shrink-0">
                  {isBonus && <Sparkles size={18} className="text-amber-500 animate-spin" />}
                  {isSuccess && <CheckCircle2 size={18} className="text-emerald-500" />}
                  {isError && <AlertCircle size={18} className="text-rose-500" />}
                  {!isBonus && !isSuccess && !isError && <Info size={18} className="text-primary" />}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-bold text-xs sm:text-sm leading-tight">
                    {t.title}
                  </h4>
                  {t.message && (
                    <p className="mt-0.5 text-xs opacity-90 leading-relaxed font-body">
                      {t.message}
                    </p>
                  )}
                  {t.action && (
                    <button
                      type="button"
                      onClick={() => {
                        t.action?.onClick()
                        removeToast(t.id)
                      }}
                      className="mt-2 inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:opacity-90 cursor-pointer"
                    >
                      {t.action.label}
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeToast(t.id)}
                  className="shrink-0 rounded-lg p-1 text-muted-foreground hover:text-foreground opacity-70 hover:opacity-100 transition-opacity"
                  aria-label="Cerrar notificación"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider')
  return ctx
}
