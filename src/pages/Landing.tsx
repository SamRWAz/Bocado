import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Boxes,
  ChefHat,
  ChevronDown,
  Clock,
  MapPin,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
} from 'lucide-react'
import { ProcessConsoleDemo } from '../components/landing/ProcessConsoleDemo'
import { LOCKER_HUBS, getLockersByHub } from '../lib/lockers'
import { playKeyBeep } from '../lib/sounds'

const SLIDES = [
  { id: 'hero', label: 'Inicio' },
  { id: 'metricas', label: 'Cifras Clave' },
  { id: 'negocio', label: 'Cómo Funciona' },
  { id: 'consola', label: 'Paso a Paso' },
  { id: 'casilleros', label: 'Casilleros Icesi' },
]

export function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedHubId, setSelectedHubId] = useState('hub_edificio_d')
  const sectionRefs = useRef<(HTMLElement | null)[]>([])

  const scrollToSlide = (index: number) => {
    playKeyBeep(450 + index * 60)
    setCurrentSlide(index)
    sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth' })
  }

  // Active Scroll Observer
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -40% 0px',
      threshold: 0,
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = sectionRefs.current.findIndex((el) => el === entry.target)
          if (index !== -1) {
            setCurrentSlide(index)
          }
        }
      })
    }, observerOptions)

    sectionRefs.current.forEach((el) => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Floating Vertical Slide Navigation */}
      <nav
        aria-label="Navegación de secciones"
        className="fixed right-4 sm:right-8 top-1/2 z-40 -translate-y-1/2 hidden md:flex flex-col items-center w-8 py-3.5 rounded-full bg-black/80 border border-white/20 shadow-lg backdrop-blur-md"
      >
        <div className="flex flex-col items-center gap-3">
          {SLIDES.map((slide, idx) => {
            const isActive = currentSlide === idx
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => scrollToSlide(idx)}
                className="group relative flex h-7 w-7 items-center justify-center focus:outline-none cursor-pointer"
                title={slide.label}
              >
                <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg bg-black px-2.5 py-1 text-[11px] font-mono font-semibold text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 shadow-md">
                  {slide.label}
                </span>
                <span
                  className={`rounded-full transition-all duration-200 ${
                    isActive
                      ? 'h-3.5 w-3.5 bg-primary ring-4 ring-primary/30 scale-110'
                      : 'h-2 w-2 bg-neutral-400 hover:bg-white hover:scale-125'
                  }`}
                />
              </button>
            )
          })}
        </div>
      </nav>

      {/* ========================================================= */}
      {/* SECCIÓN 1: HERO (BLOQUE ROJO CARMESÍ SÓLIDO / PRETZELS)   */}
      {/* ========================================================= */}
      <section
        ref={(el) => {
          sectionRefs.current[0] = el
        }}
        className="relative z-10 flex min-h-[92vh] flex-col items-center justify-center bg-[#8F1414] text-white px-4 py-16 sm:px-6 border-b border-black/10"
      >
        <div className="relative mx-auto max-w-4xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/30 px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-white">
            <Sparkles size={14} className="text-amber-300" />
            <span>Campus Universitario Icesi · Micro-Comercio Inteligente</span>
          </div>

          <h1 className="font-display text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl text-white leading-[1.08]">
            Tus snacks favoritos.{' '}
            <span className="text-amber-300">
              En casilleros inteligentes.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/90 leading-relaxed max-w-2xl mx-auto font-normal">
            Aparta brownies, galletas y postres artesanales preparados por estudiantes. Retira sin esperas ni contacto en los casilleros de los <strong>Edificios D, M y L</strong>.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/catalogo"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-white px-8 py-4 font-display text-sm font-black text-[#8F1414] shadow-md hover:bg-[#FAF6F0] active:scale-95 transition-all"
            >
              <Boxes size={18} />
              <span>Ver Catálogo de Snacks</span>
            </Link>
            <button
              type="button"
              onClick={() => scrollToSlide(1)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border-2 border-white/40 bg-transparent px-8 py-4 font-display text-sm font-bold text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <span>Cómo Funciona</span>
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

        {/* Scroll Cue */}
        <button
          type="button"
          onClick={() => scrollToSlide(1)}
          className="absolute bottom-6 flex flex-col items-center gap-1 text-xs font-mono text-white/80 hover:text-white transition-colors animate-bounce cursor-pointer"
        >
          <span>Conoce cómo funciona</span>
          <ChevronDown size={18} />
        </button>
      </section>

      {/* ========================================================= */}
      {/* SECCIÓN 2: CIFRAS CLAVE (BANDA CREMA MARFIL DELIMITADA)   */}
      {/* ========================================================= */}
      <section
        ref={(el) => {
          sectionRefs.current[1] = el
        }}
        className="relative z-10 bg-[#FAF6F0] dark:bg-[#1A1614] border-b border-border py-12 px-4 sm:px-6"
      >
        <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 border-r last:border-none border-border/70">
            <p className="font-display text-4xl sm:text-5xl font-black text-[#8F1414] dark:text-red-400">
              60+
            </p>
            <p className="mt-1 text-xs sm:text-sm font-bold text-foreground">Casilleros Activos</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Edificios D, M y L</p>
          </div>

          <div className="p-4 border-r last:border-none border-border/70">
            <p className="font-display text-4xl sm:text-5xl font-black text-[#8F1414] dark:text-red-400">
              5%
            </p>
            <p className="mt-1 text-xs sm:text-sm font-bold text-foreground">Comisión Única</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">El cocinero recibe el 95%</p>
          </div>

          <div className="p-4 border-r last:border-none border-border/70">
            <p className="font-display text-4xl sm:text-5xl font-black text-[#8F1414] dark:text-red-400">
              3
            </p>
            <p className="mt-1 text-xs sm:text-sm font-bold text-foreground">Puntos en Campus</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Universidad Icesi</p>
          </div>

          <div className="p-4">
            <p className="font-display text-4xl sm:text-5xl font-black text-[#8F1414] dark:text-red-400">
              100%
            </p>
            <p className="mt-1 text-xs sm:text-sm font-bold text-foreground">Casero & Fresco</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Hecho por estudiantes</p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECCIÓN 3: CÓMO FUNCIONA (BLOQUE BLANCO PURO DELIMITADO)  */}
      {/* ========================================================= */}
      <section
        ref={(el) => {
          sectionRefs.current[2] = el
        }}
        className="relative z-10 bg-white dark:bg-[#151210] py-20 px-4 sm:px-6 border-b border-border"
      >
        <div className="mx-auto max-w-5xl text-center space-y-3 mb-12">
          <span className="inline-block rounded-full bg-red-100 text-[#8F1414] dark:bg-red-950 dark:text-red-300 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider">
            El Ecosistema Bocado
          </span>
          <h2 className="font-display text-3xl font-black sm:text-4xl text-foreground">
            ¿Cómo funciona el negocio?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Conectamos a estudiantes cocineros con la comunidad universitaria a través de una red física de 60 casilleros inteligentes en Icesi.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Compradores */}
          <div className="rounded-3xl border-2 border-border bg-[#FAF6F0] dark:bg-[#1E1917] p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8F1414] text-white">
                <Users size={24} />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">Para Compradores</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Exploras el catálogo de hoy, apartas tu snack favorito y recibes tu <strong>PIN de 4 dígitos</strong> para retirar sin esperas en el casillero.
              </p>
            </div>
            <div className="mt-6 border-t border-border pt-4 text-xs font-mono text-[#8F1414] dark:text-red-400 font-bold flex items-center gap-1.5">
              <Clock size={14} /> Retiro en menos de 10 segundos
            </div>
          </div>

          {/* Pillar 2: Cocineros */}
          <div className="rounded-3xl border-2 border-border bg-[#FAF6F0] dark:bg-[#1E1917] p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-700 text-white">
                <ChefHat size={24} />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">Para Cocineros</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Cocinas en casa, seleccionas un casillero libre en los Edificios D, M o L desde la app, depositas con tu PIN y vendes sin perder horas de clase.
              </p>
            </div>
            <div className="mt-6 border-t border-border pt-4 text-xs font-mono text-amber-800 dark:text-amber-400 font-bold flex items-center gap-1.5">
              <ShieldCheck size={14} /> Solo 5% de comisión por venta
            </div>
          </div>

          {/* Pillar 3: Infraestructura */}
          <div className="rounded-3xl border-2 border-border bg-[#FAF6F0] dark:bg-[#1E1917] p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-800 text-white">
                <Store size={24} />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">Infraestructura Icesi</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                60 casilleros inteligentes distribuidos en los <strong>Edificios D (20), M (20) y L (20)</strong>. La máquina se desbloquea con tu PIN y valida el pago virtual.
              </p>
            </div>
            <div className="mt-6 border-t border-border pt-4 text-xs font-mono text-emerald-800 dark:text-emerald-400 font-bold flex items-center gap-1.5">
              <MapPin size={14} /> 60 Casilleros en 3 Edificios
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECCIÓN 4: SIMULADOR DE TERMINAL (BLOQUE CREMA MARFIL)    */}
      {/* ========================================================= */}
      <section
        ref={(el) => {
          sectionRefs.current[3] = el
        }}
        className="relative z-10 bg-[#FAF6F0] dark:bg-[#1A1614] py-20 px-4 sm:px-6 border-b border-border"
      >
        <div className="mx-auto max-w-4xl text-center space-y-3 mb-10">
          <span className="inline-block rounded-full bg-red-100 text-[#8F1414] dark:bg-red-950 dark:text-red-300 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider">
            Simulador de Terminal
          </span>
          <h2 className="font-display text-3xl font-black sm:text-4xl text-foreground">
            Paso a Paso: PIN → Pago QR → Retiro
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            Experimenta en vivo cómo el usuario digita su PIN en la máquina, realiza el pago virtual y la compuerta se abre entregando el producto con comprobante automático.
          </p>
        </div>

        {/* The Animated Mini Console Demo Component */}
        <ProcessConsoleDemo />
      </section>

      {/* ========================================================= */}
      {/* SECCIÓN 5: RED DE CASILLEROS (BLOQUE ROJO SÓLIDO / BLANCO) */}
      {/* ========================================================= */}
      <section
        ref={(el) => {
          sectionRefs.current[4] = el
        }}
        className="relative z-10 bg-white dark:bg-[#151210] py-20 px-4 sm:px-6 border-b border-border"
      >
        <div className="max-w-3xl mx-auto text-center mb-10 space-y-3">
          <span className="inline-block rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider">
            Red de Casilleros Activos
          </span>
          <h2 className="font-display text-3xl font-black sm:text-4xl text-foreground">
            60 Casilleros en Universidad Icesi
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Distribución estratégica en los principales edificios para que retires o deposites cerca de tus clases.
          </p>
        </div>

        {/* 3 Buildings Display */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto w-full text-left mb-10">
          {LOCKER_HUBS.map((hub) => {
            const isSel = hub.id === selectedHubId
            const hubLockers = getLockersByHub(hub.id)
            const readyCount = hubLockers.filter((l) => l.status === 'listo_para_retiro').length
            const availableCount = hubLockers.filter((l) => l.status === 'disponible').length

            return (
              <button
                key={hub.id}
                type="button"
                onClick={() => {
                  setSelectedHubId(hub.id)
                  playKeyBeep(550)
                }}
                className={`rounded-3xl border-2 p-6 transition-all text-left cursor-pointer ${
                  isSel
                    ? 'border-[#8F1414] bg-[#FAF6F0] dark:bg-[#251D1A] shadow-md ring-2 ring-[#8F1414]/20'
                    : 'border-border bg-card hover:border-border hover:bg-[#FAF6F0]/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                    <span className="text-xl">{hub.icon}</span>
                    {hub.name}
                  </span>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{hub.zone}</p>
                <div className="mt-6 flex items-center justify-between border-t border-border pt-3 text-xs font-mono">
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">{readyCount} snacks listos</span>
                  <span className="text-muted-foreground">{availableCount}/20 libres</span>
                </div>
              </button>
            )
          })}
        </div>

        <div className="text-center">
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#8F1414] text-white px-8 py-4 font-display text-sm font-bold shadow-md hover:bg-[#781010] active:scale-95 transition-all"
          >
            <Boxes size={18} />
            <span>Explorar Catálogo de Snacks</span>
          </Link>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECCIÓN 6: CIERRE DE MARCA & FOOTER (BLOQUE OSCURO SÓLIDO) */}
      {/* ========================================================= */}
      <footer className="relative z-10 bg-[#1C1917] text-white py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <h3 className="font-display text-3xl font-black sm:text-4xl text-white">
            Listo para vivir la experiencia <span className="text-amber-300">Bocado</span>.
          </h3>
          <p className="text-sm text-neutral-300 max-w-xl mx-auto leading-relaxed">
            El sabor artesanal hecho por tus compañeros de universidad, con la comodidad de los casilleros inteligentes entre clases.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-semibold text-neutral-400">
            <Link to="/catalogo" className="hover:text-white transition-colors">Catálogo de Snacks</Link>
            <Link to="/vender" className="hover:text-white transition-colors">Vender Comida</Link>
            <Link to="/pedidos" className="hover:text-white transition-colors">Mis Apartados</Link>
            <Link to="/vitrina" className="hover:text-white transition-colors">Vitrina Virtual</Link>
          </div>

          <p className="text-[11px] text-neutral-500 font-mono pt-6 border-t border-white/10">
            © 2026 Bocado · Universidad Icesi · Cali, Colombia
          </p>
        </div>
      </footer>
    </div>
  )
}
