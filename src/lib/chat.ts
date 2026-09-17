import type { ChatMessage, ConversationSummary } from '../types'
import { supabase } from './supabase'

const CHAT_STORAGE_KEY = 'bocado.chat_messages'
const BUCKET = 'product-images'
const REALTIME_CHANNEL = 'bocado_live_chat'

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

const normalize = (val?: string | null) => (val ?? '').trim().toLowerCase()

export function matchesUser(
  targetId: string | undefined | null,
  targetName: string | undefined | null,
  userId: string | undefined | null,
  userName?: string | null,
  isSeller?: boolean,
): boolean {
  const normTargetId = normalize(targetId)
  const normTargetName = normalize(targetName)
  const normUserId = normalize(userId)
  const normUserName = normalize(userName)

  if (!normTargetId && !normTargetName) return false

  // Direct exact match with User ID
  if (normUserId && (normTargetId === normUserId || normTargetName === normUserId)) return true

  // Direct exact match with User Name
  if (normUserName && (normTargetName === normUserName || normTargetId === normUserName)) return true

  // If targetId has the "Name::userId" format
  if (targetId && targetId.includes('::')) {
    const parts = targetId.split('::')
    const partName = normalize(parts[0])
    const partId = normalize(parts[1])
    if (normUserId && partId === normUserId) return true
    if (normUserName && partName === normUserName) return true
  }

  // Seller stand fallback
  if (isSeller) {
    if (normTargetId === 'mi puesto' || normTargetName === 'mi puesto') return true
  }

  return false
}

export function readLocalMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY)
    if (!raw) return getInitialDemoMessages()
    const parsed = JSON.parse(raw) as ChatMessage[]
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : getInitialDemoMessages()
  } catch {
    return getInitialDemoMessages()
  }
}

export function saveLocalMessages(messages: ChatMessage[], broadcast = true) {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages))
  } catch {
    // ignore
  }
  if (broadcast) {
    notifySync(messages)
  }
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

// Global realtime channel instance
let liveChannel: ReturnType<typeof supabase.channel> | null = null

function getLiveChannel() {
  if (!liveChannel) {
    liveChannel = supabase.channel(REALTIME_CHANNEL)
    liveChannel
      .on('broadcast', { event: 'new_message' }, (payload) => {
        if (payload?.payload) {
          const incoming = payload.payload as ChatMessage
          const current = readLocalMessages()
          if (!current.some((m) => m.id === incoming.id)) {
            current.push(incoming)
            saveLocalMessages(current, true)
          }
        }
      })
      .on('broadcast', { event: 'messages_read' }, (payload) => {
        if (payload?.payload?.conversationId) {
          const convId = payload.payload.conversationId as string
          const current = readLocalMessages()
          let changed = false
          for (const m of current) {
            if (m.conversationId === convId && !m.read) {
              m.read = true
              changed = true
            }
          }
          if (changed) {
            saveLocalMessages(current, true)
          }
        }
      })
      .subscribe()
  }
  return liveChannel
}

export async function syncRemoteMessages(): Promise<ChatMessage[]> {
  const local = readLocalMessages()
  try {
    const { data, error } = await supabase.storage.from(BUCKET).list('', {
      limit: 200,
      search: 'chat-',
    })
    if (error || !data) return local

    const chatFiles = data.filter((f) => f.name.startsWith('chat-') && f.name.endsWith('.json'))
    if (chatFiles.length === 0) return local

    const existingIds = new Set(local.map((m) => m.id))
    const missingFiles = chatFiles.filter((f) => {
      // file name is `chat-${msgId}.json`
      const id = f.name.replace(/^chat-/, '').replace(/\.json$/, '')
      return !existingIds.has(id)
    })

    if (missingFiles.length === 0) return local

    const fetched: ChatMessage[] = []
    await Promise.all(
      missingFiles.map(async (file) => {
        try {
          const { data: blob, error: dlErr } = await supabase.storage.from(BUCKET).download(file.name)
          if (!dlErr && blob) {
            const text = await blob.text()
            const msg = JSON.parse(text) as ChatMessage
            if (msg && msg.id && msg.conversationId) {
              fetched.push(msg)
            }
          }
        } catch {
          // Ignore individual fetch failure
        }
      }),
    )

    if (fetched.length > 0) {
      const mergedMap = new Map<string, ChatMessage>()
      ;[...local, ...fetched].forEach((m) => mergedMap.set(m.id, m))
      const combined = [...mergedMap.values()]
      saveLocalMessages(combined, true)
      return combined
    }
  } catch {
    // Network or remote storage issue; fallback gracefully to local
  }
  return local
}

export function subscribeToChatUpdates(callback: () => void): () => void {
  // Ensure realtime channel is active
  getLiveChannel()

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

  // Trigger an initial remote sync in the background
  void syncRemoteMessages().then(() => callback())

  // Periodic heartbeat sync every 8 seconds for robust sync across all tabs/devices
  const interval = setInterval(() => {
    void syncRemoteMessages().then(() => callback())
  }, 8000)

  return () => {
    clearInterval(interval)
    channel?.close()
    window.removeEventListener('bocado_chat_sync', handleCustomEvent)
    window.removeEventListener('storage', handleStorageEvent)
  }
}

export function createConversationId(userId1: string, userId2: string, orderId?: string): string {
  if (orderId) return `order_${orderId}`
  const sorted = [normalize(userId1), normalize(userId2)].sort()
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
  saveLocalMessages(all, true)

  // 1. Broadcast over Supabase Realtime Channel for instant cross-device reception
  try {
    const live = getLiveChannel()
    await live.send({
      type: 'broadcast',
      event: 'new_message',
      payload: message,
    })
  } catch {
    // Fallback continues
  }

  // 2. Asynchronous remote storage backup so offline recipients can fetch it
  try {
    const file = new Blob([JSON.stringify(message)], { type: 'application/json' })
    await supabase.storage.from(BUCKET).upload(`chat-${message.id}.json`, file, {
      contentType: 'application/json',
      upsert: true,
    })
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
  const userMessages = all.filter((m) => {
    const isSender = matchesUser(m.senderId, m.senderName, userId, userName, isSeller)
    const isRecipient = matchesUser(m.recipientId, m.recipientName, userId, userName, isSeller)
    return isSender || isRecipient
  })

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
    const isSender = matchesUser(last.senderId, last.senderName, userId, userName, isSeller)
    const partnerId = isSender ? last.recipientId : last.senderId
    const partnerName = isSender ? last.recipientName : last.senderName

    const unreadCount = messages.filter(
      (m) =>
        !m.read &&
        !matchesUser(m.senderId, m.senderName, userId, userName, isSeller) &&
        matchesUser(m.recipientId, m.recipientName, userId, userName, isSeller),
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
  userName?: string,
): void {
  const all = readLocalMessages()
  let changed = false
  for (const msg of all) {
    if (
      msg.conversationId === conversationId &&
      !msg.read &&
      matchesUser(msg.recipientId, msg.recipientName, currentUserId, userName, isSeller)
    ) {
      msg.read = true
      changed = true
    }
  }
  if (changed) {
    saveLocalMessages(all, true)
    try {
      const live = getLiveChannel()
      void live.send({
        type: 'broadcast',
        event: 'messages_read',
        payload: { conversationId },
      })
    } catch {
      // ignore
    }
  }
}

export function getUnreadCount(userId: string, isSeller?: boolean, userName?: string): number {
  if (!userId && !userName) return 0
  const all = readLocalMessages()
  return all.filter(
    (m) =>
      !m.read &&
      !matchesUser(m.senderId, m.senderName, userId, userName, isSeller) &&
      matchesUser(m.recipientId, m.recipientName, userId, userName, isSeller),
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
