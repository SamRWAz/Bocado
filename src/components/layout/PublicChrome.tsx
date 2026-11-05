import { ShoppingCart } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { canSell, isTendedero, useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { BrandMark } from '../BrandMark'
import { ThemeToggle } from '../ThemeToggle'

function SectionNav() {
  return (
    <NavLink
      to="/catalogo"
      className={({ isActive }) =>
        isActive
          ? 'text-[#B8385E] font-bold text-xs font-mono uppercase tracking-wider'
          : 'text-[#59483E] dark:text-neutral-300 hover:text-[#B8385E] dark:hover:text-white font-semibold transition-colors text-xs font-mono uppercase tracking-wider'
      }
    >
      Snacks
    </NavLink>
  )
}

export function PublicHeader() {
  const { user } = useAuth()
  const { count } = useCart()

  return (
    <header className="sticky top-0 z-40 border-b border-[#EBE4DC] dark:border-[#26201C] bg-[#FAF6F5]/90 dark:bg-[#120F0D]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center">
          <BrandMark size="sm" />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <SectionNav />
        </nav>
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <Link
            to="/carrito"
            className="relative flex items-center gap-1.5 rounded-full bg-white dark:bg-[#1C1816] border border-[#E5DFD7] dark:border-[#2A2420] px-3 py-2 text-xs font-display font-semibold text-foreground hover:bg-neutral-50 transition-colors"
          >
            <ShoppingCart size={15} className="text-[#B8385E]" />
            <span className="hidden sm:inline">Carrito</span>
            {count > 0 && (
              <span className="min-w-5 rounded-full bg-[#B8385E] px-1.5 py-0.2 text-center text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <Link
              to={canSell(user.role) ? '/vender' : isTendedero(user.role) ? '/entregas' : '/pedidos'}
              className="rounded-full bg-[#1E0C30] px-4 py-2 text-xs font-display font-bold text-white shadow-xs hover:bg-[#2F154B] transition-all"
            >
              Ir a la app
            </Link>
          ) : (
            <Link
              to="/registro"
              className="rounded-full bg-[#1E0C30] px-5 py-2 text-xs font-display font-bold text-white shadow-xs hover:bg-[#2F154B] transition-all flex items-center gap-1"
            >
              <span>Únete al movimiento</span>
              <span className="text-[13px]">↗</span>
            </Link>
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
        <p>Universidad Icesi · Snacks frescos y domicilios entre estudiantes (Tendederos en campus).</p>
        <p className="text-xs">Validación de concepto · 2026</p>
      </div>
    </footer>
  )
}

