import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Boxes,
  ChefHat,
  ChevronDown,
  Clock,
  MapPin,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  Zap,
} from 'lucide-react'
import { AnimatedBackdrop } from '../components/landing/AnimatedBackdrop'
import { ProcessConsoleDemo } from '../components/landing/ProcessConsoleDemo'
import { LOCKER_HUBS, getLockersByHub } from '../lib/lockers'
import { playKeyBeep } from '../lib/sounds'

const SLIDES = [
  { id: 'hero', label: 'Inicio Video' },
  { id: 'negocio', label: 'Cómo Funciona' },
  { id: 'consola', label: 'Paso a Paso PIN/QR' },
  { id: 'casilleros', label: 'Casilleros D·M·L' },
  { id: 'experiencia', label: 'Experiencia Bocado' },
]

export function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedHubId, setSelectedHubId] = useState('hub_edificio_d')
  const sectionRefs = useRef<(HTMLElement | null)[]>([])

  const scrollToSlide = (index: number) => {
    playKeyBeep(450 + index * 80)
    setCurrentSlide(index)
    sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth' })
  }

  // Active Scroll Observer: dynamically highlight the vertical dots as user scrolls
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (currentSlide < SLIDES.length - 1) scrollToSlide(currentSlide + 1)
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (currentSlide > 0) scrollToSlide(currentSlide - 1)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSlide])

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-white">
      <AnimatedBackdrop />
      <div className="cyber-grid pointer-events-none fixed inset-0 opacity-20" />

      {/* Floating Vertical Slide Indicator (Right Side) */}
      <nav
        aria-label="Navegación de secciones"
        className="fixed right-4 sm:right-8 top-1/2 z-40 -translate-y-1/2 hidden md:flex flex-col items-center gap-3"
      >
        {SLIDES.map((slide, idx) => {
          const isActive = currentSlide === idx
          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => scrollToSlide(idx)}
              className="group relative flex items-center justify-end py-1"
              title={slide.label}
            >
              <span className="mr-3 rounded-md bg-black/85 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-md border border-white/10 shadow-lg">
                {slide.label}
              </span>
              <span
                className={`block rounded-full transition-all duration-300 ${
                  isActive
                    ? 'h-8 w-2.5 bg-primary shadow-[0_0_16px_rgba(249,115,22,1)] ring-2 ring-primary/40'
                    : 'h-2.5 w-2.5 bg-zinc-600 hover:bg-zinc-400'
                }`}
              />
            </button>
          )
        })}
      </nav>

      {/* ========================================================= */}
      {/* SECCIÓN 1: HERO CON VIDEO DE FONDO A PANTALLA COMPLETA    */}
      {/* ========================================================= */}
      <section
        ref={(el) => {
          sectionRefs.current[0] = el
        }}
        className="relative z-10 flex min-h-[96vh] flex-col items-center justify-center overflow-hidden px-4 py-16 sm:px-6"
      >
        {/* Full-width Video Background */}
        <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden">
          <video
            src="/BocadoVideo.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover object-center scale-105 filter brightness-[0.6] contrast-[1.1]"
          />
          {/* Obsidian dark & vibrant glassmorphism gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-black/75 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-radial from-primary/10 via-transparent to-black/80" />
        </div>

        {/* Hero Content Box */}
        <div className="relative mx-auto max-w-4xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-black/60 px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest text-primary backdrop-blur-xl shadow-2xl animate-pulse">
            <Sparkles size={14} className="text-primary" />
            <span>Campus Universitario Icesi · Micro-Comercio Inteligente</span>
          </div>

          <h1 className="font-display text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl text-white leading-[1.08] drop-shadow-2xl">
            Tus snacks favoritos.{' '}
            <span className="bg-gradient-to-r from-primary via-amber-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(249,115,22,0.4)]">
              En casilleros inteligentes.
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-zinc-200 leading-relaxed max-w-2xl mx-auto drop-shadow-md font-medium">
            Aparta brownies, galletas y postres artesanales preparados por estudiantes. Retira sin esperas ni contacto en los casilleros climatizados de los <strong>Edificios D, M y L</strong>.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/catalogo"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-primary via-amber-500 to-primary px-8 py-4 font-display text-sm font-extrabold text-primary-foreground shadow-2xl shadow-primary/40 hover:brightness-110 active:scale-95 transition-all"
            >
              <Boxes size={18} />
              <span>Ver Catálogo de Snacks</span>
            </Link>
            <Link
              to="/vitrina"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-black/60 px-8 py-4 font-display text-sm font-bold text-white hover:bg-black/90 active:scale-95 transition-all backdrop-blur-xl shadow-lg"
            >
              <span>Abrir Vitrina 24/7</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Scroll Cue */}
        <button
          type="button"
          onClick={() => scrollToSlide(1)}
          className="absolute bottom-6 flex flex-col items-center gap-1 text-xs font-mono text-zinc-300 hover:text-primary transition-colors animate-bounce cursor-pointer"
        >
          <span>Conoce cómo funciona</span>
          <ChevronDown size={18} />
        </button>
      </section>

      {/* ========================================================= */}
      {/* SECCIÓN 2: CÓMO FUNCIONA EL NEGOCIO BOCADO                */}
      {/* ========================================================= */}
      <section
        ref={(el) => {
          sectionRefs.current[1] = el
        }}
        className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-20 sm:px-6 border-t border-white/5 bg-background/50 backdrop-blur-sm"
      >
        <div className="mx-auto max-w-6xl w-full text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-primary">
            <Zap size={13} />
            <span>El Ecosistema Bocado</span>
          </div>
          <h2 className="font-display text-3xl font-black sm:text-5xl text-foreground">
            ¿Cómo funciona el negocio?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Conectamos a estudiantes que cocinan con la comunidad universitaria a través de una red física de 60 casilleros inteligentes climatizados en Icesi.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Pillar 1: Compradores */}
          <div className="rounded-3xl border border-border/80 bg-card/70 p-6 sm:p-8 backdrop-blur-xl shadow-xl hover:border-primary/50 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Users size={28} />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">Para Estudiantes Compradores</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Exploras el catálogo en vivo, apartas tu snack favorito y recibes tu <strong>PIN de 4 dígitos</strong>. Puedes chatear directamente con el vendedor para cualquier duda.
              </p>
            </div>
            <div className="mt-6 border-t border-border/60 pt-4 text-xs font-mono text-primary font-semibold flex items-center gap-1.5">
              <Clock size={14} /> Retiro en &lt;10 segundos
            </div>
          </div>

          {/* Pillar 2: Estudiantes Cocineros / Vendedores */}
          <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-card/80 to-card p-6 sm:p-8 backdrop-blur-xl shadow-xl hover:border-amber-400 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400">
                <ChefHat size={28} />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">Para Estudiantes Cocineros</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Cocinas en casa, seleccionas un casillero libre en los Edificios D, M o L desde la app, depositas con tu PIN <code>DEP-XXXX</code> y vendes 24/7 sin perder tiempo de clase.
              </p>
            </div>
            <div className="mt-6 border-t border-amber-500/20 pt-4 text-xs font-mono text-amber-400 font-semibold flex items-center gap-1.5">
              <ShieldCheck size={14} /> Solo 5% de comisión por venta
            </div>
          </div>

          {/* Pillar 3: Red de Casilleros Icesi */}
          <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 via-card/80 to-card p-6 sm:p-8 backdrop-blur-xl shadow-xl hover:border-emerald-400 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                <Store size={28} />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">Infraestructura Icesi</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                60 casilleros climatizados y seguros repartidos en los <strong>Edificios D (20), M (20) y L (20)</strong>. La máquina se desbloquea con PIN y valida el pago virtual al instante.
              </p>
            </div>
            <div className="mt-6 border-t border-emerald-500/20 pt-4 text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
              <MapPin size={14} /> 60 Casilleros en 3 Edificios
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECCIÓN 3: PASO A PASO & MINI CONSOLA INTERACTIVA          */}
      {/* ========================================================= */}
      <section
        ref={(el) => {
          sectionRefs.current[2] = el
        }}
        className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-20 sm:px-6 border-t border-white/5"
      >
        <div className="mx-auto max-w-4xl text-center space-y-3 mb-10">
          <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
            Simulador de Terminal
          </span>
          <h2 className="font-display text-3xl font-black sm:text-5xl text-foreground">
            Paso a Paso: PIN $\rightarrow$ Pago QR $\rightarrow$ Retiro
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            Experimenta en vivo cómo el usuario digita su PIN en la máquina, realiza el pago virtual y la compuerta se abre entregando el producto con comprobante automático.
          </p>
        </div>

        {/* The Animated Mini Console Demo Component */}
        <ProcessConsoleDemo />
      </section>

      {/* ========================================================= */}
      {/* SECCIÓN 4: RED DE CASILLEROS EN EDIFICIOS D, M Y L        */}
      {/* ========================================================= */}
      <section
        ref={(el) => {
          sectionRefs.current[3] = el
        }}
        className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-20 sm:px-6 border-t border-white/5"
      >
        <div className="max-w-3xl text-center mb-10 space-y-3">
          <span className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-bold">
            Red de Casilleros Activos
          </span>
          <h2 className="font-display text-3xl font-extrabold sm:text-5xl text-foreground">
            60 Casilleros en Universidad Icesi
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Distribución estratégica en los principales edificios para que retires o deposites cerca de tus clases.
          </p>
        </div>

        {/* 3 Buildings Display */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl w-full text-left mb-10">
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
                className={`rounded-3xl border p-6 backdrop-blur-xl transition-all ${
                  isSel
                    ? 'border-primary bg-primary/15 shadow-2xl shadow-primary/20 ring-2 ring-primary scale-102'
                    : 'border-white/10 bg-card/60 hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                    <span className="text-xl">{hub.icon}</span>
                    {hub.name}
                  </span>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{hub.zone}</p>
                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3 text-xs font-mono">
                  <span className="text-emerald-400 font-bold">{readyCount} snacks listos</span>
                  <span className="text-zinc-400">{availableCount}/20 libres</span>
                </div>
              </button>
            )
          })}
        </div>

        <Link
          to="/vitrina"
          className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 font-display text-sm font-bold text-primary-foreground shadow-xl shadow-primary/30 hover:brightness-110 active:scale-95 transition-all"
        >
          <Boxes size={18} />
          <span>Ver Vitrina de Casilleros D · M · L</span>
        </Link>
      </section>

      {/* ========================================================= */}
      {/* SECCIÓN 5: FRASE DE MARCA CON MOTIVOS TEXTILES Y VISUALES */}
      {/* ========================================================= */}
      <section
        ref={(el) => {
          sectionRefs.current[4] = el
        }}
        className="relative z-10 flex min-h-[75vh] flex-col items-center justify-center px-4 py-20 text-center sm:px-6 border-t border-white/5 overflow-hidden"
      >
        {/* Textile / Geometric Accent Glowing Frame */}
        <div className="relative mx-auto max-w-4xl w-full rounded-3xl border-2 border-primary/30 bg-gradient-to-b from-primary/15 via-zinc-950/90 to-black p-8 sm:p-14 shadow-2xl backdrop-blur-2xl">
          {/* Top Geometric Artisan Textile Strip */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-amber-400 via-emerald-400 to-cyan-400 opacity-90" />

          {/* Decorative Corner Textile Crosses */}
          <div className="absolute top-4 left-4 text-primary font-mono text-sm opacity-60">❖ ❖ ❖</div>
          <div className="absolute top-4 right-4 text-emerald-400 font-mono text-sm opacity-60">❖ ❖ ❖</div>
          <div className="absolute bottom-4 left-4 text-amber-400 font-mono text-sm opacity-60">❖ ❖ ❖</div>
          <div className="absolute bottom-4 right-4 text-cyan-400 font-mono text-sm opacity-60">❖ ❖ ❖</div>

          <div className="my-6 space-y-6">
            <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
              Cultura Universitaria · Sabor & Innovación
            </span>

            <h3 className="font-display text-3xl font-black sm:text-5xl text-white leading-tight">
              Listo para vivir la experiencia{' '}
              <span className="bg-gradient-to-r from-primary via-amber-400 to-emerald-400 bg-clip-text text-transparent">
                Bocado
              </span>
              .
            </h3>

            <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
              El sabor artesanal hecho por tus compañeros de universidad, con la comodidad de la tecnología que se adapta a tu día entre clases.
            </p>

            {/* Subtle textile geometric weave line */}
            <div className="mx-auto flex items-center justify-center gap-3 pt-4 text-zinc-500 text-xs font-mono">
              <span>━━━</span>
              <span className="text-primary">✦</span>
              <span className="text-amber-400">✦</span>
              <span className="text-emerald-400">✦</span>
              <span>━━━</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
