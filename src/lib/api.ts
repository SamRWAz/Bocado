import type { MetricKey, Metrics, Product } from '../types'
import { supabase } from './supabase'

const emptyMetrics: Omit<Metrics, 'id'> = {
  total_intents: 0,
  inventory_updates: 0,
  commission_accepted: 0,
  commission_rejected: 0,
  useful_yes: 0,
  useful_no: 0,
}

export async function uploadProductImage(file: File): Promise<string | null> {
  const ext = file.name.split('.').pop()
  const path = `${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('product-images').upload(path, file)
  if (error) {
    console.error(error)
    return null
  }
  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return data.publicUrl
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error(error)
    return []
  }
  return data ?? []
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
  if (error) return null
  return data
}

export async function insertProduct(
  product: Omit<Product, 'id' | 'created_at'>,
): Promise<Product | null> {
  const payload: Record<string, unknown> = { ...product }
  if (!product.description) delete payload.description

  const first = await supabase.from('products').insert(payload).select().single()
  if (!first.error) return first.data

  if (payload.description) {
    delete payload.description
    const retry = await supabase.from('products').insert(payload).select().single()
    if (!retry.error) return retry.data
    console.error(retry.error)
    return null
  }

  console.error(first.error)
  return null
}

export async function updateProduct(id: string, patch: Partial<Product>): Promise<void> {
  const { error } = await supabase.from('products').update(patch).eq('id', id)
  if (error) console.error(error)
}

export async function fetchMetrics(): Promise<Omit<Metrics, 'id'>> {
  const { data, error } = await supabase.from('metrics').select('*').eq('id', 1).single()
  if (error || !data) return emptyMetrics
  return data
}

export async function incrementMetric(key: MetricKey): Promise<void> {
  const current = await fetchMetrics()
  const next = (current[key] || 0) + 1
  const { error } = await supabase.from('metrics').update({ [key]: next }).eq('id', 1)
  if (error) console.error(error)
}
