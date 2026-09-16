import type { ChatMessage, ConversationSummary } from '../types'
import { supabase } from './supabase'

const CHAT_STORAGE_KEY = 'bocado.chat_messages'
const BUCKET = 'product-images'

export const CAMPUS_QUICK_REPLIES = [
  { icon: '📍', text: '¡Ya estoy en el punto de encuentro!' },
  { icon: '🏃', text: 'Salí de clase, voy en camino (llego en 2 min)' },
  { icon: '🔍', text: '¿En qué parte exacta estás?' },
  { icon: '👕', text: 'Estoy con chaqueta/ropa oscura' },
  { icon: '⌛', text: 'Te espero 5 minutos antes de que empiece mi clase' },
  { icon: '💵', text: 'Tengo el dinero exacto en efectivo' },
  { icon: '📲', text: 'Te transfiero por Nequi / Dale' },
  { icon: '✅', text: '¡Listo, ya lo recibí! Muchas gracias' },
] as const

const readLocalMessages = (): ChatMessage[] => {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY)
    if (!raw) return getInitialDemoMessages()
    return JSON.parse(raw) as ChatMessage[]
  } catch {
    return getInitialDemoMessages()
  }
}

const saveLocalMessages = (messages: ChatMessage[]) => {
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages))
  notifySync(messages)
}

function notifySync(messages: ChatMessage[]) {
  try {
    const channel = new BroadcastChannel('bocado_chat_channel')
    channel.postMessage({ type: 'messages_updated', count: messages.length })
    channel.close()
  } catch {
    // Ignore if not supported
  }
  // Dispatch custom event for current window
  window.dispatchEvent(new CustomEvent('bocado_chat_sync'))
}

export function subscribeToChatUpdates(callback: () => void): () => void {
  let channel: BroadcastChannel | null = null
  try {
    channel = new BroadcastChannel('bocado_chat_channel')
    channel.onmessage = () => callback()
  } catch {
    // Fallback
  }

  const handleCustomEvent = () => callback()
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === CHAT_STORAGE_KEY) callback()
  }

  window.addEventListener('bocado_chat_sync', handleCustomEvent)
  window.addEventListener('storage', handleStorageEvent)

  return () => {
    channel?.close()
    window.removeEventListener('bocado_chat_sync', handleCustomEvent)
    window.removeEventListener('storage', handleStorageEvent)
  }
}

export function createConversationId(userId1: string, userId2: string, orderId?: string): string {
  if (orderId) return `order_${orderId}`
  const sorted = [userId1.trim().toLowerCase(), userId2.trim().toLowerCase()].sort()
  return `direct_${sorted[0]}_${sorted[1]}`
}

export async function sendMessage(params: {
  conversationId: string
  senderId: string
  senderName: string
  recipientId: string
  recipientName: string
  text: string
  orderId?: string
  productId?: string
  productName?: string
  messageType?: ChatMessage['messageType']
  locationZone?: string
}): Promise<ChatMessage> {
  const message: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    conversationId: params.conversationId,
    orderId: params.orderId,
    productId: params.productId,
    productName: params.productName,
    senderId: params.senderId,
    senderName: params.senderName,
    recipientId: params.recipientId,
    recipientName: params.recipientName,
    text: params.text.trim(),
    messageType: params.messageType ?? 'text',
    locationZone: params.locationZone,
    timestamp: new Date().toISOString(),
    read: false,
  }

  const all = readLocalMessages()
  all.push(message)
  saveLocalMessages(all)

  // Asynchronous remote storage backup
  try {
    const file = new Blob([JSON.stringify(message)], { type: 'application/json' })
    await supabase.storage.from(BUCKET).upload(`chat-${message.id}.json`, file, { upsert: true })
  } catch {
    // Local fallback is completely operational
  }

  return message
}

export function getMessagesByConversation(conversationId: string): ChatMessage[] {
  const all = readLocalMessages()
  return all
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}

export function getUserConversations(
  userId: string,
  isSeller?: boolean,
  userName?: string,
): ConversationSummary[] {
  const all = readLocalMessages()
  const userMessages = all.filter(
    (m) =>
      m.senderId === userId ||
      m.recipientId === userId ||
      (userName && (m.senderName === userName || m.recipientName === userName)) ||
      (isSeller && (m.recipientId === 'Mi Puesto' || m.senderId === 'Mi Puesto')),
  )

  const groupMap = new Map<string, ChatMessage[]>()
  for (const msg of userMessages) {
    const list = groupMap.get(msg.conversationId) ?? []
    list.push(msg)
    groupMap.set(msg.conversationId, list)
  }

  const summaries: ConversationSummary[] = []

  for (const [conversationId, messages] of groupMap.entries()) {
    messages.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    const last = messages[messages.length - 1]
    const isSender = last.senderId === userId || (userName && last.senderName === userName)
    const partnerId = isSender ? last.recipientId : last.senderId
    const partnerName = isSender ? last.recipientName : last.senderName

    const unreadCount = messages.filter(
      (m) =>
        (m.recipientId === userId || (isSeller && m.recipientId === 'Mi Puesto')) &&
        !m.read,
    ).length

    summaries.push({
      id: conversationId,
      partnerId,
      partnerName: partnerName || 'Vendedor/Comprador',
      orderId: last.orderId,
      productName: last.productName,
      lastMessage: last.text,
      lastTimestamp: last.timestamp,
      unreadCount,
    })
  }

  return summaries.sort((a, b) => b.lastTimestamp.localeCompare(a.lastTimestamp))
}

export function markConversationAsRead(
  conversationId: string,
  currentUserId: string,
  isSeller?: boolean,
): void {
  const all = readLocalMessages()
  let changed = false
  for (const msg of all) {
    if (
      msg.conversationId === conversationId &&
      (msg.recipientId === currentUserId || (isSeller && msg.recipientId === 'Mi Puesto')) &&
      !msg.read
    ) {
      msg.read = true
      changed = true
    }
  }
  if (changed) {
    saveLocalMessages(all)
  }
}

export function getUnreadCount(userId: string, isSeller?: boolean): number {
  if (!userId) return 0
  const all = readLocalMessages()
  return all.filter(
    (m) => (m.recipientId === userId || (isSeller && m.recipientId === 'Mi Puesto')) && !m.read,
  ).length
}

function getInitialDemoMessages(): ChatMessage[] {
  return [
    {
      id: 'demo_1',
      conversationId: 'order_demo_101',
      orderId: 'demo_101',
      productName: 'Brownie Melcochudo con Nueces',
      senderId: 'valeria',
      senderName: 'Valeria M.',
      recipientId: 'user_default',
      recipientName: 'Tú',
      text: '¡Hola! Ya tengo tu Brownie listo. ¿A qué hora pasas por el Edificio D?',
      messageType: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      read: true,
    },
    {
      id: 'demo_2',
      conversationId: 'order_demo_101',
      orderId: 'demo_101',
      productName: 'Brownie Melcochudo con Nueces',
      senderId: 'user_default',
      senderName: 'Tú',
      recipientId: 'valeria',
      recipientName: 'Valeria M.',
      text: '¡Hola Valeria! Salgo de clase a las 11:15 y paso de inmediato por el 2do piso.',
      messageType: 'text',
      timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      read: true,
    },
    {
      id: 'demo_3',
      conversationId: 'order_demo_101',
      orderId: 'demo_101',
      productName: 'Brownie Melcochudo con Nueces',
      senderId: 'valeria',
      senderName: 'Valeria M.',
      recipientId: 'user_default',
      recipientName: 'Tú',
      text: 'Perfecto, acá te espero frente a las salas de estudio. 📍 Edificio D - Piso 2',
      messageType: 'location',
      locationZone: 'Edificio D (Plazoleta / Pisos)',
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      read: false,
    },
  ]
}
