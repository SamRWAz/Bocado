import { BookmarkCheck } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { canSell, useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { ThemeToggle } from '../ThemeToggle'

function SectionNav() {
  return (
    <>
      <NavLink
        to="/catalogo"
        className={({ isActive }) =>
          isActive
            ? 'text-primary font-bold'
            : 'hover:text-foreground font-medium transition-colors'
        }
      >
        Catálogo de Snacks
      </NavLink>
    </>
  )
}

export function PublicHeader() {
  const { user } = useAuth()
  const { count } = useCart()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="font-display text-2xl font-medium tracking-tight text-foreground hover:text-primary transition-colors"
        >
          Bocado
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <SectionNav />
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/carrito"
            className="relative flex items-center gap-1.5 rounded-xl bg-secondary/60 px-3 py-2 text-xs sm:text-sm font-display font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            <BookmarkCheck size={16} className="text-primary" />
            <span className="hidden sm:inline">Apartados</span>
            {count > 0 && (
              <span className="min-w-5 rounded-full bg-primary px-1.5 py-0.2 text-center text-[10px] font-bold text-primary-foreground animate-pulse">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <Link
              to={canSell(user.role) ? '/vender' : '/pedidos'}
              className="rounded-xl bg-primary px-4 py-2 text-xs sm:text-sm font-display font-semibold text-primary-foreground shadow-sm hover:opacity-90"
            >
              Ir a la app
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl px-3 py-2 text-xs sm:text-sm font-display font-medium text-muted-foreground hover:text-foreground"
              >
                Entrar
              </Link>
              <Link
                to="/registro"
                className="rounded-xl bg-primary px-4 py-2 text-xs sm:text-sm font-display font-semibold text-primary-foreground shadow-sm hover:opacity-90"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
      <nav className="flex gap-4 overflow-x-auto border-t border-border px-4 py-2 text-xs font-semibold text-muted-foreground no-scrollbar md:hidden">
        <SectionNav />
      </nav>
    </header>
  )
}

export function PublicFooter() {
  return (
    <footer className="border-t border-border py-10 text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="font-display font-medium text-foreground text-sm tracking-tight">
          Bocado · Micro-comercio universitario
        </p>
        <p>Universidad Icesi · Snacks frescos y casilleros inteligentes.</p>
        <p className="text-xs">Validación de concepto · 2026</p>
      </div>
    </footer>
  )
}

