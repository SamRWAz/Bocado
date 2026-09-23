import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

const THEME_KEY = 'bocado.theme'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY)
      if (saved === 'light' || saved === 'dark') return saved
      return 'dark'
    } catch {
      return 'dark'
    }
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
    }
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      // Ignore
    }
  }, [theme])

  const toggle = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={theme === 'dark' ? 'Cambiar a Tema Claro' : 'Cambiar a Tema Oscuro'}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-secondary/80 text-foreground transition-all hover:border-primary/50 hover:bg-secondary active:scale-95"
      aria-label="Cambiar tema"
    >
      {theme === 'dark' ? <Sun size={17} className="text-primary" /> : <Moon size={17} className="text-primary" />}
    </button>
  )
}
