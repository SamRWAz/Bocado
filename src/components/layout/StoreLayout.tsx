import { useAuth } from '../../context/AuthContext'
import { AppShell } from './AppShell'
import { PublicLayout } from './PublicLayout'

export function StoreLayout() {
  const { user, loading } = useAuth()

  if (loading) {
    return <p className="py-16 text-center text-sm text-muted-foreground">Cargando sesión...</p>
  }

  return user ? <AppShell /> : <PublicLayout />
}
