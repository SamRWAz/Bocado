export type UserRole = 'comprar' | 'vender' | 'ambos' | 'admin'

export type AuthUser = {
  id: string
  email: string
  name: string
  campus: string
  role: UserRole
}

export type Session = {
  token: string
  user: AuthUser
  expiresAt: number
  source: 'supabase' | 'local'
}

export type DietaryTag =
  | 'vegano'
  | 'vegetariano'
  | 'sin-gluten'
  | 'fit-proteico'
  | 'sin-azucar'
  | 'keto'
  | 'contiene-nueces'
  | 'sin-lactosa'

export type SellerPresence = {
  sellerId: string
  sellerName: string
  zone: string
  detail: string
  activeUntil: string
  isOnline: boolean
  updatedAt: string
}

export type Product = {
  id: string
  name: string
  price: number
  stock: number
  sold_out: boolean
  seller: string
  intent_count: number
  created_at: string
  image_url: string | null
  category: string
  description?: string | null
  dietary?: DietaryTag[]
  sellerPresence?: SellerPresence | null
}

export type Metrics = {
  id: number
  total_intents: number
  inventory_updates: number
  commission_accepted: number
  commission_rejected: number
  useful_yes: number
  useful_no: number
}

export type MetricKey = Exclude<keyof Metrics, 'id'>

export type CartItem = {
  productId: string
  name: string
  price: number
  qty: number
  image_url: string | null
  seller: string
  stock: number
}

export type OrderStatus = 'reservado' | 'listo' | 'entregado' | 'cancelado'

export type OrderItem = {
  productId: string
  name: string
  price: number
  qty: number
  image_url: string | null
}

export type Order = {
  id: string
  buyerId: string
  buyerName: string
  buyerEmail: string
  sellerKey: string
  sellerName: string
  items: OrderItem[]
  total: number
  pickup: string
  note: string
  status: OrderStatus
  createdAt: string
  isGuaranteed?: boolean
  reserveFee?: number
}

export type StoredUser = AuthUser & {
  passwordHash: string
}

export type ChatMessageType = 'text' | 'quick' | 'location' | 'status'

export type ChatMessage = {
  id: string
  conversationId: string
  orderId?: string
  productId?: string
  productName?: string
  senderId: string
  senderName: string
  recipientId: string
  recipientName: string
  text: string
  messageType?: ChatMessageType
  locationZone?: string
  timestamp: string
  read: boolean
}

export type ConversationSummary = {
  id: string
  partnerId: string
  partnerName: string
  orderId?: string
  productName?: string
  lastMessage: string
  lastTimestamp: string
  unreadCount: number
  orderStatus?: OrderStatus
}
