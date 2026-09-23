import type { Locker, LockerHub, Order, PaymentMethod } from '../types'
import { sendMessage } from './chat'
import { saveOrder } from './storage-db'
import { supabase } from './supabase'

const LOCKER_STORAGE_KEY = 'bocado.smart_lockers_v2'
const BUCKET = 'product-images'
const LOCKER_BROADCAST_CHANNEL = 'bocado_lockers_channel_v2'

export const PLATFORM_COMMISSION_RATE = 0.05 // 5% platform commission

export const LOCKER_HUBS: LockerHub[] = [
  {
    id: 'hub_edificio_d',
    name: 'Edificio D',
    building: 'D',
    zone: 'Edificio D · Plazoleta Central (Piso 1)',
    detail: 'Vitrina Inteligente Principal · 20 Casilleros con control térmico',
    icon: '⚡',
    totalLockers: 20,
    isOnline: true,
  },
  {
    id: 'hub_edificio_m',
    name: 'Edificio M',
    building: 'M',
    zone: 'Edificio M · Hall de Aulas y Laboratorios (Piso 1)',
    detail: 'Vitrina Express · 20 Casilleros para recesos entre clases',
    icon: '🏛️',
    totalLockers: 20,
    isOnline: true,
  },
  {
    id: 'hub_edificio_l',
    name: 'Edificio L',
    building: 'L',
    zone: 'Edificio L · Acceso Principal a Estudios (Piso 1)',
    detail: 'Vitrina 24/7 · 20 Casilleros para snacks y postres frescos',
    icon: '🌿',
    totalLockers: 20,
    isOnline: true,
  },
]

export function getLockerHubs(): LockerHub[] {
  return LOCKER_HUBS
}

/**
 * Generate 60 initial lockers (20 in D, 20 in M, 20 in L)
 */
export function getInitialLockers(): Locker[] {
  const now = new Date().toISOString()
  const lockers: Locker[] = []

  const buildings: { id: string; name: string; prefix: string; count: number }[] = [
    { id: 'hub_edificio_d', name: 'Edificio D', prefix: 'D', count: 20 },
    { id: 'hub_edificio_m', name: 'Edificio M', prefix: 'M', count: 20 },
    { id: 'hub_edificio_l', name: 'Edificio L', prefix: 'L', count: 20 },
  ]

  // Seed data for initial campus demonstration
  const sampleReady = [
    {
      building: 'D',
      num: '02',
      productName: 'Brownie Melcochudo con Nueces',
      productPrice: 3500,
      productImage: '/images/real_brownie.jpg',
      sellerId: 'valeria',
      sellerName: 'Valeria M.',
      buyerId: 'demo_buyer',
      buyerName: 'Estudiante Icesi',
      claimPin: '7492',
      depositPin: 'DEP-1021',
      tempType: 'ambiente' as const,
    },
    {
      building: 'D',
      num: '04',
      productName: 'Empanadas de Pollo y Champiñones (x2)',
      productPrice: 4000,
      productImage: '/images/real_empanadas.jpg',
      sellerId: 'lucia',
      sellerName: 'Lucía D.',
      buyerId: 'demo_buyer_2',
      buyerName: 'Carlos P.',
      claimPin: '3184',
      depositPin: 'DEP-4491',
      tempType: 'ambiente' as const,
    },
    {
      building: 'M',
      num: '01',
      productName: 'Galletas de Avena y Chocolate Chips (x3)',
      productPrice: 3000,
      productImage: '/images/real_cookies.jpg',
      sellerId: 'andres',
      sellerName: 'Andrés P.',
      buyerId: 'demo_buyer_3',
      buyerName: 'Mariana S.',
      claimPin: '5820',
      depositPin: 'DEP-9023',
      tempType: 'ambiente' as const,
    },
    {
      building: 'L',
      num: '03',
      productName: 'Parfait de Frutos Rojos y Chía',
      productPrice: 5000,
      productImage: '/images/real_parfait.jpg',
      sellerId: 'carlos',
      sellerName: 'Carlos R.',
      claimPin: '8390',
      depositPin: 'DEP-8390',
      tempType: 'refrigerado' as const,
    },
  ]

  for (const b of buildings) {
    for (let i = 1; i <= b.count; i++) {
      const numStr = i < 10 ? `0${i}` : `${i}`
      const code = `${b.prefix}-${numStr}`
      const id = `lck_${b.prefix.toLowerCase()}_${numStr}`

      const sample = sampleReady.find((s) => s.building === b.prefix && s.num === numStr)

      if (sample) {
        lockers.push({
          id,
          hubId: b.id,
          hubName: b.name,
          buildingCode: b.prefix,
          number: numStr,
          code,
          status: 'listo_para_retiro',
          tempType: sample.tempType,
          productId: `prod_${b.prefix}_${numStr}`,
          productName: sample.productName,
          productPrice: sample.productPrice,
          productImage: sample.productImage,
          sellerId: sample.sellerId,
          sellerName: sample.sellerName,
          buyerId: sample.buyerId,
          buyerName: sample.buyerName,
          claimPin: sample.claimPin,
          depositPin: sample.depositPin,
          isLocked: true,
          updatedAt: now,
          platformCommission: Math.round(sample.productPrice * PLATFORM_COMMISSION_RATE),
          sellerNetRevenue: Math.round(sample.productPrice * (1 - PLATFORM_COMMISSION_RATE)),
        })
      } else {
        // Refrigerated slots: e.g. 5, 6, 15, 16 in each building
        const isRefrigerated = i === 5 || i === 6 || i === 15 || i === 16
        lockers.push({
          id,
          hubId: b.id,
          hubName: b.name,
          buildingCode: b.prefix,
          number: numStr,
          code,
          status: 'disponible',
          tempType: isRefrigerated ? 'refrigerado' : 'ambiente',
          isLocked: true,
          updatedAt: now,
        })
      }
    }
  }

  return lockers
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
    // Ensure we have all 60 lockers
    if (Array.isArray(parsed) && parsed.length >= 60) {
      return parsed
    }
    const initial = getInitialLockers()
    saveLocalLockers(initial, false)
    return initial
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

export function getLockersByBuilding(building: string): Locker[] {
  const norm = building.trim().toUpperCase()
  return readLocalLockers().filter((l) => l.buildingCode.toUpperCase() === norm)
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
  return (
    readLocalLockers().find(
      (l) => l.claimPin === norm && (l.status === 'listo_para_retiro' || l.status === 'esperando_deposito'),
    ) ?? null
  )
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
 * Generate numeric PIN (default 4 digits)
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
 * Seller reserves a specific locker in Edificio D, M, or L to deposit a snack
 */
export function reserveLockerForSellerDeposit(params: {
  building: 'D' | 'M' | 'L' | string
  lockerId?: string
  productId: string
  productName: string
  productPrice: number
  productImage?: string | null
  sellerId: string
  sellerName: string
}): { success: boolean; locker: Locker; depositPin: string; message: string } {
  const all = readLocalLockers()
  const normBuilding = params.building.toUpperCase()

  let targetIndex = -1

  // If specific locker requested
  if (params.lockerId) {
    targetIndex = all.findIndex((l) => l.id === params.lockerId && l.status === 'disponible')
  }

  // Otherwise, first available in selected building
  if (targetIndex === -1) {
    targetIndex = all.findIndex((l) => l.buildingCode === normBuilding && l.status === 'disponible')
  }

  // Fallback to any available locker
  if (targetIndex === -1) {
    targetIndex = all.findIndex((l) => l.status === 'disponible')
  }

  if (targetIndex === -1) {
    throw new Error(`Todos los casilleros del Edificio ${normBuilding} están ocupados en este momento.`)
  }

  const depositPin = `DEP-${Math.floor(1000 + Math.random() * 9000)}`
  const claimPin = `${Math.floor(1000 + Math.random() * 9000)}`

  const commission = Math.round(params.productPrice * PLATFORM_COMMISSION_RATE)
  const netRevenue = params.productPrice - commission

  const updated: Locker = {
    ...all[targetIndex],
    status: 'esperando_deposito',
    productId: params.productId,
    productName: params.productName,
    productPrice: params.productPrice,
    productImage: params.productImage,
    sellerId: params.sellerId,
    sellerName: params.sellerName,
    depositPin,
    claimPin,
    isLocked: true,
    platformCommission: commission,
    sellerNetRevenue: netRevenue,
    updatedAt: new Date().toISOString(),
  }

  all[targetIndex] = updated
  saveLocalLockers(all)
  void uploadLockerRemote(updated)

  return {
    success: true,
    locker: updated,
    depositPin,
    message: `¡Casillero #${updated.code} reservado con éxito! Tu PIN de depósito es ${depositPin}.`,
  }
}

/**
 * Assign and reserve an available locker when a buyer reserves/aparta a product
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
  preferredBuilding?: 'D' | 'M' | 'L' | string
  preferredLockerId?: string
}): { locker: Locker; depositPin: string; claimPin: string } {
  const all = readLocalLockers()

  let targetIndex = -1
  if (params.preferredLockerId) {
    targetIndex = all.findIndex(
      (l) => l.id === params.preferredLockerId && l.status === 'disponible',
    )
  }
  if (targetIndex === -1 && params.preferredBuilding) {
    targetIndex = all.findIndex(
      (l) => l.buildingCode === params.preferredBuilding && l.status === 'disponible',
    )
  }
  if (targetIndex === -1) {
    targetIndex = all.findIndex((l) => l.hubId === params.hubId && l.status === 'disponible')
  }
  if (targetIndex === -1) {
    targetIndex = all.findIndex((l) => l.status === 'disponible')
  }

  if (targetIndex === -1) {
    throw new Error('Todos los casilleros de la vitrina están ocupados en este momento.')
  }

  const depositPin = `DEP-${Math.floor(1000 + Math.random() * 9000)}`
  const claimPin = `${Math.floor(1000 + Math.random() * 9000)}`

  const commission = Math.round(params.productPrice * PLATFORM_COMMISSION_RATE)
  const netRevenue = params.productPrice - commission

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
    platformCommission: commission,
    sellerNetRevenue: netRevenue,
    updatedAt: new Date().toISOString(),
  }

  all[targetIndex] = updated
  saveLocalLockers(all)
  void uploadLockerRemote(updated)

  return { locker: updated, depositPin, claimPin }
}

/**
 * Auto-assign an available locker for a seller upon receiving a purchase request/order.
 * Prompts for building (D, M, or L) and automatically claims the first available locker.
 */
export async function autoAssignLockerForSellerOrder(params: {
  order: Order
  building: 'D' | 'M' | 'L' | string
}): Promise<{
  success: boolean
  updatedOrder: Order
  locker: Locker
  depositPin: string
  claimPin: string
  message: string
}> {
  const buildingNorm = params.building.toUpperCase()
  const allLockers = readLocalLockers()

  // Find first available in that building
  let targetIndex = allLockers.findIndex(
    (l) => l.buildingCode === buildingNorm && l.status === 'disponible',
  )

  // Fallback to any building if full
  if (targetIndex === -1) {
    targetIndex = allLockers.findIndex((l) => l.status === 'disponible')
  }

  if (targetIndex === -1) {
    throw new Error(
      `Todos los casilleros del Edificio ${buildingNorm} están ocupados en este momento. Por favor selecciona otro edificio.`,
    )
  }

  const depositPin = `DEP-${Math.floor(1000 + Math.random() * 9000)}`
  const claimPin = `${Math.floor(1000 + Math.random() * 9000)}`
  const firstItem = params.order.items[0]

  const commission =
    params.order.platformCommission || Math.round(params.order.total * PLATFORM_COMMISSION_RATE)
  const netRevenue = params.order.sellerNetRevenue || params.order.total - commission

  const updatedLocker: Locker = {
    ...allLockers[targetIndex],
    status: 'listo_para_retiro',
    orderId: params.order.id,
    productId: firstItem?.productId || `prod_${params.order.id}`,
    productName: firstItem?.name || 'Snack Bocado',
    productPrice: params.order.total,
    sellerId: params.order.sellerKey,
    sellerName: params.order.sellerName,
    buyerId: params.order.buyerId,
    buyerName: params.order.buyerName,
    depositPin,
    claimPin,
    isLocked: true,
    platformCommission: commission,
    sellerNetRevenue: netRevenue,
    updatedAt: new Date().toISOString(),
  }

  allLockers[targetIndex] = updatedLocker
  saveLocalLockers(allLockers)
  void uploadLockerRemote(updatedLocker)

  const updatedOrder: Order = {
    ...params.order,
    lockerId: updatedLocker.id,
    lockerHubName: updatedLocker.hubName,
    lockerNumber: updatedLocker.number,
    claimPin: claimPin,
    depositPin: depositPin,
    platformCommission: commission,
    sellerNetRevenue: netRevenue,
    status: 'listo',
  }

  await saveOrder(updatedOrder)

  // Dispatch automated chat notification from seller to buyer
  try {
    const conversationId = `order_${params.order.id}`
    await sendMessage({
      conversationId,
      senderId: params.order.sellerKey,
      senderName: params.order.sellerName,
      recipientId: params.order.buyerId,
      recipientName: params.order.buyerName,
      text: `¡Hola ${params.order.buyerName}! Tu pedido ya fue depositado en el Casillero #${updatedLocker.number} del ${updatedLocker.hubName}. Tu PIN de retiro es: ${claimPin}. Recuerda escanear el QR en la máquina para pagar y destrabar la compuerta.`,
      orderId: params.order.id,
      productName: firstItem?.name,
      lockerCode: updatedLocker.code,
    })
  } catch {
    // Continue even if chat broadcast fails
  }

  return {
    success: true,
    updatedOrder,
    locker: updatedLocker,
    depositPin,
    claimPin,
    message: `¡Asignado con éxito al Casillero #${updatedLocker.number} (${updatedLocker.hubName})!`,
  }
}

/**
 * Seller inputs Deposit PIN (e.g. DEP-4912) at the physical/virtual locker to deposit food
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
  void uploadLockerRemote(updated)

  return {
    success: true,
    locker: updated,
    message: `¡Comida depositada con éxito en Casillero #${locker.code}! Ya está listo para que el comprador retire.`,
  }
}

/**
 * Buyer verifies claim PIN at the kiosk terminal before paying
 */
export function verifyClaimPin(pin: string): {
  success: boolean
  locker?: Locker
  message: string
  requiresPayment: boolean
} {
  const norm = pin.trim()
  const all = readLocalLockers()

  const idx = all.findIndex(
    (l) => l.claimPin === norm && (l.status === 'listo_para_retiro' || l.status === 'esperando_deposito'),
  )

  if (idx === -1) {
    return {
      success: false,
      requiresPayment: false,
      message: 'PIN incorrecto o no se encontró ningún casillero activo con este código.',
    }
  }

  const locker = all[idx]
  return {
    success: true,
    locker,
    requiresPayment: true,
    message: `Snack encontrado: ${locker.productName} en Casillero #${locker.code}.`,
  }
}

/**
 * Buyer pays via virtual QR (Nequi / Bancolombia / tarjeta), unlocking the locker door
 * and automatically sending a payment receipt to the seller minus the 5% platform commission.
 */
export async function unlockLockerWithVirtualPayment(params: {
  pin: string
  paymentMethod: PaymentMethod
  buyerId?: string
  buyerName?: string
}): Promise<{ success: boolean; locker?: Locker; receipt?: { total: number; commission: number; netRevenue: number }; message: string }> {
  const norm = params.pin.trim()
  const all = readLocalLockers()

  const idx = all.findIndex(
    (l) =>
      (l.claimPin === norm || l.depositPin?.toUpperCase() === norm.toUpperCase()) &&
      (l.status === 'listo_para_retiro' || l.status === 'esperando_deposito'),
  )

  if (idx === -1) {
    return {
      success: false,
      message: 'PIN incorrecto o casillero no disponible.',
    }
  }

  const locker = all[idx]
  const price = locker.productPrice || 3500
  const commission = Math.round(price * PLATFORM_COMMISSION_RATE)
  const netRevenue = price - commission

  const updated: Locker = {
    ...locker,
    status: 'abierto',
    isLocked: false,
    platformCommission: commission,
    sellerNetRevenue: netRevenue,
    paidAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  all[idx] = updated
  saveLocalLockers(all)
  void uploadLockerRemote(updated)

  // Send automated receipt message to seller via chat
  if (locker.sellerId) {
    try {
      const receiptText = `💰 ¡Pago Recibido por Casillero #${locker.code}!\n` +
        `📦 Producto: ${locker.productName}\n` +
        `💵 Total Venta: $${price.toLocaleString('es-CO')} COP\n` +
        `🏷️ Comisión Bocado (5%): -$${commission.toLocaleString('es-CO')} COP\n` +
        `✨ Neto a tu favor: $${netRevenue.toLocaleString('es-CO')} COP\n` +
        `🔓 Compuerta abierta y producto retirado por el comprador.`

      await sendMessage({
        conversationId: `order_${locker.orderId || locker.id}`,
        senderId: 'sistema_bocado',
        senderName: 'Bocado Casilleros',
        recipientId: locker.sellerId,
        recipientName: locker.sellerName || 'Vendedor',
        text: receiptText,
        messageType: 'payment_receipt',
        orderId: locker.orderId,
        productId: locker.productId,
        productName: locker.productName,
        lockerCode: locker.code,
        amount: price,
        commission,
        netRevenue,
      })
    } catch {
      // Ignore chat notification failure
    }
  }

  return {
    success: true,
    locker: updated,
    receipt: { total: price, commission, netRevenue },
    message: `¡Pago de $${price.toLocaleString('es-CO')} COP verificado! Casillero #${locker.code} abierto. Retira tu ${locker.productName || 'snack'}.`,
  }
}

/**
 * Unlock locker directly with claim PIN (legacy / demo compatibility)
 */
export function unlockLockerWithPin(
  pin: string,
): { success: boolean; locker?: Locker; message: string } {
  const norm = pin.trim()
  const all = readLocalLockers()

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
  void uploadLockerRemote(updated)

  return {
    success: true,
    locker: updated,
    message: `¡Casillero #${locker.code} Abierto! Retira tu ${locker.productName || 'snack'}.`,
  }
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
    platformCommission: undefined,
    sellerNetRevenue: undefined,
    paidAt: undefined,
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
