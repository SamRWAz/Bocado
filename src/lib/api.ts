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

function normalizeProduct(raw: any): Product {
  if (!raw) return raw
  const cat = typeof raw.category === 'string' ? raw.category : ''
  let building: 'D' | 'M' | 'L' | string = 'D'
  if (cat.includes('edif:M')) building = 'M'
  else if (cat.includes('edif:L')) building = 'L'
  else if (cat.includes('edif:D')) building = 'D'

  let localDesc = raw.description || null
  if (!localDesc && typeof window !== 'undefined' && window.localStorage) {
    try {
      localDesc = localStorage.getItem(`bocado_desc_${raw.id}`) || null
    } catch {
      // ignore
    }
  }

  return {
    ...raw,
    description: localDesc,
    preferredBuilding: building,
  }
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .neq('category', 'archived')
    .order('created_at', { ascending: false })
  if (error) {
    console.error(error)
    return []
  }
  return (data ?? []).filter((p) => p.category !== 'archived').map(normalizeProduct)
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
  if (error || !data || data.category === 'archived') return null
  return normalizeProduct(data)
}

export async function deleteProduct(id: string): Promise<boolean> {
  const res = await supabase.from('products').delete().eq('id', id)
  const fallback = await supabase
    .from('products')
    .update({ category: 'archived', sold_out: true, stock: 0 })
    .eq('id', id)
  if (fallback.error && res.error) {
    console.error(fallback.error || res.error)
    return false
  }
  return true
}

export async function insertProduct(
  product: Omit<Product, 'id' | 'created_at'>,
): Promise<Product | null> {
  // PostgREST strict schema: Only send actual columns that exist in the Supabase 'products' table
  const payload: Record<string, unknown> = {
    name: product.name,
    price: product.price,
    stock: product.stock,
    sold_out: product.sold_out ?? false,
    seller: product.seller,
    intent_count: product.intent_count ?? 0,
    image_url: product.image_url ?? null,
    category: product.category,
  }

  const { data, error } = await supabase.from('products').insert(payload).select().single()
  if (error) {
    console.error('Error al insertar producto en Supabase:', error)
    return null
  }

  if (product.description && data?.id && typeof window !== 'undefined') {
    try {
      localStorage.setItem(`bocado_desc_${data.id}`, product.description)
    } catch {
      // ignore
    }
  }

  return normalizeProduct({
    ...data,
    description: product.description,
    preferredBuilding: product.preferredBuilding || 'D',
  })
}

export async function updateProduct(id: string, patch: Partial<Product>): Promise<void> {
  const allowedKeys = ['name', 'price', 'stock', 'sold_out', 'seller', 'intent_count', 'image_url', 'category']
  const cleanPatch: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(patch)) {
    if (allowedKeys.includes(key)) {
      cleanPatch[key] = val
    }
  }

  if (patch.description && typeof window !== 'undefined') {
    try {
      localStorage.setItem(`bocado_desc_${id}`, patch.description)
    } catch {
      // ignore
    }
  }

  if (Object.keys(cleanPatch).length === 0) return

  const { error } = await supabase.from('products').update(cleanPatch).eq('id', id)
  if (error) console.error('Error al actualizar producto en Supabase:', error)
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
