import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { CART_KEY } from '../lib/constants'
import type { CartItem, Product } from '../types'
import { useAuth } from './AuthContext'

type CartContextValue = {
  items: CartItem[]
  count: number
  total: number
  add: (product: Product, qty?: number) => void
  setQty: (productId: string, qty: number) => void
  remove: (productId: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const readCart = (key: string): CartItem[] => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

const mergeCarts = (base: CartItem[], extra: CartItem[]) => {
  const map = new Map(base.map((item) => [item.productId, item]))
  extra.forEach((item) => {
    const current = map.get(item.productId)
    map.set(
      item.productId,
      current ? { ...current, qty: Math.min(current.stock, current.qty + item.qty) } : item,
    )
  })
  return [...map.values()]
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const storageKey = `${CART_KEY}.${user?.id ?? 'guest'}`
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const current = readCart(storageKey)
    if (user) {
      const guest = readCart(`${CART_KEY}.guest`)
      const merged = mergeCarts(current, guest)
      setItems(merged)
      localStorage.setItem(storageKey, JSON.stringify(merged))
      if (guest.length) localStorage.removeItem(`${CART_KEY}.guest`)
      return
    }
    setItems(current)
  }, [storageKey, user])

  const persist = (next: CartItem[]) => {
    setItems(next)
    localStorage.setItem(storageKey, JSON.stringify(next))
  }

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((sum, item) => sum + item.qty, 0),
      total: items.reduce((sum, item) => sum + item.qty * item.price, 0),
      add: (product, qty = 1) => {
        const found = items.find((item) => item.productId === product.id)
        if (found) {
          persist(
            items.map((item) =>
              item.productId === product.id
                ? { ...item, qty: Math.min(product.stock, item.qty + qty), stock: product.stock }
                : item,
            ),
          )
          return
        }
        persist([
          ...items,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            qty: Math.min(product.stock, qty),
            image_url: product.image_url,
            seller: product.seller,
            stock: product.stock,
          },
        ])
      },
      setQty: (productId, qty) => {
        persist(
          items.map((item) =>
            item.productId === productId
              ? { ...item, qty: Math.max(1, Math.min(item.stock, qty)) }
              : item,
          ),
        )
      },
      remove: (productId) => persist(items.filter((item) => item.productId !== productId)),
      clear: () => persist([]),
    }),
    [items, storageKey],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}
