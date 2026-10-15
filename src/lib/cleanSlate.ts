import { supabase } from './supabase'

const RESET_KEY = 'bocado.app_reset'
const RESET_VERSION = '2026-v2-clean'

export function initializeCleanSlate(): void {
  try {
    if (typeof window === 'undefined') return

    const current = localStorage.getItem(RESET_KEY)
    if (current === RESET_VERSION) return

    // Legacy keys to clear
    const legacyKeys = [
      'bocado.session',
      'bocado.session_v2',
      'bocado.users',
      'bocado.users_v2',
      'bocado.orders',
      'bocado.orders_v2',
      'bocado.cart',
      'bocado.cart.guest',
      'bocado.cart_v2',
      'bocado.chats',
      'bocado.chat_messages',
      'bocado.chat_messages_v2',
      'bocado.presence',
      'bocado.seller_presences',
      'bocado.seller_presences_v2',
      'bocado.lockers',
      'bocado.smart_lockers',
      'bocado.smart_lockers_v2',
      'bocado.smart_lockers_v3',
      'bocado_conversations',
    ]

    for (const key of legacyKeys) {
      localStorage.removeItem(key)
    }

    // Also remove any cart items for specific users or supabase auth tokens
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (key) {
        if (
          key.startsWith('bocado.cart') ||
          key.startsWith('sb-') ||
          (key.startsWith('bocado.') && key !== 'bocado.theme' && key !== RESET_KEY)
        ) {
          localStorage.removeItem(key)
        }
      }
    }

    // Sign out from Supabase client as well
    void supabase.auth.signOut()

    localStorage.setItem(RESET_KEY, RESET_VERSION)
  } catch (err) {
    console.error('Failed to initialize clean slate:', err)
  }
}
