export type UserRole =
  | 'comprar_vender'
  | 'ambos'
  | 'comprar'
  | 'vender'
  | 'entregar'
  | 'admin'

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

export type OrderStatus =
  | 'solicitado' // Pedido creado por el comprador, esperando que un tendedero lo tome
  | 'tomado' // Un tendedero aceptó la solicitud
  | 'en_camino' // El tendedero recogió el snack y va hacia el comprador
  | 'entregado_por_tendedero' // El tendedero confirmó entrega
  | 'entregado' // Entregado
  | 'completado' // Todas las partes confirmaron
  | 'reservado' // compatibilidad previa
  | 'listo' // compatibilidad previa
  | 'cancelado'

export type PaymentMethod = 'qr_nequi' | 'tarjeta' | 'qr_bancolombia' | 'efectivo_vitrina' | 'efectivo' | 'wompi'

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
  pickup: string // Lugar de recogida / origen (ej. Edificio D - Plazoleta)
  deliveryLocation?: string // Lugar exacto donde el cliente recibe (ej. Edificio E - Piso 2)
  deliveryFee?: number // Tarifa de envío en campus ($200 COP)
  note: string
  status: OrderStatus
  createdAt: string
  // Tendedero / Mensajería interna en campus
  tendederoId?: string
  tendederoName?: string
  tendederoAcceptedAt?: string
  tendederoConfirmed?: boolean // Tendedero confirmó entrega
  tendederoConfirmedAt?: string
  buyerConfirmed?: boolean // Cliente confirmó recibido
  buyerConfirmedAt?: string
  sellerPaidConfirmed?: boolean // Vendedor / receptor confirmó dinero recibido
  sellerPaidConfirmedAt?: string
  // Compatibilidad y desglose financiero
  isGuaranteed?: boolean
  reserveFee?: number
  lockerId?: string
  lockerHubId?: string
  lockerHubName?: string
  lockerNumber?: string
  depositPin?: string
  claimPin?: string
  paymentMethod?: PaymentMethod
  paymentStatus?: 'pendiente' | 'pagado'
  claimedAt?: string
  platformCommission?: number
  sellerNetRevenue?: number
  // Nuevos campos de geolocalización y pasarela
  buyerBuilding?: string // Edificio actual del comprador
  sellerBuilding?: string // Edificio confirmado por el vendedor
  sellerBuildingConfirmed?: boolean // Vendedor ya respondió en qué edificio está
  bocadoCommission?: number // Comisión Bocado ($100 - $500 COP)
  vendorPayout?: number // Lo que cobra el vendedor por el producto
  tendederoPayout?: number // Lo que cobra el tendedero (producto + envío)
  transactionId?: string // Identificador de pasarela de pago digital
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

