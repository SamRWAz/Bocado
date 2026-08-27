const toBase64Url = (value: ArrayBuffer | string) => {
  const bytes =
    typeof value === 'string' ? new TextEncoder().encode(value) : new Uint8Array(value)
  let binary = ''
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

const fromBase64Url = (value: string) => {
  const padded = value.replaceAll('-', '+').replaceAll('_', '/') + '==='.slice((value.length + 3) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

const getKey = async () => {
  const secret = import.meta.env.VITE_JWT_SECRET || 'bocado-poc-hs256'
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

export async function signJwt(payload: Record<string, unknown>, ttlMs = 1000 * 60 * 60 * 24 * 7) {
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = toBase64Url(
    JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor((Date.now() + ttlMs) / 1000),
    }),
  )
  const data = new TextEncoder().encode(`${header}.${body}`)
  const signature = await crypto.subtle.sign('HMAC', await getKey(), data)
  return `${header}.${body}.${toBase64Url(signature)}`
}

export async function verifyJwt<T>(token: string): Promise<(T & { exp: number }) | null> {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [header, body, signature] = parts
  const data = new TextEncoder().encode(`${header}.${body}`)
  const valid = await crypto.subtle.verify('HMAC', await getKey(), fromBase64Url(signature), data)
  if (!valid) return null
  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as T & { exp: number }
    if (payload.exp * 1000 < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export function decodeJwtPayload<T>(token: string): T | null {
  const parts = token.split('.')
  if (parts.length < 2) return null
  try {
    return JSON.parse(new TextDecoder().decode(fromBase64Url(parts[1]))) as T
  } catch {
    return null
  }
}
