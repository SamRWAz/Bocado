import {
  ArrowLeft,
  Check,
  CheckCheck,
  ExternalLink,
  MessageSquare,
  Send,
  ShoppingBag,
  Sparkles,
  User,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { canSell, useAuth } from '../../context/AuthContext'
import {
  getMessagesByConversation,
  isUserSender,
  markConversationAsRead,
  sendMessage,
  subscribeToChatUpdates,
} from '../../lib/chat'
import { formatTime, initials } from '../../lib/format'
import { playKeyBeep } from '../../lib/sounds'
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
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

  const handleSend = async (textToSend?: string, customType: ChatMessage['messageType'] = 'text') => {
    const text = textToSend ?? inputText
    if (!text.trim() || !user || sending) return

    setSending(true)
    playKeyBeep(700)
    try {
      const targetRecipientId =
        partnerId ||
        (conversationId.startsWith('direct_')
          ? conversationId
              .replace('direct_', '')
              .split('_')
              .find((id) => id !== user.id.toLowerCase())
          : '') ||
        'partner'
      const targetRecipientName = partnerName || 'Usuario'

      await sendMessage({
        conversationId,
        senderId: user.id,
        senderName: user.name,
        recipientId: targetRecipientId,
        recipientName: targetRecipientName,
        text: text.trim(),
        orderId,
        productId,
        productName,
        messageType: customType,
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

  return (
    <div
      className={`flex flex-col rounded-3xl border border-border/80 bg-card/95 shadow-2xl backdrop-blur-xl overflow-hidden transition-all ${
        compact ? 'h-[520px] w-full max-w-md' : 'h-[680px] w-full'
      }`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-border/70 bg-secondary/30 px-5 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary text-muted-foreground hover:text-foreground lg:hidden"
              aria-label="Volver a lista de chats"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary/30 via-amber-500/20 to-primary/10 font-display text-sm font-black text-primary border border-primary/30 shadow-inner">
            {initials(partnerName) || <User size={18} />}
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card bg-emerald-500" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-foreground text-sm sm:text-base truncate leading-tight">
                {partnerName}
              </h3>
              <span className="rounded-full bg-primary/15 border border-primary/20 px-2 py-0.5 text-[9px] font-mono font-bold text-primary shrink-0">
                Campus Icesi
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Coordinación directa de entrega</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {orderId && (
            <Link
              to="/pedidos"
              className="hidden sm:inline-flex items-center gap-1 rounded-xl bg-secondary/80 border border-border/80 px-3 py-1.5 text-xs font-display font-semibold text-foreground hover:border-primary/40 transition-colors"
            >
              <ShoppingBag size={13} className="text-primary" />
              <span>Ver Pedido</span>
            </Link>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Related Order or Product Banner */}
      {(orderId || productName) && (
        <div className="flex items-center justify-between border-b border-border/60 bg-gradient-to-r from-primary/10 via-secondary/40 to-transparent px-5 py-2.5 text-xs">
          <div className="flex items-center gap-2.5 text-muted-foreground min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <ShoppingBag size={14} />
            </div>
            <div className="min-w-0 truncate">
              <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                {orderId ? `Apartado #${orderId.slice(-6).toUpperCase()}` : 'Snack de Interés'}
              </span>
              <strong className="text-foreground text-xs truncate block">
                {productName || 'Snack del campus'}
              </strong>
            </div>
          </div>

          {productId && (
            <Link
              to={`/producto/${productId}`}
              className="flex items-center gap-1 rounded-lg bg-secondary/80 px-2.5 py-1 text-[11px] font-display font-semibold text-primary hover:bg-secondary transition-colors shrink-0"
            >
              <span>Ver Snack</span>
              <ExternalLink size={11} />
            </Link>
          )}
        </div>
      )}

      {/* Messages List Area */}
      <div className="flex-1 space-y-3 overflow-y-auto p-5 no-scrollbar">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground p-6">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary border border-primary/20 shadow-lg">
              <MessageSquare size={28} />
            </div>
            <h4 className="font-display text-base font-bold text-foreground">
              Conversación con {partnerName}
            </h4>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Acuerda el punto de encuentro en el campus, pregunta por ingredientes o avisa si vas en camino.
            </p>
            <div className="mt-4 flex items-center gap-1.5 rounded-xl bg-secondary/60 px-3 py-1.5 text-[11px] font-mono text-muted-foreground">
              <Sparkles size={13} className="text-primary" />
              <span>Tus mensajes están protegidos en el campus</span>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = isUserSender(msg, user?.id, user?.name)
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fadeIn`}
              >
                <div
                  className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm shadow-md transition-all ${
                    isMe
                      ? 'rounded-tr-xs bg-gradient-to-r from-primary to-amber-500 text-primary-foreground font-medium shadow-primary/15'
                      : 'rounded-tl-xs border border-border/80 bg-secondary/80 text-foreground backdrop-blur-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed break-words text-xs sm:text-sm">
                    {msg.text}
                  </p>
                </div>

                <div className="mt-1 flex items-center gap-1.5 px-2 text-[10px] text-muted-foreground font-mono">
                  <span>{formatTime(msg.timestamp)}</span>
                  {isMe && (
                    <span title={msg.read ? 'Leído' : 'Enviado'}>
                      {msg.read ? (
                        <CheckCheck size={13} className="text-emerald-400 inline" />
                      ) : (
                        <Check size={13} className="text-muted-foreground inline" />
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

      {/* Quick Replies Carousel */}
      <div className="border-t border-border/60 bg-secondary/20 px-4 py-2">
        <QuickReplies onSelect={(text) => void handleSend(text, 'quick')} disabled={sending} />
      </div>

      {/* Input Form */}
      <form onSubmit={onSubmit} className="border-t border-border/80 bg-card p-3.5">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Escribe a ${partnerName}...`}
            className="flex-1 rounded-2xl border border-border bg-secondary/80 px-4 py-3 text-xs sm:text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-amber-500 text-primary-foreground shadow-md shadow-primary/25 transition-transform hover:brightness-110 active:scale-95 disabled:opacity-40"
            aria-label="Enviar mensaje"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  )
}
