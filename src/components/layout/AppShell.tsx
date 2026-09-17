import {
  BarChart3,
  Boxes,
  ClipboardList,
  LogOut,
  MessageSquare,
  ShoppingBag,
  Store,
  UserRound,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { canSell, isAdmin, useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { getUnreadCount, subscribeToChatUpdates } from '../../lib/chat'
import { initials } from '../../lib/format'
import { ThemeToggle } from '../ThemeToggle'
import { BrandMark } from '../BrandMark'

export function AppShell() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const [unreadChat, setUnreadChat] = useState(0)
  const seller = canSell(user?.role)
  const admin = isAdmin(user?.role)

  useEffect(() => {
    if (!user) {
      setUnreadChat(0)
      return
    }
    const update = () => setUnreadChat(getUnreadCount(user.id, seller, user.name))
    update()
    const unsubscribe = subscribeToChatUpdates(update)
    return () => unsubscribe()
  }, [user, seller])

  const links = [
    { to: '/catalogo', label: 'Snacks', icon: ShoppingBag },
    { to: '/vitrina', label: 'Vitrina 24/7', icon: Boxes },
    { to: '/mensajes', label: 'Mensajes', icon: MessageSquare, badge: unreadChat },
    ...(seller ? [{ to: '/vender', label: 'Mi Puesto / Vender', icon: Store }] : []),
    { to: '/pedidos', label: 'Pedidos / Casilleros', icon: ClipboardList },
    ...(admin ? [{ to: '/metricas', label: 'Métricas', icon: BarChart3 }] : []),
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-brand text-xl font-bold">
            <BrandMark size={28} className="text-primary" />
            Bocado
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-display font-medium transition-colors ${
                    isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`
                }
              >
                <link.icon size={16} />
                <span>{link.label}</span>
                {Boolean(link.badge) && (
                  <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground animate-pulse">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/carrito"
              className="relative flex items-center gap-1.5 rounded-lg bg-secondary/60 px-3 py-2 text-xs sm:text-sm font-display font-medium text-foreground hover:bg-secondary transition-colors"
            >
              <ShoppingBag size={16} className="text-primary" />
              <span>Carrito</span>
              {count > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-center text-[10px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>
            {user ? (
              <>
                <Link
                  to="/cuenta"
                  className="hidden items-center gap-2 rounded-lg px-2 py-1.5 text-sm sm:flex hover:bg-secondary/40 transition-colors"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-display font-bold text-primary">
                    {initials(user.name)}
                  </span>
                  <span className="max-w-[10rem] truncate font-medium text-xs">{user.name}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="rounded-lg p-2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Cerrar sesión"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link to="/login" className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">
                <UserRound size={14} /> Entrar
              </Link>
            )}
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-border px-2 py-2 no-scrollbar md:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-display font-medium ${
                  isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`
              }
            >
              <link.icon size={14} />
              <span>{link.label}</span>
              {Boolean(link.badge) && (
                <span className="flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[8px] font-bold text-white">
                  {link.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
