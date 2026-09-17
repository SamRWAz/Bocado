import type { Locker, LockerHub } from '../types'
import { supabase } from './supabase'

const LOCKER_STORAGE_KEY = 'bocado.smart_lockers'
const BUCKET = 'product-images'
const LOCKER_BROADCAST_CHANNEL = 'bocado_lockers_channel'

export const LOCKER_HUBS: LockerHub[] = [
  {
    id: 'hub_edificio_d',
    name: 'Hub Central Edificio D',
    zone: 'Edificio D · Plazoleta Central (Piso 1)',
    detail: 'Vitrina Inteligente Principal · Climatizada con control térmico',
    icon: '⚡',
    totalLockers: 8,
    isOnline: true,
  },
  {
    id: 'hub_saman',
    name: 'Hub Plazoleta Samán',
    zone: 'Plazoleta Samán · Cerca a las mesas de estudio',
    detail: 'Vitrina Express · Ideal para recesos rápidos y postres',
    icon: '🌳',
    totalLockers: 6,
    isOnline: true,
  },
  {
    id: 'hub_biblioteca',
    name: 'Hub Biblioteca Central',
    zone: 'Biblioteca Central · Entrada Principal (Piso 1)',
    detail: 'Vitrina Silenciosa 24/7 · Snacks y bebidas refrigeradas',
    icon: '📚',
    totalLockers: 6,
    isOnline: true,
  },
]

export function getLockerHubs(): LockerHub[] {
  return LOCKER_HUBS
}

export function getInitialLockers(): Locker[] {
  const now = new Date().toISOString()
  return [
    // Hub Edificio D (8 lockers)
    {
      id: 'lck_d_01',
      hubId: 'hub_edificio_d',
      hubName: 'Hub Central Edificio D',
      number: '01',
      code: 'D-01',
      status: 'disponible',
      tempType: 'ambiente',
      isLocked: true,
      updatedAt: now,
    },
    {
      id: 'lck_d_02',
      hubId: 'hub_edificio_d',
      hubName: 'Hub Central Edificio D',
      number: '02',
      code: 'D-02',
      status: 'listo_para_retiro',
      tempType: 'ambiente',
      productId: 'demo_brownie_1',
      productName: 'Brownie Melcochudo con Nueces',
      productPrice: 3500,
      productImage: '/images/snack_anime_brownie.jpg',
      sellerId: 'valeria',
      sellerName: 'Valeria M.',
      buyerId: 'demo_buyer',
      buyerName: 'Comprador Demo',
      claimPin: '7492',
      depositPin: 'DEP-1021',
      orderId: 'demo_ord_1',
      isLocked: true,
      updatedAt: now,
    },
    {
      id: 'lck_d_03',
      hubId: 'hub_edificio_d',
      hubName: 'Hub Central Edificio D',
      number: '03',
      code: 'D-03',
      status: 'esperando_deposito',
      tempType: 'refrigerado',
      productId: 'demo_parfait_1',
      productName: 'Parfait de Frutos Rojos y Chía',
      productPrice: 5000,
      productImage: '/images/snack_anime_parfait.jpg',
      sellerId: 'carlos',
      sellerName: 'Carlos R.',
      depositPin: 'DEP-8390',
      isLocked: true,
      updatedAt: now,
    },
    {
      id: 'lck_d_04',
      hubId: 'hub_edificio_d',
      hubName: 'Hub Central Edificio D',
      number: '04',
      code: 'D-04',
      status: 'listo_para_retiro',
      tempType: 'ambiente',
      productId: 'demo_empanadas_1',
      productName: 'Empanadas de Pollo y Champiñones (x2)',
      productPrice: 4000,
      productImage: '/images/snack_anime_empanadas.jpg',
      sellerId: 'lucia',
      sellerName: 'Lucía D.',
      claimPin: '3184',
      depositPin: 'DEP-4491',
      isLocked: true,
      updatedAt: now,
    },
    {
      id: 'lck_d_05',
      hubId: 'hub_edificio_d',
      hubName: 'Hub Central Edificio D',
      number: '05',
      code: 'D-05',
      status: 'disponible',
      tempType: 'ambiente',
      isLocked: true,
      updatedAt: now,
    },
    {
      id: 'lck_d_06',
      hubId: 'hub_edificio_d',
      hubName: 'Hub Central Edificio D',
      number: '06',
      code: 'D-06',
      status: 'disponible',
      tempType: 'refrigerado',
      isLocked: true,
      updatedAt: now,
    },
    {
      id: 'lck_d_07',
      hubId: 'hub_edificio_d',
      hubName: 'Hub Central Edificio D',
      number: '07',
      code: 'D-07',
      status: 'disponible',
      tempType: 'ambiente',
      isLocked: true,
      updatedAt: now,
    },
    {
      id: 'lck_d_08',
      hubId: 'hub_edificio_d',
      hubName: 'Hub Central Edificio D',
      number: '08',
      code: 'D-08',
      status: 'disponible',
      tempType: 'ambiente',
      isLocked: true,
      updatedAt: now,
    },

    // Hub Samán (6 lockers)
    {
      id: 'lck_s_01',
      hubId: 'hub_saman',
      hubName: 'Hub Plazoleta Samán',
      number: '01',
      code: 'S-01',
      status: 'listo_para_retiro',
      tempType: 'ambiente',
      productId: 'demo_galletas_1',
      productName: 'Galletas de Avena y Chocolate Chips (x3)',
      productPrice: 3000,
      productImage: '/images/snack_anime_cookies.jpg',
      sellerId: 'andres',
      sellerName: 'Andrés P.',
      claimPin: '5820',
      depositPin: 'DEP-9023',
      isLocked: true,
      updatedAt: now,
    },
    {
      id: 'lck_s_02',
      hubId: 'hub_saman',
      hubName: 'Hub Plazoleta Samán',
      number: '02',
      code: 'S-02',
      status: 'disponible',
      tempType: 'ambiente',
      isLocked: true,
      updatedAt: now,
    },
    {
      id: 'lck_s_03',
      hubId: 'hub_saman',
      hubName: 'Hub Plazoleta Samán',
      number: '03',
      code: 'S-03',
      status: 'disponible',
      tempType: 'ambiente',
      isLocked: true,
      updatedAt: now,
    },
    {
      id: 'lck_s_04',
      hubId: 'hub_saman',
      hubName: 'Hub Plazoleta Samán',
      number: '04',
      code: 'S-04',
      status: 'disponible',
      tempType: 'ambiente',
      isLocked: true,
      updatedAt: now,
    },
    {
      id: 'lck_s_05',
      hubId: 'hub_saman',
      hubName: 'Hub Plazoleta Samán',
      number: '05',
      code: 'S-05',
      status: 'disponible',
      tempType: 'refrigerado',
      isLocked: true,
      updatedAt: now,
    },
    {
      id: 'lck_s_06',
      hubId: 'hub_saman',
      hubName: 'Hub Plazoleta Samán',
      number: '06',
      code: 'S-06',
      status: 'disponible',
      tempType: 'ambiente',
      isLocked: true,
      updatedAt: now,
    },

    // Hub Biblioteca (6 lockers)
    {
      id: 'lck_b_01',
      hubId: 'hub_biblioteca',
      hubName: 'Hub Biblioteca Central',
      number: '01',
      code: 'B-01',
      status: 'disponible',
      tempType: 'ambiente',
      isLocked: true,
      updatedAt: now,
    },
    {
      id: 'lck_b_02',
      hubId: 'hub_biblioteca',
      hubName: 'Hub Biblioteca Central',
      number: '02',
      code: 'B-02',
      status: 'disponible',
      tempType: 'refrigerado',
      isLocked: true,
      updatedAt: now,
    },
    {
      id: 'lck_b_03',
      hubId: 'hub_biblioteca',
      hubName: 'Hub Biblioteca Central',
      number: '03',
      code: 'B-03',
      status: 'disponible',
      tempType: 'ambiente',
      isLocked: true,
      updatedAt: now,
    },
    {
      id: 'lck_b_04',
      hubId: 'hub_biblioteca',
      hubName: 'Hub Biblioteca Central',
      number: '04',
      code: 'B-04',
      status: 'disponible',
      tempType: 'ambiente',
      isLocked: true,
      updatedAt: now,
    },
    {
      id: 'lck_b_05',
      hubId: 'hub_biblioteca',
      hubName: 'Hub Biblioteca Central',
      number: '05',
      code: 'B-05',
      status: 'disponible',
      tempType: 'ambiente',
      isLocked: true,
      updatedAt: now,
    },
    {
      id: 'lck_b_06',
      hubId: 'hub_biblioteca',
      hubName: 'Hub Biblioteca Central',
      number: '06',
      code: 'B-06',
      status: 'disponible',
      tempType: 'refrigerado',
      isLocked: true,
      updatedAt: now,
    },
  ]
}

export function readLocalLockers(): Locker[] {
  try {
    const raw = localStorage.getItem(LOCKER_STORAGE_KEY)
    if (!raw) {
      const initial = getInitialLockers()
      saveLocalLockers(initial, false)
      return initial
    }
    const parsed = JSON.parse(raw) as Locker[]
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : getInitialLockers()
  } catch {
    return getInitialLockers()
  }
}

export function saveLocalLockers(lockers: Locker[], broadcast = true) {
  try {
    localStorage.setItem(LOCKER_STORAGE_KEY, JSON.stringify(lockers))
  } catch {
    // Ignore
  }
  if (broadcast) {
    notifyLockerSync(lockers)
  }
}

function notifyLockerSync(lockers: Locker[]) {
  try {
    const channel = new BroadcastChannel(LOCKER_BROADCAST_CHANNEL)
    channel.postMessage({ type: 'lockers_updated', count: lockers.length })
    channel.close()
  } catch {
    // Fallback
  }
  window.dispatchEvent(new CustomEvent('bocado_lockers_sync'))
}

export function subscribeToLockerUpdates(callback: () => void): () => void {
  let channel: BroadcastChannel | null = null
  try {
    channel = new BroadcastChannel(LOCKER_BROADCAST_CHANNEL)
    channel.onmessage = () => callback()
  } catch {
    // Fallback
  }

  const handleCustomEvent = () => callback()
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === LOCKER_STORAGE_KEY) callback()
  }

  window.addEventListener('bocado_lockers_sync', handleCustomEvent)
  window.addEventListener('storage', handleStorageEvent)

  return () => {
    channel?.close()
    window.removeEventListener('bocado_lockers_sync', handleCustomEvent)
    window.removeEventListener('storage', handleStorageEvent)
  }
}

export function getAllLockers(): Locker[] {
  return readLocalLockers()
}

export function getLockersByHub(hubId: string): Locker[] {
  return readLocalLockers().filter((l) => l.hubId === hubId)
}

export function getLockerById(lockerId: string): Locker | null {
  return readLocalLockers().find((l) => l.id === lockerId) ?? null
}

export function getLockerByCode(code: string): Locker | null {
  const norm = code.trim().toUpperCase()
  return readLocalLockers().find((l) => l.code.toUpperCase() === norm) ?? null
}

export function getLockerByClaimPin(pin: string): Locker | null {
  const norm = pin.trim()
  if (!norm) return null
  return readLocalLockers().find((l) => l.claimPin === norm && l.status === 'listo_para_retiro') ?? null
}

export function getLockerByDepositPin(pin: string): Locker | null {
  const norm = pin.trim().toUpperCase()
  if (!norm) return null
  return (
    readLocalLockers().find(
      (l) => l.depositPin?.toUpperCase() === norm && l.status === 'esperando_deposito',
    ) ?? null
  )
}

/**
 * Assign and reserve an available locker for a product order or seller deposit
 */
export function assignLocker(params: {
  hubId: string
  productId?: string
  productName: string
  productPrice: number
  productImage?: string | null
  sellerId: string
  sellerName: string
  buyerId?: string
  buyerName?: string
  orderId?: string
  preferredLockerId?: string
}): { locker: Locker; depositPin: string; claimPin: string } {
  const all = readLocalLockers()

  let targetIndex = -1
  if (params.preferredLockerId) {
    targetIndex = all.findIndex(
      (l) => l.id === params.preferredLockerId && l.status === 'disponible',
    )
  }
  if (targetIndex === -1) {
    targetIndex = all.findIndex((l) => l.hubId === params.hubId && l.status === 'disponible')
  }
  if (targetIndex === -1) {
    // If hub is full, find any available locker in other hubs
    targetIndex = all.findIndex((l) => l.status === 'disponible')
  }

  if (targetIndex === -1) {
    throw new Error('Todos los casilleros de la vitrina están ocupados en este momento.')
  }

  const depositPin = `DEP-${Math.floor(1000 + Math.random() * 9000)}`
  const claimPin = `${Math.floor(1000 + Math.random() * 9000)}`

  const updated: Locker = {
    ...all[targetIndex],
    status: 'esperando_deposito',
    productId: params.productId,
    productName: params.productName,
    productPrice: params.productPrice,
    productImage: params.productImage,
    sellerId: params.sellerId,
    sellerName: params.sellerName,
    buyerId: params.buyerId,
    buyerName: params.buyerName,
    depositPin,
    claimPin,
    orderId: params.orderId,
    isLocked: true,
    updatedAt: new Date().toISOString(),
  }

  all[targetIndex] = updated
  saveLocalLockers(all)

  return { locker: updated, depositPin, claimPin }
}

/**
 * Seller inputs Deposit PIN at the physical/virtual locker to deposit food
 */
export function depositInLocker(depositPin: string): { success: boolean; locker?: Locker; message: string } {
  const norm = depositPin.trim().toUpperCase()
  const all = readLocalLockers()
  const idx = all.findIndex(
    (l) => l.depositPin?.toUpperCase() === norm && l.status === 'esperando_deposito',
  )

  if (idx === -1) {
    return { success: false, message: 'Código de depósito incorrecto o ya utilizado.' }
  }

  const locker = all[idx]
  const updated: Locker = {
    ...locker,
    status: 'listo_para_retiro',
    isLocked: true,
    updatedAt: new Date().toISOString(),
  }

  all[idx] = updated
  saveLocalLockers(all)

  // Remote backup sync
  void uploadLockerRemote(updated)

  return {
    success: true,
    locker: updated,
    message: `¡Comida depositada con éxito en Casillero #${locker.code}! Ya está listo para retiro.`,
  }
}

/**
 * Buyer inputs Claim PIN or scans QR to unlock locker door
 */
export function unlockLockerWithPin(
  pin: string,
): { success: boolean; locker?: Locker; message: string } {
  const norm = pin.trim()
  const all = readLocalLockers()

  // Match claimPin or direct locker code override for testing
  const idx = all.findIndex(
    (l) =>
      (l.claimPin === norm || l.depositPin?.toUpperCase() === norm.toUpperCase()) &&
      (l.status === 'listo_para_retiro' || l.status === 'esperando_deposito'),
  )

  if (idx === -1) {
    return {
      success: false,
      message: 'PIN incorrecto o no se encontró ningún casillero activo con este código.',
    }
  }

  const locker = all[idx]
  const updated: Locker = {
    ...locker,
    status: 'abierto',
    isLocked: false,
    updatedAt: new Date().toISOString(),
  }

  all[idx] = updated
  saveLocalLockers(all)

  // Remote backup sync
  void uploadLockerRemote(updated)

  return {
    success: true,
    locker: updated,
    message: `¡Casillero #${locker.code} Abierto! Retira tu ${locker.productName || 'snack'}.`,
  }
}

/**
 * Generate numeric or alphanumeric PIN
 */
export function generatePin(length = 4): string {
  const digits = '0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += digits.charAt(Math.floor(Math.random() * digits.length))
  }
  return result
}

/**
 * Reset/Close an open locker after the user retrieves their snack
 */
export function closeAndResetLocker(lockerId: string): Locker | null {
  const all = readLocalLockers()
  const idx = all.findIndex((l) => l.id === lockerId)
  if (idx === -1) return null

  const updated: Locker = {
    ...all[idx],
    status: 'disponible',
    productId: undefined,
    productName: undefined,
    productPrice: undefined,
    productImage: undefined,
    sellerId: undefined,
    sellerName: undefined,
    buyerId: undefined,
    buyerName: undefined,
    depositPin: undefined,
    claimPin: undefined,
    orderId: undefined,
    isLocked: true,
    updatedAt: new Date().toISOString(),
  }

  all[idx] = updated
  saveLocalLockers(all)
  void uploadLockerRemote(updated)

  return updated
}

async function uploadLockerRemote(locker: Locker) {
  try {
    const file = new Blob([JSON.stringify(locker)], { type: 'application/json' })
    await supabase.storage.from(BUCKET).upload(`locker-${locker.id}.json`, file, {
      contentType: 'application/json',
      upsert: true,
    })
  } catch {
    // Local fallback is completely functional
  }
}
