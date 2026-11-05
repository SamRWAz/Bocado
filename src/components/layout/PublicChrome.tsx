import { Link, NavLink } from 'react-router-dom'
import { canSell, isTendedero, useAuth } from '../../context/AuthContext'
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

  return (
    <header className="sticky top-0 z-40 border-b border-[#EFE8E6] dark:border-[#2D1945] bg-[#FAF6F5]/90 dark:bg-[#130920]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center">
          <BrandMark size="sm" />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <SectionNav />
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <Link
              to={canSell(user.role) ? '/vender' : isTendedero(user.role) ? '/entregas' : '/pedidos'}
              className="rounded-full bg-[#1E0C30] px-5 py-2 text-xs font-display font-bold text-white shadow-xs hover:bg-[#2F154B] transition-all"
            >
              Ir a la app
            </Link>
          ) : (
            <Link
              to="/registro"
              className="rounded-full bg-[#1E0C30] px-5 py-2 text-xs font-display font-bold text-white shadow-xs hover:bg-[#2F154B] transition-all flex items-center gap-1.5"
            >
              <span>Únete al movimiento</span>
              <span className="text-[13px]">↗</span>
            </Link>
          )}
        </div>
      </div>
      <nav className="flex items-center justify-center border-t border-[#EFE8E6] dark:border-[#2D1945] px-4 py-2 text-xs font-semibold md:hidden">
        <SectionNav />
      </nav>
    </header>
  )
}

export function PublicFooter() {
  return (
    <footer className="border-t border-[#EFE8E6] dark:border-[#2D1945] bg-[#FAF6F5] dark:bg-[#130920] py-8 text-xs text-[#59483E]/80 dark:text-[#C5B7C2]/80">
      <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6">
        <p className="font-display font-bold text-[#1E0C30] dark:text-white text-sm">
          bocado<span className="text-[#B8385E]">.</span>
        </p>
        <p>Universidad Icesi · Micro-comercio gastronómico intra-campus · 2026</p>
        <div className="flex items-center gap-4">
          <Link
            to="/presentacion"
            className="font-mono text-[11px] font-bold text-[#B8385E] hover:underline flex items-center gap-1"
          >
            <span>Presentación Nivel 5</span>
            <span>↗</span>
          </Link>
        </div>
      </div>
    </footer>
  )
}

