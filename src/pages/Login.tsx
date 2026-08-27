import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { PublicFooter, PublicHeader } from '../components/layout/PublicChrome'
import { useAuth } from '../context/AuthContext'
import { inputClass, labelClass } from '../lib/constants'

export function LoginPage() {
  const { login } = useAuth()
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
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo entrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2">
        <div className="hidden lg:block">
          <p className="text-sm text-primary">Sesión con JWT</p>
          <h1 className="mt-2 font-display text-4xl font-bold">Entra a comprar o a vender comida en el campus.</h1>
          <p className="mt-4 text-muted-foreground">
            Tu sesión se firma con JWT. Si Supabase confirma el correo, usamos ese token; si no, te
            dejamos entrar igual para que el equipo pueda probar la app.
          </p>
        </div>
        <form onSubmit={(e) => void onSubmit(e)} className="rounded-lg border border-border bg-card p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold">Iniciar sesión</h2>
          <div className="mt-6 space-y-4">
            <div>
              <label className={labelClass} htmlFor="email">
                Correo
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="tu@universidad.edu"
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
          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-primary py-3 font-display font-bold text-primary-foreground disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            ¿Aún no tienes cuenta?{' '}
            <Link to="/registro" className="text-primary">
              Crear cuenta
            </Link>
          </p>
        </form>
      </div>
      <PublicFooter />
    </div>
  )
}
