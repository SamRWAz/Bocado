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

export type TabId = 'comprar' | 'vender' | 'metricas'
