import { MessageSquare, Navigation, RefreshCw, Search, ShoppingBag } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChatBox } from '../components/chat/ChatBox'
import { canSell, useAuth } from '../context/AuthContext'
import {
  createConversationId,
  getMessagesByConversation,
  getUserConversations,
  isUserSender,
  subscribeToChatUpdates,
  syncRemoteMessages,
} from '../lib/chat'
import { initials, timeAgo } from '../lib/format'
import type { ConversationSummary } from '../types'

export function MessagesPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [search, setSearch] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [activePartner, setActivePartner] = useState<{
    id: string
    name: string
    orderId?: string
    productName?: string
    productId?: string
  } | null>(null)

  const convParam = searchParams.get('conv')
  const partnerIdParam = searchParams.get('partnerId')
  const partnerNameParam = searchParams.get('partnerName')
  const orderIdParam = searchParams.get('orderId')
  const productNameParam = searchParams.get('productName')
  const productIdParam = searchParams.get('productId')

  const refreshConversations = useCallback(() => {
    if (!user) return
    const isSeller = canSell(user.role)
    const list = getUserConversations(user.id, isSeller, user.name)
    setConversations(list)

    // Check if params specify an active conversation or a new partner to chat with
    if (convParam) {
      setActiveConvId(convParam)
      if (partnerIdParam && partnerNameParam) {
        setActivePartner({
          id: partnerIdParam,
          name: partnerNameParam,
          orderId: orderIdParam ?? undefined,
          productName: productNameParam ?? undefined,
          productId: productIdParam ?? undefined,
        })
      } else {
        const found = list.find((c) => c.id === convParam)
        if (found) {
          setActivePartner({
            id: found.partnerId,
            name: found.partnerName,
            orderId: found.orderId,
            productName: found.productName,
          })
        } else {
          // Resolve partner from message history for this conversation
          const msgs = getMessagesByConversation(convParam, user.id, user.name)
          if (msgs.length > 0) {
            const last = msgs[msgs.length - 1]
            const isSender = isUserSender(last, user.id, user.name)
            setActivePartner({
              id: isSender ? last.recipientId : last.senderId,
              name: isSender ? last.recipientName : last.senderName,
              orderId: last.orderId,
              productName: last.productName,
              productId: last.productId,
            })
          }
        }
      }
    } else if (partnerIdParam && partnerNameParam) {
      const generatedId = createConversationId(user.id, partnerIdParam, orderIdParam ?? undefined)
      setActiveConvId(generatedId)
      setActivePartner({
        id: partnerIdParam,
        name: partnerNameParam,
        orderId: orderIdParam ?? undefined,
        productName: productNameParam ?? undefined,
        productId: productIdParam ?? undefined,
      })
    } else if (list.length > 0 && !activeConvId) {
      // Default to first conversation
      setActiveConvId(list[0].id)
      setActivePartner({
        id: list[0].partnerId,
        name: list[0].partnerName,
        orderId: list[0].orderId,
        productName: list[0].productName,
      })
    }
  }, [user, convParam, partnerIdParam, partnerNameParam, orderIdParam, productNameParam, productIdParam, activeConvId])

  const handleManualSync = async () => {
    setIsSyncing(true)
    try {
      await syncRemoteMessages()
      refreshConversations()
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    void syncRemoteMessages().then(() => {
      refreshConversations()
    })
    const unsubscribe = subscribeToChatUpdates(() => {
      refreshConversations()
    })
    return () => unsubscribe()
  }, [refreshConversations])

  const selectConversation = (conv: ConversationSummary) => {
    setActiveConvId(conv.id)
    setActivePartner({
      id: conv.partnerId,
      name: conv.partnerName,
      orderId: conv.orderId,
      productName: conv.productName,
    })
    setSearchParams({ conv: conv.id })
  }

  const filtered = conversations.filter(
    (c) =>
      c.partnerName.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase()) ||
      (c.productName && c.productName.toLowerCase().includes(search.toLowerCase())),
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Centro de Mensajes</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Coordinación rápida y ubicación en tiempo real entre compradores y vendedores del campus.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleManualSync()}
          disabled={isSyncing}
          className="inline-flex items-center gap-1.5 self-start rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all sm:self-auto"
          title="Sincronizar mensajes en tiempo real con la nube"
        >
          <RefreshCw size={13} className={`text-primary ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        {/* Conversations List Column */}
        <div
          className={`flex flex-col rounded-xl border border-border bg-card p-3 shadow-sm ${
            activeConvId ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar en chats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary py-2 pl-9 pr-3 text-xs outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex-1 space-y-1 overflow-y-auto max-h-[600px] no-scrollbar">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
                <p>{search ? 'No se encontraron conversaciones' : 'No tienes conversaciones activas aún'}</p>
                <Link to="/catalogo" className="mt-3 inline-block font-display font-semibold text-primary">
                  Explorar snacks en el campus →
                </Link>
              </div>
            ) : (
              filtered.map((conv) => {
                const isSelected = activeConvId === conv.id
                return (
                  <button
                    type="button"
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition-all ${
                      isSelected
                        ? 'bg-primary/15 border border-primary/30'
                        : 'border border-transparent hover:bg-secondary/60'
                    }`}
                  >
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 font-display text-xs font-bold text-primary">
                      {initials(conv.partnerName)}
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground animate-pulse">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate font-display text-sm font-semibold text-foreground">
                          {conv.partnerName}
                        </span>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {timeAgo(conv.lastTimestamp)}
                        </span>
                      </div>
                      {conv.productName && (
                        <p className="flex items-center gap-1 text-[11px] font-medium text-primary truncate">
                          <ShoppingBag size={11} className="shrink-0" />
                          {conv.productName}
                        </p>
                      )}
                      <p className="truncate text-xs text-muted-foreground mt-0.5">{conv.lastMessage}</p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Chat Area Column */}
        <div className={activeConvId ? 'block' : 'hidden lg:block'}>
          {activeConvId && activePartner ? (
            <ChatBox
              conversationId={activeConvId}
              partnerId={activePartner.id}
              partnerName={activePartner.name}
              orderId={activePartner.orderId}
              productName={activePartner.productName}
              productId={activePartner.productId}
              onBack={() => {
                setActiveConvId(null)
                setSearchParams({})
              }}
            />
          ) : (
            <div className="flex h-[600px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 p-8 text-center text-muted-foreground">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary">
                <Navigation size={32} />
              </div>
              <h2 className="font-display text-lg font-bold text-foreground">Selecciona o inicia un chat</h2>
              <p className="mt-1 max-w-sm text-xs">
                Coordina puntos de encuentro en el campus, consulta ingredientes o acuerda la entrega con el vendedor.
              </p>
              <Link
                to="/catalogo"
                className="mt-6 rounded-lg bg-primary px-5 py-2.5 font-display text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90"
              >
                Ver Snacks Disponibles
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
