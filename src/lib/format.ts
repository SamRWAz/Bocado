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
  return parts.length > 1 ? parts[1] : seller
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
  return `/producto/${encodeURIComponent(seller)}`
}

export function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString)
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })
  } catch {
    return ''
  }
}

export function timeAgo(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime()
    const diffSec = Math.floor(diffMs / 1000)
    if (diffSec < 60) return 'Ahora mismo'
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `Hace ${diffMin}m`
    const diffHours = Math.floor(diffMin / 60)
    if (diffHours < 24) return `Hace ${diffHours}h`
    return new Date(isoString).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
  } catch {
    return ''
  }
}

export function productDescription(product: { description?: string | null; category: string }) {
  const text = product.description?.trim()
  if (text) return text
  const tags = parseTags(product.category)
  return tags.length ? tags.join(' · ') : 'Snack preparado para entrega en campus.'
}
