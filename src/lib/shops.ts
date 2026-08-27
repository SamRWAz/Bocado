import { displaySeller, hasTag, parseTags, shopSlug } from './format'
import type { Product } from '../types'

export type Shop = {
  slug: string
  name: string
  seller: string
  products: Product[]
  tags: string[]
  cover: string | null
}

export function groupShops(products: Product[]): Shop[] {
  const buckets = new Map<string, Product[]>()

  for (const product of products) {
    const slug = shopSlug(product.seller)
    const list = buckets.get(slug) ?? []
    list.push(product)
    buckets.set(slug, list)
  }

  return [...buckets.entries()].map(([slug, items]) => ({
    slug,
    name: displaySeller(items[0].seller),
    seller: items[0].seller,
    products: items,
    tags: [...new Set(items.flatMap((item) => parseTags(item.category)))],
    cover: items.find((item) => item.image_url)?.image_url ?? null,
  }))
}

export function shopHasTag(shop: Shop, tag: string) {
  return shop.products.some((product) => hasTag(product.category, tag))
}

export function shopMatchesQuery(shop: Shop, query: string) {
  const q = query.toLowerCase()
  if (!q) return true
  if (shop.name.toLowerCase().includes(q)) return true
  return shop.products.some(
    (product) =>
      product.name.toLowerCase().includes(q) || product.category.toLowerCase().includes(q),
  )
}

export function findShop(products: Product[], slug: string) {
  const decoded = decodeURIComponent(slug)
  return groupShops(products).find((shop) => shop.slug === decoded || shop.slug === slug) ?? null
}
