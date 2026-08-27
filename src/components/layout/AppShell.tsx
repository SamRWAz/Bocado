import { BarChart3, ClipboardList, LogOut, ShoppingBag, Store, UserRound } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { initials } from '../../lib/format'

const links = [
  { to: '/catalogo', label: 'Catálogo', icon: ShoppingBag },
  { to: '/vender', label: 'Vender', icon: Store },
  { to: '/pedidos', label: 'Pedidos', icon: ClipboardList },
  { to: '/metricas', label: 'Métricas', icon: BarChart3 },
]

export function AppShell() {
  const { user, logout } = useAuth()
  const { count } = useCart()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="text-xl">🍿</span>
            Bocado
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-display font-medium ${
                    isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`
                }
              >
                <link.icon size={16} />
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/carrito"
              className="relative rounded-lg bg-secondary px-3 py-2 text-sm font-display font-medium"
            >
              Carrito
              {count > 0 && (
                <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-primary px-1 text-center text-[10px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>
            {user ? (
              <>
                <Link
                  to="/cuenta"
                  className="hidden items-center gap-2 rounded-lg px-2 py-1.5 text-sm sm:flex"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-display font-bold text-primary">
                    {initials(user.name)}
                  </span>
                  <span className="max-w-[10rem] truncate">{user.name}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="rounded-lg p-2 text-muted-foreground hover:text-foreground"
                  aria-label="Cerrar sesión"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link to="/login" className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm">
                <UserRound size={16} /> Entrar
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
                `whitespace-nowrap rounded-lg px-3 py-2 text-xs font-display font-medium ${
                  isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`
              }
            >
              {link.label}
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
