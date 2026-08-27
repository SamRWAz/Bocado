import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { BrandMark } from './BrandMark'

export function PageTransition() {
  const { pathname } = useLocation()
  const previous = useRef<string | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (previous.current === null) {
      previous.current = pathname
      return
    }
    if (previous.current === pathname) return
    previous.current = pathname
    setVisible(true)
    const hide = window.setTimeout(() => setVisible(false), 620)
    return () => window.clearTimeout(hide)
  }, [pathname])

  if (!visible) return null

  return (
    <div className="page-transition" role="status" aria-live="polite" aria-label="Cargando">
      <div className="page-transition-mark">
        <BrandMark size={56} className="text-primary" />
      </div>
    </div>
  )
}
