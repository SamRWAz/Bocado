import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/#como-funciona', label: 'Cómo funciona' },
  { to: '/#puestos', label: 'Puestos' },
  { to: '/catalogo', label: 'Catálogo' },
]

export function PublicHeader() {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="text-xl">🍿</span>
          Bocado
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className="hover:text-foreground">
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Link
              to="/catalogo"
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
    </header>
  )
}

export function PublicFooter() {
  return (
    <footer className="border-t border-border py-10 text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="font-display font-semibold text-foreground">🍿 Bocado</p>
        <p>El mecato de tu campus, en un solo lugar.</p>
        <p className="text-xs">Validación de concepto · 2026</p>
      </div>
    </footer>
  )
}
