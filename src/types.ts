export type UserRole = 'comprar' | 'vender' | 'ambos'

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
}

export type StoredUser = AuthUser & {
  passwordHash: string
}
