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

export type LockerStatus =
  | 'disponible'
  | 'esperando_deposito'
  | 'listo_para_retiro'
  | 'abierto'

export type LockerTempType = 'ambiente' | 'refrigerado'

export type Locker = {
  id: string
  hubId: 'hub_edificio_d' | 'hub_edificio_m' | 'hub_edificio_l' | string
  hubName: string
  buildingCode: 'D' | 'M' | 'L' | string
  number: string
  code: string // e.g. D-01, M-14, L-20
  status: LockerStatus
  tempType: LockerTempType
  productId?: string
  productName?: string
  productPrice?: number
  productImage?: string | null
  sellerId?: string
  sellerName?: string
  buyerId?: string
  buyerName?: string
  depositPin?: string // e.g. DEP-4912
  claimPin?: string // e.g. 7492
  orderId?: string
  isLocked: boolean
  updatedAt: string
  // Commission & payment breakdown (5% platform fee)
  platformCommission?: number
  sellerNetRevenue?: number
  paidAt?: string
}

export type LockerHub = {
  id: 'hub_edificio_d' | 'hub_edificio_m' | 'hub_edificio_l' | string
  name: string
  zone: string
  building: string
  detail: string
  icon: string
  totalLockers: number
  isOnline: boolean
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
  lockerId?: string
  lockerHubId?: string
  lockerNumber?: string
  preferredBuilding?: 'D' | 'M' | 'L' | string
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
  lockerHubId?: string
  lockerNumber?: string
  building?: 'D' | 'M' | 'L' | string
  reservedAt?: string
}

export type OrderStatus = 'reservado' | 'listo' | 'entregado' | 'cancelado'

export type PaymentMethod = 'qr_nequi' | 'tarjeta' | 'qr_bancolombia' | 'efectivo_vitrina'

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
  // Smart Locker & Commission properties
  lockerId?: string
  lockerHubId?: string
  lockerHubName?: string
  lockerNumber?: string
  depositPin?: string
  claimPin?: string
  paymentMethod?: PaymentMethod
  paymentStatus?: 'pendiente' | 'pagado'
  claimedAt?: string
  platformCommission?: number // 5% fee
  sellerNetRevenue?: number // 95% to seller
}

export type StoredUser = AuthUser & {
  passwordHash: string
}

export type ChatMessageType = 'text' | 'quick' | 'location' | 'status' | 'locker_drop' | 'payment_receipt'

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
  lockerCode?: string
  claimPin?: string
  depositPin?: string
  amount?: number
  commission?: number
  netRevenue?: number
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

