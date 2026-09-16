import type { DietaryTag, SellerPresence } from '../types'

export const ICESI_ZONES = [
  'Edificio D (Plazoleta / Pisos)',
  'El Samán',
  'Biblioteca Central',
  'Cafetería Central',
  'Edificio E (Ingeniería)',
  'Plazoleta Las Palmas',
  'Edificio C (Aulas)',
  'Edificio F',
  'Portería Principal',
  'Canchas y Zona Deportiva',
] as const

export const DIETARY_OPTIONS: { id: DietaryTag; label: string; icon: string; shortLabel: string }[] = [
  { id: 'vegano', label: '100% Vegano', shortLabel: 'Vegano', icon: '🌱' },
  { id: 'vegetariano', label: 'Vegetariano', shortLabel: 'Vegetariano', icon: '🥬' },
  { id: 'sin-gluten', label: 'Sin Gluten (Gluten Free)', shortLabel: 'Sin Gluten', icon: '🌾' },
  { id: 'fit-proteico', label: 'Fit & Alto en Proteína', shortLabel: 'Fit / Proteína', icon: '⚡' },
  { id: 'sin-azucar', label: 'Sin Azúcar Añadida', shortLabel: 'Sin Azúcar', icon: '🍯' },
  { id: 'keto', label: 'Keto Friendly', shortLabel: 'Keto', icon: '🥑' },
  { id: 'contiene-nueces', label: 'Contiene Maní / Nueces', shortLabel: 'Frutos Secos', icon: '🥜' },
  { id: 'sin-lactosa', label: 'Sin Lactosa', shortLabel: 'Sin Lactosa', icon: '🥛' },
]

export const PRESENCE_DURATIONS = [
  { label: '15 minutos (Descanso corto)', value: '15 min' },
  { label: '30 minutos (Receso)', value: '30 min' },
  { label: '1 hora (Hueco entre clases)', value: '1 hora' },
  { label: '2 horas', value: '2 horas' },
  { label: 'Todo el día', value: 'Hoy' },
] as const

const PRESENCE_STORAGE_KEY = 'bocado.seller_presences'

export function getAllSellerPresences(): Record<string, SellerPresence> {
  try {
    const raw = localStorage.getItem(PRESENCE_STORAGE_KEY)
    if (!raw) return getDefaultPresences()
    return JSON.parse(raw) as Record<string, SellerPresence>
  } catch {
    return getDefaultPresences()
  }
}

export function getSellerPresence(sellerKeyOrId: string): SellerPresence | null {
  const all = getAllSellerPresences()
  // Search by exact key or by seller ID suffix
  if (all[sellerKeyOrId]) return all[sellerKeyOrId]
  const entry = Object.entries(all).find(([k]) => k.includes(sellerKeyOrId) || sellerKeyOrId.includes(k))
  return entry ? entry[1] : null
}

export function saveSellerPresence(sellerKey: string, presence: SellerPresence): void {
  const all = getAllSellerPresences()
  all[sellerKey] = presence
  localStorage.setItem(PRESENCE_STORAGE_KEY, JSON.stringify(all))
  
  // Notify tabs
  try {
    const channel = new BroadcastChannel('bocado_presence_sync')
    channel.postMessage({ type: 'presence_updated', sellerKey, presence })
    channel.close()
  } catch {
    // Ignore if not supported
  }
}

function getDefaultPresences(): Record<string, SellerPresence> {
  return {
    'Mi Puesto': {
      sellerId: 'Mi Puesto',
      sellerName: 'Mi Puesto (Campus)',
      zone: 'Edificio D (Plazoleta / Pisos)',
      detail: 'Piso 2 frente a las salas de estudio',
      activeUntil: '12:30 PM',
      isOnline: true,
      updatedAt: new Date().toISOString(),
    },
    'valeria': {
      sellerId: 'valeria',
      sellerName: 'Valeria M.',
      zone: 'Edificio D (Plazoleta / Pisos)',
      detail: 'Piso 2 frente a las salas de estudio',
      activeUntil: '11:30 AM',
      isOnline: true,
      updatedAt: new Date().toISOString(),
    },
    'camilo': {
      sellerId: 'camilo',
      sellerName: 'Camilo R.',
      zone: 'El Samán',
      detail: 'Bancas bajo la sombra con termo azul',
      activeUntil: '1:00 PM',
      isOnline: true,
      updatedAt: new Date().toISOString(),
    },
    'sofia': {
      sellerId: 'sofia',
      sellerName: 'Sofía G.',
      zone: 'Edificio E (Ingeniería)',
      detail: 'Piso 1 mesas exteriores',
      activeUntil: '12:15 PM',
      isOnline: true,
      updatedAt: new Date().toISOString(),
    },
    'andres': {
      sellerId: 'andres',
      sellerName: 'Andrés V.',
      zone: 'Biblioteca Central',
      detail: 'Mesas del primer piso',
      activeUntil: '3:00 PM',
      isOnline: true,
      updatedAt: new Date().toISOString(),
    },
  }
}
