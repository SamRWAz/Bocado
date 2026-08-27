import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AuthUser, Session, UserRole } from '../types'
import { loginAccount, logoutAccount, registerAccount, restoreSession, updateAccount } from '../lib/auth'

type AuthContextValue = {
  session: Session | null
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (input: {
    name: string
    email: string
    password: string
    campus: string
    role: UserRole
  }) => Promise<void>
  updateProfile: (user: AuthUser) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    void restoreSession().then((next) => {
      if (active) {
        setSession(next)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      login: async (email, password) => {
        setSession(await loginAccount(email, password))
      },
      register: async (input) => {
        setSession(await registerAccount(input))
      },
      updateProfile: async (user) => {
        const next = await updateAccount(user)
        if (next) setSession(next)
      },
      logout: async () => {
        await logoutAccount()
        setSession(null)
      },
    }),
    [loading, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}

export function canSell(role?: UserRole) {
  return role === 'vender' || role === 'ambos' || role === 'admin'
}

export function canBuy(role?: UserRole) {
  return role === 'comprar' || role === 'ambos' || role === 'admin'
}

export function isAdmin(role?: UserRole) {
  return role === 'admin'
}
