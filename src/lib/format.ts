export function money(value: number) {
  return `$${value.toLocaleString('es-CO')}`
}

export function displaySeller(seller: string) {
  return seller.split('::')[0] || seller
}

export function encodeSeller(name: string, userId: string) {
  return `${name}::${userId}`
}

export function sellerUserId(seller: string) {
  const parts = seller.split('::')
  return parts.length > 1 ? parts[1] : null
}

export function ownsListing(seller: string, userId: string, name: string) {
  return seller === encodeSeller(name, userId) || seller.endsWith(`::${userId}`)
}

export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function parseTags(category: string) {
  return category
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export function joinTags(tags: string[]) {
  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))].join(', ')
}

export function hasTag(category: string, tag: string) {
  return parseTags(category).includes(tag)
}

export function shopSlug(seller: string) {
  return sellerUserId(seller) || displaySeller(seller)
}

export function shopPath(seller: string) {
  return `/tienda/${encodeURIComponent(shopSlug(seller))}`
}

export function productDescription(product: { description?: string | null; category: string }) {
  const text = product.description?.trim()
  if (text) return text
  const tags = parseTags(product.category)
  return tags.length ? tags.join(' · ') : 'Sin descripción'
}
