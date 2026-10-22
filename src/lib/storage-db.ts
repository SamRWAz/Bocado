import { supabase } from './supabase'
import { sha256 } from './hash'
import type { Order, StoredUser } from '../types'

const BUCKET = 'product-images'
const LOCAL_USERS = 'bocado.users_v2'
const LOCAL_ORDERS = 'bocado.orders_v2'

const jsonFile = (value: unknown) =>
  new Blob([JSON.stringify(value)], { type: 'application/json' })

const readLocal = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

async function uploadJson(path: string, value: unknown, upsert = true) {
  const { error } = await supabase.storage.from(BUCKET).upload(path, jsonFile(value), {
    contentType: 'application/json',
    upsert,
    cacheControl: '0',
  })
  if (error) throw error
}

async function downloadJson<T>(path: string): Promise<T | null> {
  try {
    // Usar fetch directo con timestamp y no-store para evitar cualquier caché de navegador o CDN
    const { data: pubData } = supabase.storage.from(BUCKET).getPublicUrl(path)
    if (pubData?.publicUrl) {
      const res = await fetch(`${pubData.publicUrl}?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      })
      if (res.ok) {
        return (await res.json()) as T
      }
    }
  } catch {
    // Fallback a descarga regular del SDK
  }

  const { data, error } = await supabase.storage.from(BUCKET).download(path)
  if (error || !data) return null
  try {
    return JSON.parse(await data.text()) as T
  } catch {
    return null
  }
}

export async function userPathForEmail(email: string) {
  return `user_v2_${await sha256(email.trim().toLowerCase())}.json`
}

export async function findStoredUser(email: string) {
  const remote = await downloadJson<StoredUser>(await userPathForEmail(email))
  if (remote) return remote
  return (
    readLocal<StoredUser[]>(LOCAL_USERS, []).find(
      (user) => user.email === email.trim().toLowerCase(),
    ) ?? null
  )
}

export async function saveStoredUser(user: StoredUser, upsert = true) {
  const local = readLocal<StoredUser[]>(LOCAL_USERS, []).filter((item) => item.email !== user.email)
  localStorage.setItem(LOCAL_USERS, JSON.stringify([...local, user]))
  try {
    await uploadJson(await userPathForEmail(user.email), user, upsert)
  } catch {
    // Si el bucket no deja escribir, la cuenta queda en este navegador.
  }
}

/**
 * Merges two order states safely. Confirmations and timestamps are never wiped out.
 */
export function mergeOrder(a: Order, b: Order): Order {
  const tendederoConfirmed = Boolean(a.tendederoConfirmed || b.tendederoConfirmed)
  const buyerConfirmed = Boolean(a.buyerConfirmed || b.buyerConfirmed)
  const sellerPaidConfirmed = Boolean(a.sellerPaidConfirmed || b.sellerPaidConfirmed)
  const sellerBuildingConfirmed = Boolean(a.sellerBuildingConfirmed || b.sellerBuildingConfirmed)

  const isCompleted = tendederoConfirmed && buyerConfirmed && sellerPaidConfirmed

  let status = b.status || a.status
  const statusWeight: Record<string, number> = {
    solicitado: 1,
    tomado: 2,
    en_camino: 3,
    entregado_por_tendedero: 4,
    entregado: 5,
    completado: 6,
    cancelado: 0,
  }
  const weightA = statusWeight[a.status] || 0
  const weightB = statusWeight[b.status] || 0
  status = weightB >= weightA ? b.status : a.status
  if (isCompleted) {
    status = 'completado'
  }

  const tendederoConfirmedAt = b.tendederoConfirmedAt || a.tendederoConfirmedAt
  const buyerConfirmedAt = b.buyerConfirmedAt || a.buyerConfirmedAt
  const sellerPaidConfirmedAt = b.sellerPaidConfirmedAt || a.sellerPaidConfirmedAt

  return {
    ...a,
    ...b,
    tendederoId: b.tendederoId || a.tendederoId,
    tendederoName: b.tendederoName || a.tendederoName,
    tendederoAcceptedAt: b.tendederoAcceptedAt || a.tendederoAcceptedAt,
    sellerBuilding: b.sellerBuilding || a.sellerBuilding,
    sellerBuildingConfirmed,
    tendederoConfirmed,
    tendederoConfirmedAt,
    buyerConfirmed,
    buyerConfirmedAt,
    sellerPaidConfirmed,
    sellerPaidConfirmedAt,
    status,
  }
}

const ORDERS_REALTIME_CHANNEL = 'bocado_live_orders'
let ordersLiveChannel: ReturnType<typeof supabase.channel> | null = null
let sharedBroadcastChannel: BroadcastChannel | null = null

function getSharedBroadcastChannel(): BroadcastChannel | null {
  if (!sharedBroadcastChannel && typeof BroadcastChannel !== 'undefined') {
    try {
      sharedBroadcastChannel = new BroadcastChannel('bocado_orders_channel')
    } catch {
      // Ignore
    }
  }
  return sharedBroadcastChannel
}

export function getOrdersLiveChannel() {
  if (!ordersLiveChannel) {
    ordersLiveChannel = supabase.channel(ORDERS_REALTIME_CHANNEL)
    ordersLiveChannel
      .on('broadcast', { event: 'order_updated' }, (payload) => {
        if (payload?.payload) {
          const incoming = payload.payload as Order
          if (incoming && incoming.id) {
            applyIncomingOrder(incoming)
          }
        }
      })
      .subscribe()
  }
  return ordersLiveChannel
}

function applyIncomingOrder(incoming: Order) {
  const local = readLocal<Order[]>(LOCAL_ORDERS, [])
  const existing = local.find((o) => o.id === incoming.id)
  const merged = existing ? mergeOrder(existing, incoming) : incoming
  const updatedList = [merged, ...local.filter((o) => o.id !== incoming.id)]
  localStorage.setItem(LOCAL_ORDERS, JSON.stringify(updatedList))
  notifyOrderSync()
}

function notifyOrderSync() {
  try {
    getSharedBroadcastChannel()?.postMessage({ type: 'orders_updated' })
  } catch {
    // Ignore
  }
  window.dispatchEvent(new CustomEvent('bocado_orders_sync'))
}

export function subscribeToOrderUpdates(callback: () => void): () => void {
  // 1. Activar canal de WebSockets de Supabase en tiempo real para todos los clientes
  getOrdersLiveChannel()

  const bc = getSharedBroadcastChannel()
  const handleBcMessage = () => callback()
  if (bc) {
    bc.addEventListener('message', handleBcMessage)
  }

  const handleCustom = () => callback()
  const handleStorage = (e: StorageEvent) => {
    if (e.key === LOCAL_ORDERS) callback()
  }

  const handleFocus = () => {
    void fetchOrders().then((merged) => {
      if (merged.length > 0) callback()
    })
  }

  window.addEventListener('bocado_orders_sync', handleCustom)
  window.addEventListener('storage', handleStorage)
  window.addEventListener('focus', handleFocus)

  // 2. Heartbeat de sincronización rápida cada 1.5s para no perder ninguna actualización remota
  const interval = setInterval(() => {
    void fetchOrders().then((merged) => {
      if (merged.length > 0) callback()
    })
  }, 1500)

  return () => {
    clearInterval(interval)
    if (bc) {
      bc.removeEventListener('message', handleBcMessage)
    }
    window.removeEventListener('bocado_orders_sync', handleCustom)
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener('focus', handleFocus)
  }
}

export async function saveOrder(order: Order) {
  const local = readLocal<Order[]>(LOCAL_ORDERS, [])
  const existing = local.find((item) => item.id === order.id)
  const merged = existing ? mergeOrder(existing, order) : order
  const filtered = local.filter((item) => item.id !== order.id)
  const updatedList = [merged, ...filtered]
  localStorage.setItem(LOCAL_ORDERS, JSON.stringify(updatedList))
  notifyOrderSync()

  // 1. Transmisión inmediata por WebSocket a otros navegadores y dispositivos
  try {
    const channel = getOrdersLiveChannel()
    channel.send({
      type: 'broadcast',
      event: 'order_updated',
      payload: merged,
    })
  } catch {
    // Non-blocking
  }

  // 2. Carga remota en Supabase de archivo individual y del índice consolidado
  try {
    await Promise.allSettled([
      uploadJson(`order_v2_${order.id}.json`, merged, true),
      uploadJson('orders_index_v2.json', updatedList, true),
    ])
  } catch (err) {
    console.warn('Error sincronizando pedido:', err)
  }
}

export async function fetchOrders(): Promise<Order[]> {
  const local = readLocal<Order[]>(LOCAL_ORDERS, [])
  let remoteList: Order[] = []

  // 1. Descargar el índice consolidado orders_index_v2.json de forma instantánea
  try {
    const indexed = await downloadJson<Order[]>('orders_index_v2.json')
    if (Array.isArray(indexed) && indexed.length > 0) {
      remoteList = indexed
    }
  } catch {
    // Fallback a listado individual
  }

  // 2. Si no hay índice, consultar archivos individuales en el bucket
  if (remoteList.length === 0) {
    try {
      const { data, error } = await supabase.storage.from(BUCKET).list('', {
        limit: 200,
        search: 'order_v2_',
      })
      if (!error && data) {
        const files = data.filter((file) => file.name.startsWith('order_v2_') && file.name.endsWith('.json'))
        const downloaded = (await Promise.all(files.map((file) => downloadJson<Order>(file.name)))).filter(
          (order): order is Order => !!order,
        )
        if (downloaded.length > 0) {
          remoteList = downloaded
        }
      }
    } catch {
      // Ignorar error de red y usar local
    }
  }

  const map = new Map<string, Order>()
  ;[...remoteList, ...local].forEach((order) => {
    const existing = map.get(order.id)
    if (!existing) {
      map.set(order.id, order)
    } else {
      map.set(order.id, mergeOrder(existing, order))
    }
  })
  const merged = [...map.values()]
  localStorage.setItem(LOCAL_ORDERS, JSON.stringify(merged))
  return merged
}

export async function fetchOrder(id: string) {
  return (
    (await downloadJson<Order>(`order_v2_${id}.json`)) ??
    readLocal<Order[]>(LOCAL_ORDERS, []).find((order) => order.id === id) ??
    null
  )
}

