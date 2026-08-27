import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { CAMPUSES, inputClass, labelClass } from '../lib/constants'
import type { UserRole } from '../types'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [campus, setCampus] = useState<(typeof CAMPUSES)[number]>(CAMPUSES[0])
  const [role, setRole] = useState<UserRole>('ambos')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({ name, email, password, campus, role })
      navigate('/catalogo')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
        <form onSubmit={(e) => void onSubmit(e)} className="rounded-lg border border-border bg-card p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold">Crear cuenta</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Compra, vende o las dos.
          </p>
          <div className="mt-6 space-y-4">
            <div>
              <label className={labelClass} htmlFor="name">
                Nombre
              </label>
              <input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="Así te verán las personas en la app si eres vendedor o comprador"
              />
            </div>
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="campus">
                  Campus
                </label>
                <select
                  id="campus"
                  value={campus}
                  onChange={(e) => setCampus(e.target.value as (typeof CAMPUSES)[number])}
                  className={inputClass}
                >
                  {CAMPUSES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="role">
                  Quiero
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className={inputClass}
                >
                  <option value="ambos">Comprar y vender</option>
                  <option value="comprar">Solo comprar</option>
                  <option value="vender">Solo vender</option>
                </select>
              </div>
            </div>
          </div>
          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-primary py-3 font-display font-bold text-primary-foreground disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Crear cuenta'}
          </button>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary">
              Entrar
            </Link>
          </p>
        </form>
    </div>
  )
}
