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
