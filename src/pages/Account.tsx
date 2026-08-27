import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { CAMPUSES, inputClass, labelClass } from '../lib/constants'
import type { UserRole } from '../types'

export function AccountPage() {
  const { user, session, updateProfile, logout } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [campus, setCampus] = useState(user?.campus ?? CAMPUSES[0])
  const [role, setRole] = useState<UserRole>(user?.role ?? 'ambos')
  const [saved, setSaved] = useState(false)

  if (!user || !session) return null

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    await updateProfile({ ...user, name, campus, role })
    setSaved(true)
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="font-display text-3xl font-bold">Tu cuenta</h1>
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4 rounded-lg border border-border bg-card p-5">
        <div>
          <label className={labelClass}>Nombre</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Campus</label>
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
          <label className={labelClass}>Rol</label>
          <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className={inputClass}>
            <option value="ambos">Comprar y vender</option>
            <option value="comprar">Solo comprar</option>
            <option value="vender">Solo vender</option>
          </select>
        </div>
        {saved && <p className="text-sm text-primary">Cambios guardados</p>}
        <button type="submit" className="w-full rounded-lg bg-primary py-3 font-display font-bold text-primary-foreground">
          Guardar
        </button>
      </form>
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-xs text-muted-foreground">JWT de sesión ({session.source})</p>
        <p className="mt-2 break-all font-mono text-[11px] text-muted-foreground">{session.token}</p>
      </div>
      <p className="text-sm text-muted-foreground">{user.email}</p>
      <button type="button" onClick={() => void logout()} className="text-sm text-destructive">
        Cerrar sesión
      </button>
    </div>
  )
}
