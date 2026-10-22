import type { AuthUser, Session, UserRole } from '../types'
import { SESSION_KEY } from './constants'
import { hashPassword } from './hash'
import { signJwt, verifyJwt } from './jwt'
import { findStoredUser, saveStoredUser } from './storage-db'
import { supabase } from './supabase'

export const ROLES: UserRole[] = ['comprar_vender', 'comprar', 'vender', 'entregar', 'admin']

export const normalizeRole = (role?: string): UserRole => {
  const r = (role || '').trim().toLowerCase()
  if (
    r === 'comprar_vender' ||
    r === 'ambos' ||
    r === 'ambos roles' ||
    r === 'comprar y vender' ||
    r === 'comprar_y_vender'
  ) {
    return 'comprar_vender'
  }
  if (r === 'comprar' || r === 'comprador') return 'comprar'
  if (r === 'vender' || r === 'vendedor') return 'vender'
  if (r === 'entregar' || r === 'tendedero' || r === 'repartidor') return 'entregar'
  if (r === 'admin' || r === 'administrador') return 'admin'
  return 'comprar'
}

const asUser = (input: {
  id: string
  email: string
  name?: string
  campus?: string
  role?: string
}): AuthUser => ({
  id: input.id,
  email: input.email,
  name: input.name?.trim() || input.email.split('@')[0] || 'Bocado',
  campus: input.campus?.trim() || 'Icesi',
  role: normalizeRole(input.role),
})

const persist = (session: Session) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

const createLocalSession = async (user: AuthUser): Promise<Session> => {
  const token = await signJwt({
    sub: user.id,
    email: user.email,
    name: user.name,
    campus: user.campus,
    role: user.role,
  })
  const payload = await verifyJwt<{ exp: number }>(token)
  return persist({
    token,
    user,
    expiresAt: (payload?.exp ?? 0) * 1000,
    source: 'local',
  })
}

export function readSession(): Session | null {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    const session = JSON.parse(raw) as Session
    if (session.expiresAt < Date.now()) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return session
  } catch {
    return null
  }
}

export async function restoreSession(): Promise<Session | null> {
  const local = readSession()
  if (local) {
    if (local.source === 'local') {
      const valid = await verifyJwt(local.token)
      if (!valid) return null
    }
    if (local.user) {
      local.user.role = normalizeRole(local.user.role)
    }
    return local
  }

  const { data } = await supabase.auth.getSession()
  const user = data.session?.user
  if (!user?.email || !data.session) return null
  const meta = user.user_metadata ?? {}
  return persist({
    token: data.session.access_token,
    user: asUser({
      id: user.id,
      email: user.email,
      name: meta.name,
      campus: meta.campus,
      role: meta.role,
    }),
    expiresAt: (data.session.expires_at ?? 0) * 1000,
    source: 'supabase',
  })
}

export async function registerAccount(input: {
  name: string
  email: string
  password: string
  campus: string
  role: UserRole
}) {
  const email = input.email.trim().toLowerCase()
  if (await findStoredUser(email)) {
    throw new Error('Ya existe una cuenta con ese correo')
  }
  if (input.password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres')
  }

  const user = asUser({
    id: crypto.randomUUID(),
    email,
    name: input.name,
    campus: input.campus,
    role: input.role,
  })

  try {
    await saveStoredUser(
      { ...user, passwordHash: await hashPassword(input.password, user.id) },
      true,
    )
  } catch {
    throw new Error('No se pudo crear la cuenta. Intenta de nuevo.')
  }

  void supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      data: { name: user.name, campus: user.campus, role: user.role },
      emailRedirectTo: `${window.location.origin}/login`,
    },
  })

  return createLocalSession(user)
}

export async function loginAccount(email: string, password: string) {
  const normalized = email.trim().toLowerCase()
  const { data } = await supabase.auth.signInWithPassword({
    email: normalized,
    password,
  })

  if (data.session?.user?.email) {
    const meta = data.session.user.user_metadata ?? {}
    return persist({
      token: data.session.access_token,
      user: asUser({
        id: data.session.user.id,
        email: data.session.user.email,
        name: meta.name,
        campus: meta.campus,
        role: meta.role,
      }),
      expiresAt: (data.session.expires_at ?? 0) * 1000,
      source: 'supabase',
    })
  }

  const stored = await findStoredUser(normalized)
  if (!stored) {
    throw new Error('Correo o contraseña incorrectos')
  }
  const hash = await hashPassword(password, stored.id)
  if (hash !== stored.passwordHash) {
    throw new Error('Correo o contraseña incorrectos')
  }
  return createLocalSession(
    asUser({
      id: stored.id,
      email: stored.email,
      name: stored.name,
      campus: stored.campus,
      role: stored.role,
    }),
  )
}

export async function updateAccount(user: AuthUser) {
  const normalizedUser: AuthUser = {
    ...user,
    role: normalizeRole(user.role),
  }
  const stored = await findStoredUser(user.email)
  if (stored) {
    await saveStoredUser({ ...stored, ...normalizedUser })
  }
  const session = readSession()
  if (!session) return null
  if (session.source === 'local') return createLocalSession(normalizedUser)
  return persist({ ...session, user: normalizedUser })
}

export async function loginDemoUser(role: UserRole = 'comprar') {
  const demos: Record<string, { id: string; name: string; email: string; role: UserRole; campus: string }> = {
    comprar: {
      id: 'demo-buyer-sofia',
      name: 'Sofía Gómez (Compradora)',
      email: 'sofia.gomez@icesi.edu.co',
      role: 'comprar',
      campus: 'Universidad Icesi',
    },
    vender: {
      id: 'demo-seller-valentina',
      name: 'Chef Valentina (Vendedora)',
      email: 'valentina.bocados@icesi.edu.co',
      role: 'vender',
      campus: 'Universidad Icesi',
    },
    comprar_vender: {
      id: 'demo-user-alejandro',
      name: 'Alejandro Campus (Comprar y Vender)',
      email: 'alejandro.demo@icesi.edu.co',
      role: 'comprar_vender',
      campus: 'Universidad Icesi',
    },
    entregar: {
      id: 'demo-tendedero-mateo',
      name: 'Mateo Rivas (Tendedero / Entregar)',
      email: 'mateo.tendedero@icesi.edu.co',
      role: 'entregar',
      campus: 'Universidad Icesi',
    },
  }

  const selected = demos[role] || demos.comprar
  return createLocalSession(asUser(selected))
}

export async function logoutAccount() {
  localStorage.removeItem(SESSION_KEY)
  await supabase.auth.signOut()
}

