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
  const [role, setRole] = useState<UserRole>('comprador')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({ name, email, password, campus, role })
      if (role === 'vendedor') {
        navigate('/vender')
      } else if (role === 'domiciliario') {
        navigate('/entregas')
      } else {
        navigate('/catalogo')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <form onSubmit={(e) => void onSubmit(e)} className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl">
        <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">Crear cuenta en Bocado</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Elige tu rol: Comprador, Vendedor o Domiciliario.
        </p>
        <div className="mt-6 space-y-4">
          <div>
            <label className={labelClass} htmlFor="name">
              Nombre Completo
            </label>
            <input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="Ej. Juan Pérez"
            />
          </div>
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="campus">
                Campus Universitario
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
                Rol en la Plataforma
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className={`${inputClass} font-semibold`}
              >
                <option value="comprador">🛍️ Comprador (Pedir snacks)</option>
                <option value="vendedor">👨‍🍳 Vendedor (Cocinar y vender)</option>
                <option value="domiciliario">🛵 Domiciliario (Hacer entregas)</option>
              </select>
            </div>
          </div>
        </div>
        {error && <p className="mt-4 text-sm font-semibold text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-2xl bg-primary hover:bg-[#751010] py-3.5 font-display font-bold text-white shadow-md active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </button>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Iniciar Sesión
          </Link>
        </p>
      </form>
    </div>
  )
}
