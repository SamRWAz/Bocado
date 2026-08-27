import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { scrollToSection } from '../../lib/scroll'
import { PublicFooter, PublicHeader } from './PublicChrome'

export function PublicLayout() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (pathname !== '/' || !hash) return
    const id = hash.replace('#', '')
    const timer = window.setTimeout(() => scrollToSection(id), 60)
    return () => window.clearTimeout(timer)
  }, [pathname, hash])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <div className="flex-1">
        <Outlet />
      </div>
      <PublicFooter />
    </div>
  )
}
