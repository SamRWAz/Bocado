import { ArrowLeft, Check, CheckCheck, MapPin, Navigation, Send, ShoppingBag } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { canSell, useAuth } from '../../context/AuthContext'
import { getSellerPresence, ICESI_ZONES } from '../../lib/campus'
import {
  getMessagesByConversation,
  isUserSender,
  markConversationAsRead,
  sendMessage,
  subscribeToChatUpdates,
} from '../../lib/chat'
import { formatTime, initials } from '../../lib/format'
import type { ChatMessage } from '../../types'
import { QuickReplies } from './QuickReplies'

type Props = {
  conversationId: string
  partnerId: string
  partnerName: string
  orderId?: string
  productName?: string
  productId?: string
  compact?: boolean
  onClose?: () => void
  onBack?: () => void
}

export function ChatBox({
  conversationId,
  partnerId,
  partnerName,
  orderId,
  productName,
  productId,
  compact = false,
  onClose,
  onBack,
}: Props) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [sending, setSending] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [selectedZone, setSelectedZone] = useState<string>(ICESI_ZONES[0])
  const [zoneDetail, setZoneDetail] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const partnerPresence = getSellerPresence(partnerId)

  const loadMessages = useCallback(() => {
    const list = getMessagesByConversation(conversationId, user?.id, user?.name)
    setMessages(list)
    if (user) {
      markConversationAsRead(conversationId, user.id, canSell(user.role), user.name)
    }
  }, [conversationId, user])

  useEffect(() => {
    loadMessages()
    const unsubscribe = subscribeToChatUpdates(() => {
      loadMessages()
    })
    return () => unsubscribe()
  }, [loadMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = async (textToSend?: string, customType: ChatMessage['messageType'] = 'text', zone?: string) => {
    const text = textToSend ?? inputText
    if (!text.trim() || !user || sending) return

    setSending(true)
    try {
      await sendMessage({
        conversationId,
        senderId: user.id,
        senderName: user.name,
        recipientId: partnerId,
        recipientName: partnerName,
        text: text.trim(),
        orderId,
        productId,
        productName,
        messageType: customType,
        locationZone: zone,
      })
      setInputText('')
      loadMessages()
    } finally {
      setSending(false)
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void handleSend()
  }

  const handleSendLocation = async () => {
    if (!selectedZone) return
    const text = `📍 Mi ubicación en el campus: ${selectedZone}${zoneDetail ? ` · ${zoneDetail}` : ''}`
    await handleSend(text, 'location', selectedZone)
    setShowLocationPicker(false)
    setZoneDetail('')
  }

  return (
    <div
      className={`flex flex-col rounded-xl border border-border bg-card shadow-lg ${
        compact ? 'h-[500px] w-full max-w-md' : 'h-[650px] w-full'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card/90 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
              aria-label="Volver a lista de chats"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 font-display text-sm font-bold text-primary">
            {initials(partnerName)}
            <span
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card ${
                partnerPresence?.isOnline ? 'bg-emerald-500' : 'bg-primary'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold leading-tight">{partnerName}</h3>
              {partnerPresence?.isOnline && (
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  En campus
                </span>
              )}
            </div>
            {partnerPresence ? (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin size={12} className="text-primary shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-xs">{partnerPresence.zone} · {partnerPresence.activeUntil}</span>
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Coordinación de entrega entre clases</p>
            )}
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            ✕
          </button>
        )}
      </div>

      {/* Related Order or Product Banner */}
      {(orderId || productName) && (
        <div className="flex items-center justify-between border-b border-border/60 bg-secondary/40 px-4 py-2 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShoppingBag size={14} className="text-primary" />
            <span>
              {orderId ? `Pedido #${orderId.slice(-6)}` : 'Snack:'}{' '}
              <strong className="text-foreground">{productName || 'Snack del campus'}</strong>
            </span>
          </div>
          {orderId && (
            <Link to="/pedidos" className="font-display font-semibold text-primary hover:underline">
              Ver pedido →
            </Link>
          )}
        </div>
      )}

      {/* Messages List */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4 no-scrollbar">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">
              <Navigation size={24} />
            </div>
            <p className="font-display font-medium text-foreground">Inicia la conversación</p>
            <p className="mt-1 max-w-xs text-xs">
              Coordina el punto de encuentro exacto o avisa si vas en camino para no perderte entre clases.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = isUserSender(msg, user?.id, user?.name)
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-all ${
                    isMe
                      ? 'rounded-tr-xs bg-primary text-primary-foreground font-medium'
                      : 'rounded-tl-xs border border-border/80 bg-secondary text-foreground'
                  } ${msg.messageType === 'location' ? 'border-2 border-primary/40' : ''}`}
                >
                  {msg.messageType === 'location' && (
                    <div className="mb-1 flex items-center gap-1.5 font-display text-xs font-bold opacity-90">
                      <MapPin size={14} /> Ubicación en Campus
                    </div>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
                <div className="mt-1 flex items-center gap-1 px-1 text-[10px] text-muted-foreground">
                  <span>{formatTime(msg.timestamp)}</span>
                  {isMe && (
                    <span>
                      {msg.read ? (
                        <CheckCheck size={12} className="text-primary inline" />
                      ) : (
                        <Check size={12} className="inline" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Location Share Modal / Dropdown */}
      {showLocationPicker && (
        <div className="border-t border-border bg-card p-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-2">
            <span className="font-display text-xs font-bold text-primary flex items-center gap-1">
              <MapPin size={13} /> Compartir mi ubicación actual en campus
            </span>
            <button
              type="button"
              onClick={() => setShowLocationPicker(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </button>
          </div>
          <div className="space-y-2">
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
            >
              {ICESI_ZONES.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Detalle (ej. Piso 2 frente al salón 204)"
              value={zoneDetail}
              onChange={(e) => setZoneDetail(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => void handleSendLocation()}
              className="w-full rounded-lg bg-primary py-2 text-xs font-display font-bold text-primary-foreground hover:opacity-90"
            >
              Enviar ubicación en el chat
            </button>
          </div>
        </div>
      )}

      {/* Quick Replies Carousel */}
      <div className="border-t border-border/80 bg-background/50 px-3 py-1.5">
        <QuickReplies onSelect={(text) => void handleSend(text, 'quick')} disabled={sending} />
      </div>

      {/* Input Form */}
      <form onSubmit={onSubmit} className="border-t border-border bg-card p-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowLocationPicker((prev) => !prev)}
            title="Compartir ubicación en el campus"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors ${
              showLocationPicker
                ? 'border-primary bg-primary/20 text-primary'
                : 'border-border bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
            }`}
          >
            <MapPin size={18} />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe un mensaje de coordinación..."
            className="flex-1 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform hover:opacity-90 active:scale-95 disabled:opacity-40"
            aria-label="Enviar mensaje"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  )
}
