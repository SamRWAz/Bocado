export function scrollToSection(id: string) {
  const go = () => {
    const el = document.getElementById(id)
    if (!el) return false
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return true
  }

  if (go()) return
  requestAnimationFrame(() => {
    if (go()) return
    window.setTimeout(go, 120)
  })
}
