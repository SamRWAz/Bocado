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

/**
 * Checks if a user is the sender of a message.
 */
export function isUserSender(
  m: ChatMessage,
  userId?: string | null,
  userName?: string | null,
): boolean {
  if (!userId && !userName) return false
  const uid = normalize(userId)
  const uname = normalize(userName)

  if (uid) {
    const sId = normalize(m.senderId)
    if (sId === uid || sId.endsWith(`::${uid}`) || sId.split('::')[1] === uid) {
      return true
    }
  }

  if (uname) {
    const sName = normalize(m.senderName)
    const sId = normalize(m.senderId)
    if (sName === uname || sId === uname || sId.split('::')[0] === uname) {
      return true
    }
  }

  return false
}

/**
 * Checks if a user is the recipient of a message.
 */
export function isUserRecipient(
  m: ChatMessage,
  userId?: string | null,
  userName?: string | null,
): boolean {
  if (!userId && !userName) return false
  const uid = normalize(userId)
  const uname = normalize(userName)

  if (uid) {
    const rId = normalize(m.recipientId)
    if (rId === uid || rId.endsWith(`::${uid}`) || rId.split('::')[1] === uid) {
      return true
    }
  }

  if (uname) {
    const rName = normalize(m.recipientName)
    const rId = normalize(m.recipientId)
    if (rName === uname || rId === uname || rId.split('::')[0] === uname) {
      return true
    }
  }

  return false
}

/**
 * Checks if a user is a participant (sender or recipient) in a message.
 */
export function isUserParticipant(
  m: ChatMessage,
  userId?: string | null,
  userName?: string | null,
): boolean {
  return isUserSender(m, userId, userName) || isUserRecipient(m, userId, userName)
}

/**
 * Legacy alias for backwards compatibility
 */
export function matchesUser(
  targetId: string | undefined | null,
  targetName: string | undefined | null,
  userId: string | undefined | null,
  userName?: string | null,
  _isSeller?: boolean,
): boolean {
  if (!userId && !userName) return false
  const normUserId = normalize(userId)
  const normUserName = normalize(userName)
  const normTargetId = normalize(targetId)
  const normTargetName = normalize(targetName)

  if (normUserId && (normTargetId === normUserId || normTargetId.endsWith(`::${normUserId}`))) return true
  if (normUserName && (normTargetName === normUserName || normTargetId === normUserName)) return true
  return false
}

export function readLocalMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as ChatMessage[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
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
    // Graceful fallback
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

  // Periodic heartbeat sync every 5 seconds for fast sync across all tabs/devices
  const interval = setInterval(() => {
    void syncRemoteMessages().then(() => callback())
  }, 5000)

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
  // Ensure valid recipient ID and recipient Name fallback
  let rId = params.recipientId?.trim()
  let rName = params.recipientName?.trim()

  if (!rId && params.conversationId.startsWith('direct_')) {
    const parts = params.conversationId.replace('direct_', '').split('_')
    rId = parts.find((p) => p !== normalize(params.senderId)) || parts[0] || 'partner'
  }
  if (!rName) {
    rName = 'Usuario'
  }

  const message: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    conversationId: params.conversationId,
    orderId: params.orderId,
    productId: params.productId,
    productName: params.productName,
    senderId: params.senderId,
    senderName: params.senderName,
    recipientId: rId,
    recipientName: rName,
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

export function getMessagesByConversation(
  conversationId: string,
  userId?: string,
  userName?: string,
): ChatMessage[] {
  const all = readLocalMessages()
  return all
    .filter((m) => {
      if (m.conversationId !== conversationId) return false
      if (userId || userName) {
        return isUserParticipant(m, userId, userName)
      }
      return true
    })
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}

export function getUserConversations(
  userId: string,
  _isSeller?: boolean,
  userName?: string,
): ConversationSummary[] {
  if (!userId && !userName) return []
  const all = readLocalMessages()

  // Filter messages to ONLY those where current user is sender OR recipient
  const userMessages = all.filter((m) => isUserParticipant(m, userId, userName))

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

    // Determine the partner (the other participant in the conversation)
    let partnerId = ''
    let partnerName = ''

    for (const m of messages) {
      if (!isUserSender(m, userId, userName)) {
        partnerId = m.senderId
        partnerName = m.senderName
        break
      }
      if (!isUserRecipient(m, userId, userName)) {
        partnerId = m.recipientId
        partnerName = m.recipientName
        break
      }
    }

    if (!partnerId) {
      const isSender = isUserSender(last, userId, userName)
      partnerId = isSender ? last.recipientId : last.senderId
      partnerName = isSender ? last.recipientName : last.senderName
    }

    const unreadCount = messages.filter(
      (m) => !m.read && isUserRecipient(m, userId, userName) && !isUserSender(m, userId, userName),
    ).length

    summaries.push({
      id: conversationId,
      partnerId: partnerId || 'partner',
      partnerName: partnerName || 'Usuario',
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
  _isSeller?: boolean,
  userName?: string,
): void {
  if (!currentUserId && !userName) return
  const all = readLocalMessages()
  let changed = false
  for (const msg of all) {
    if (
      msg.conversationId === conversationId &&
      !msg.read &&
      isUserRecipient(msg, currentUserId, userName)
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
        payload: { conversationId, readerId: currentUserId },
      })
    } catch {
      // ignore
    }
  }
}

export function getUnreadCount(userId: string, _isSeller?: boolean, userName?: string): number {
  if (!userId && !userName) return 0
  const all = readLocalMessages()
  return all.filter(
    (m) =>
      !m.read &&
      isUserRecipient(m, userId, userName) &&
      !isUserSender(m, userId, userName),
  ).length
}
