import {
  BarChart3,
  Bike,
  ChevronDown,
  ClipboardList,
  LogOut,
  MessageSquare,
  ShoppingBag,
  ShoppingCart,
  Store,
  UserRound,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { canBuy, canSell, isAdmin, isTendedero, useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { getUnreadCount, subscribeToChatUpdates } from '../../lib/chat'
import { initials } from '../../lib/format'
import { BrandMark } from '../BrandMark'
import { ThemeToggle } from '../ThemeToggle'

export function AppShell() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const [unreadChat, setUnreadChat] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  const seller = canSell(user?.role)
  const buyer = canBuy(user?.role)
  const tendedero = isTendedero(user?.role)
  const admin = isAdmin(user?.role)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  // Primary navigation links tailored strictly to active role
  const mainLinks = [
    ...(buyer || !user ? [{ to: '/catalogo', label: 'Catálogo', icon: ShoppingBag }] : []),
    ...(seller ? [{ to: '/vender', label: 'Mis Snacks (Vender)', icon: Store }] : []),
    ...(tendedero ? [{ to: '/entregas', label: 'Entregas en Campus', icon: Bike }] : []),
    {
      to: '/pedidos',
      label: 'Mis Pedidos',
      icon: ClipboardList,
    },
    { to: '/mensajes', label: 'Mensajes', icon: MessageSquare, badge: unreadChat },
  ]

  // Role labels for display
  const roleNameMap: Record<string, string> = {
    comprar: 'Comprador',
    vender: 'Vendedor',
    comprar_vender: 'Comprar y Vender (Ambos)',
    ambos: 'Comprar y Vender (Ambos)',
    entregar: 'Tendedero / Repartidor',
    admin: 'Administrador',
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/" className="flex items-center shrink-0">
            <BrandMark size="sm" />
          </Link>

          {/* Clean Main Nav (Desktop) */}
          <nav className="hidden items-center gap-1.5 md:flex">
            {mainLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `relative flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-display font-semibold transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  }`
                }
              >
                <link.icon size={15} />
                <span>{link.label}</span>
                {Boolean(link.badge) && (
                  <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Cart Button (Only for buyers) */}
            {buyer && (
              <Link
                to="/carrito"
                className="relative flex items-center gap-1.5 rounded-xl bg-secondary/60 px-3 py-2 text-xs sm:text-sm font-display font-medium text-foreground hover:bg-secondary transition-colors"
                title="Carrito de compras"
              >
                <ShoppingCart size={16} className="text-primary" />
                <span className="hidden sm:inline">Carrito</span>
                {count > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-center text-[10px] font-bold text-primary-foreground">
                    {count}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="relative" ref={menuRef}>
                {/* Desplegable superior de rol y paneles adicionales */}
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card px-2.5 py-1.5 text-xs sm:text-sm font-medium hover:bg-secondary/60 transition-all cursor-pointer shadow-2xs"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-display font-black text-primary">
                    {initials(user.name)}
                  </span>
                  <div className="hidden sm:flex flex-col text-left leading-tight">
                    <span className="max-w-[8rem] truncate font-bold text-xs">{user.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {roleNameMap[user.role] || user.role}
                    </span>
                  </div>
                  <ChevronDown size={14} className={`text-muted-foreground transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-card p-1.5 shadow-xl z-50 animate-fadeIn space-y-1">
                    <div className="px-3 py-2 border-b border-border/60">
                      <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
                      <span className="inline-block rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-mono font-bold text-primary uppercase mt-1">
                        {roleNameMap[user.role] || user.role}
                      </span>
                    </div>

                    {/* Paneles desplegados según rol */}
                    {buyer && (
                      <Link
                        to="/pedidos"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
                      >
                        <ShoppingBag size={15} className="text-primary" />
                        <span>Mis Compras / Pedidos</span>
                      </Link>
                    )}

                    {seller && (
                      <Link
                        to="/vender"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
                      >
                        <Store size={15} className="text-primary" />
                        <span>Panel Vendedor (Mis Snacks)</span>
                      </Link>
                    )}

                    {tendedero && (
                      <Link
                        to="/entregas"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
                      >
                        <Bike size={15} className="text-emerald-600" />
                        <span>Panel Entregas Tendedero</span>
                      </Link>
                    )}

                    {admin && (
                      <Link
                        to="/metricas"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
                      >
                        <BarChart3 size={15} className="text-indigo-600" />
                        <span>Métricas de Plataforma</span>
                      </Link>
                    )}

                    <Link
                      to="/cuenta"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      <UserRound size={15} />
                      <span>Configurar Cuenta</span>
                    </Link>

                    <div className="border-t border-border/60 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false)
                          void logout()
                        }}
                        className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors text-left"
                      >
                        <LogOut size={15} />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-95 transition-opacity"
              >
                <UserRound size={14} /> Entrar
              </Link>
            )}
          </div>
        </div>

        {/* Clean Mobile Navigation Bar */}
        <nav className="flex gap-1 overflow-x-auto border-t border-border px-3 py-2 no-scrollbar md:hidden">
          {mainLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-display font-medium ${
                  isActive ? 'bg-primary text-primary-foreground font-bold' : 'bg-secondary/70 text-secondary-foreground'
                }`
              }
            >
              <link.icon size={13} />
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
