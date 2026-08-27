import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export function NotFoundPage() {
  const location = useLocation()

  useEffect(() => {
    console.error('404:', location.pathname)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 font-display text-4xl font-bold">404</h1>
        <p className="mb-4 text-muted-foreground">Esta página no existe</p>
        <Link to="/" className="text-primary underline">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
