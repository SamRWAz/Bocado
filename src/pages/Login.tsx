import { Bike, ChefHat, ShoppingBag, Sparkles, UserCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { PageTransition } from '../components/PageTransition'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { inputClass, labelClass } from '../lib/constants'
import type { UserRole } from '../types'

export function LoginPage() {
  const { login, loginDemo } = useAuth()
  const { success, bonus } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/catalogo'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      success('¡Sesión iniciada con éxito!')
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo entrar')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoAccess = async (role: UserRole, label: string) => {
    setLoading(true)
    try {
      await loginDemo(role)
      bonus(`¡Bienvenido(a) ${label}!`, 'Acceso verificado para pruebas de rol.')
      const target =
        from && from !== '/'
          ? from
          : role === 'vender' || role === 'comprar_vender' || role === 'ambos'
          ? '/vender'
          : role === 'entregar'
          ? '/entregas'
          : '/catalogo'
      navigate(target, { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 dark:bg-red-950/80 px-3 py-1 text-xs font-mono font-bold text-[#8F1414] dark:text-red-300">
            <Sparkles size={12} /> Comunidad Universitaria
          </span>
          <h1 className="mt-3 font-display text-4xl font-black text-foreground sm:text-5xl">
            Tu cuenta en <span className="text-[#8F1414] dark:text-red-400">Bocado</span>.
          </h1>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
            Compra snacks directos de estudiantes, realiza domicilios independientes como Tendedero o comercializa tus preparaciones gastronómicas.
          </p>

          {/* 1-Click Interactive Demo Access for testing */}
          <div className="mt-8 rounded-3xl border border-primary/20 bg-primary/5 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-primary">
              <Sparkles size={14} />
              <span>Roles Oficiales de la Plataforma (1-Click)</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Selecciona tu rol para acceder con permisos delimitados:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleDemoAccess('comprar', 'Sofía (Comprar)')}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card hover:bg-secondary p-2.5 text-xs font-bold text-foreground transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <UserCheck size={14} className="text-primary" />
                <span>1. Comprar</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoAccess('vender', 'Valentina (Vender)')}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card hover:bg-secondary p-2.5 text-xs font-bold text-foreground transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <ChefHat size={14} className="text-amber-600 dark:text-amber-400" />
                <span>2. Vender</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoAccess('comprar_vender', 'Alejandro (Comprar y Vender)')}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card hover:bg-secondary p-2.5 text-xs font-bold text-foreground transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <ShoppingBag size={14} className="text-blue-600 dark:text-blue-400" />
                <span>3. Comprar y Vender</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoAccess('entregar', 'Mateo (Entregar)')}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card hover:bg-secondary p-2.5 text-xs font-bold text-foreground transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <Bike size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>4. Entregar (Domiciliario)</span>
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={(e) => void onSubmit(e)} className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl">
          <h2 className="font-display text-2xl font-bold">Iniciar sesión</h2>
          <div className="mt-6 space-y-4">
            <div>
              <label className={labelClass} htmlFor="email">
                Correo Universitario
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="tu@u.icesi.edu.co"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          {error && <p className="mt-4 text-xs font-medium text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-2xl bg-primary hover:bg-[#751010] py-3.5 font-display font-bold text-white shadow-md active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Entrando...' : 'Entrar a Bocado'}
          </button>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            ¿Aún no tienes cuenta?{' '}
            <Link to="/registro" className="font-bold text-primary hover:underline">
              Crear cuenta en campus
            </Link>
          </p>
        </form>
      </div>
    </PageTransition>
  )
}
