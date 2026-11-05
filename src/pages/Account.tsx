import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { CAMPUSES, inputClass, labelClass } from '../lib/constants'
import type { UserRole } from '../types'

export function AccountPage() {
  const { user, updateProfile, logout } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [campus, setCampus] = useState(user?.campus ?? CAMPUSES[0])
  const [role, setRole] = useState<UserRole>(user?.role ?? 'comprador')
  const [saved, setSaved] = useState(false)

  if (!user) return null

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    await updateProfile({ ...user, name, campus, role })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-8">
      <h1 className="font-display text-3xl font-black text-foreground">Tu Perfil en Bocado</h1>
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div>
          <label className={labelClass}>Nombre Completo</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Campus Universitario</label>
          <select
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
          <label className={labelClass}>Rol en la Plataforma</label>
          <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className={`${inputClass} font-semibold`}>
            <option value="comprador">🛍️ Comprador (Pedir snacks en el campus)</option>
            <option value="vendedor">👨‍🍳 Vendedor (Cocinar y vender mis preparaciones)</option>
            <option value="domiciliario">🛵 Domiciliario (Realizar entregas entre clases)</option>
          </select>
        </div>
        {saved && (
          <p className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
            ✓ Cambios guardados con éxito
          </p>
        )}
        <button type="submit" className="w-full rounded-2xl bg-primary hover:bg-[#751010] py-3.5 font-display font-bold text-white shadow-md active:scale-95 transition-all cursor-pointer">
          Guardar Cambios
        </button>
      </form>
      <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
        <span>{user.email}</span>
        <button type="button" onClick={() => void logout()} className="font-bold text-destructive hover:underline cursor-pointer">
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}
