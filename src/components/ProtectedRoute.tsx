import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { isAdmin, useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <p className="py-16 text-center text-sm text-muted-foreground">Cargando sesión...</p>
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return children
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!isAdmin(user?.role)) {
    return <Navigate to="/pedidos" replace />
  }
  return children
}
