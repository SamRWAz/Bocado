import { supabase } from './supabase'
import { sha256 } from './hash'
import type { Order, StoredUser } from '../types'

const BUCKET = 'product-images'
const LOCAL_USERS = 'bocado.users'
const LOCAL_ORDERS = 'bocado.orders'

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
  })
  if (error) throw error
}

async function downloadJson<T>(path: string): Promise<T | null> {
  const { data, error } = await supabase.storage.from(BUCKET).download(path)
  if (error || !data) return null
  try {
    return JSON.parse(await data.text()) as T
  } catch {
    return null
  }
}

export async function userPathForEmail(email: string) {
  return `user-${await sha256(email.trim().toLowerCase())}.json`
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

function notifyOrderSync() {
  try {
    const channel = new BroadcastChannel('bocado_orders_channel')
    channel.postMessage({ type: 'orders_updated' })
    channel.close()
  } catch {
    // Ignore
  }
  window.dispatchEvent(new CustomEvent('bocado_orders_sync'))
}

export function subscribeToOrderUpdates(callback: () => void): () => void {
  let channel: BroadcastChannel | null = null
  try {
    channel = new BroadcastChannel('bocado_orders_channel')
    channel.onmessage = () => callback()
  } catch {
    // Ignore
  }

  const handleCustom = () => callback()
  const handleStorage = (e: StorageEvent) => {
    if (e.key === LOCAL_ORDERS) callback()
  }

  window.addEventListener('bocado_orders_sync', handleCustom)
  window.addEventListener('storage', handleStorage)

  return () => {
    channel?.close()
    window.removeEventListener('bocado_orders_sync', handleCustom)
    window.removeEventListener('storage', handleStorage)
  }
}

export async function saveOrder(order: Order) {
  const local = readLocal<Order[]>(LOCAL_ORDERS, []).filter((item) => item.id !== order.id)
  localStorage.setItem(LOCAL_ORDERS, JSON.stringify([order, ...local]))
  notifyOrderSync()
  try {
    await uploadJson(`order-${order.id}.json`, order, true)
  } catch {
    // Pedido disponible al menos en este dispositivo.
  }
}

export async function fetchOrders(): Promise<Order[]> {
  const local = readLocal<Order[]>(LOCAL_ORDERS, [])
  try {
    const { data, error } = await supabase.storage.from(BUCKET).list('', {
      limit: 200,
      search: 'order-',
    })
    if (error || !data) return local
    const files = data.filter((file) => file.name.startsWith('order-') && file.name.endsWith('.json'))
    const remote = (await Promise.all(files.map((file) => downloadJson<Order>(file.name)))).filter(
      (order): order is Order => !!order,
    )
    const map = new Map<string, Order>()
    ;[...local, ...remote].forEach((order) => map.set(order.id, order))
    return [...map.values()]
  } catch {
    return local
  }
}

export async function fetchOrder(id: string) {
  return (
    (await downloadJson<Order>(`order-${id}.json`)) ??
    readLocal<Order[]>(LOCAL_ORDERS, []).find((order) => order.id === id) ??
    null
  )
}

