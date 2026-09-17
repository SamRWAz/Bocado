import { type MouseEvent } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { canSell, useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { scrollToSection } from '../../lib/scroll'
import { BrandMark } from '../BrandMark'
import { ThemeToggle } from '../ThemeToggle'

const sectionLinks = [
  { id: 'snacks', label: 'Snacks en Campus' },
]

function SectionNav({ onGoToSection }: { onGoToSection: (event: MouseEvent<HTMLAnchorElement>, id: string) => void }) {
  return (
    <>
      <NavLink
        to="/catalogo"
        className={({ isActive }) => (isActive ? 'text-primary font-bold' : 'hover:text-foreground font-medium transition-colors')}
      >
        Catálogo en Vivo
      </NavLink>
      <NavLink
        to="/vitrina"
        className={({ isActive }) => (isActive ? 'text-primary font-bold' : 'hover:text-foreground font-medium transition-colors')}
      >
        Vitrina 24/7
      </NavLink>
      {sectionLinks.map((link) => (
        <a
          key={link.id}
          href={`/#${link.id}`}
          onClick={(event) => onGoToSection(event, link.id)}
          className="hover:text-foreground font-medium transition-colors"
        >
          {link.label}
        </a>
      ))}
    </>
  )
}

export function PublicHeader() {
  const { user } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  const goToSection = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault()
    if (location.pathname === '/') {
      scrollToSection(id)
      window.history.replaceState(null, '', `/#${id}`)
      return
    }
    navigate({ pathname: '/', hash: `#${id}` })
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-brand text-xl font-bold text-foreground">
          <BrandMark size={32} className="text-primary" />
          Bocado
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <SectionNav onGoToSection={goToSection} />
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/carrito"
            className="relative rounded-lg px-3 py-2 text-sm font-display font-medium text-muted-foreground hover:text-foreground"
          >
            Carrito
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 min-w-5 rounded-full bg-primary px-1 text-center text-[10px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <Link
              to={canSell(user.role) ? '/vender' : '/pedidos'}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-display font-semibold text-primary-foreground"
            >
              Ir a la app
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-display font-medium text-muted-foreground hover:text-foreground"
              >
                Entrar
              </Link>
              <Link
                to="/registro"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-display font-semibold text-primary-foreground"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
      <nav className="flex gap-4 overflow-x-auto border-t border-border px-4 py-2 text-sm text-muted-foreground no-scrollbar md:hidden">
        <SectionNav onGoToSection={goToSection} />
      </nav>
    </header>
  )
}

export function PublicFooter() {
  return (
    <footer className="border-t border-border py-10 text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="flex items-center gap-2 font-brand font-semibold text-foreground text-base">
          <BrandMark size={22} className="text-primary" />
          Bocado · Micro-comercio universitario
        </p>
        <p>Universidad Icesi · Entregas y snacks entre clases.</p>
        <p className="text-xs">Validación de concepto · 2026</p>
      </div>
    </footer>
  )
}
