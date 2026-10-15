import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bike,
  ChefHat,
  ChevronDown,
  Clock,
  DollarSign,
  Package,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { playKeyBeep } from '../lib/sounds'

const SLIDES = [
  { id: 'hero', label: 'Inicio' },
  { id: 'metricas', label: 'Cifras Clave' },
  { id: 'negocio', label: 'Cómo Funciona' },
  { id: 'consola', label: 'Paso a Paso' },
  { id: 'tendederos', label: 'Tendederos Campus' },
]

export function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
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
      {/* SECCIÓN 1: HERO                                           */}
      {/* ========================================================= */}
      <section
        ref={(el) => {
          sectionRefs.current[0] = el
        }}
        className="relative z-10 flex min-h-[92vh] flex-col items-center justify-center bg-[#8F1414] text-white px-4 py-16 sm:px-6 border-b border-black/10"
      >
        <div className="relative mx-auto max-w-4xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/30 px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-white">
            <Sparkles size={14} className="text-red-200" />
            <span>Campus Universitario Icesi · Domicilios Universitarios</span>
          </div>

          <h1 className="font-display text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl text-white leading-[1.08]">
            Tus snacks favoritos.{' '}
            <span className="text-red-100">
              Entregados en tu edificio.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/90 leading-relaxed max-w-2xl mx-auto font-normal">
            Pide brownies, galletas, empanadas y postres preparados por estudiantes. Un <strong>Tendedero</strong> (mensajero del campus) recoge tu comida con el cocinero y te la entrega donde estés por solo <strong>$200 COP</strong> de domicilio.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/catalogo"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-white px-8 py-4 font-display text-sm font-black text-[#8F1414] shadow-md hover:bg-[#FAF6F0] active:scale-95 transition-all"
            >
              <Package size={18} />
              <span>Ver Catálogo de Snacks</span>
            </Link>
            <Link
              to="/entregas"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border-2 border-white/40 bg-transparent px-8 py-4 font-display text-sm font-bold text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <Bike size={18} />
              <span>Ser Tendedero (Repartir)</span>
            </Link>
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
              $200
            </p>
            <p className="mt-1 text-xs sm:text-sm font-bold text-foreground">Tarifa Tendedero</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Envío directo en campus</p>
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
      {/* SECCIÓN 3: CÓMO FUNCIONA                                  */}
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
            ¿Cómo funciona el servicio?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Conectamos a estudiantes que cocinan con estudiantes que tienen antojos, a través de una red ágil de <strong>Tendederos</strong> (mensajeros en campus) que entregan directo en tus clases por solo <strong>$200 COP</strong>.
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
              <h3 className="font-display text-xl font-bold text-foreground">1. Compradores</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Pides tu snack, seleccionas en qué edificio o salón de la U estás y recibes tu comprobante. El precio incluye solo <strong>$200 COP</strong> de tarifa de entrega.
              </p>
            </div>
            <div className="mt-6 border-t border-border pt-4 text-xs font-mono text-[#8F1414] dark:text-red-400 font-bold flex items-center gap-1.5">
              <Clock size={14} /> Recibe en tu salón sin desplazarte
            </div>
          </div>

          {/* Pillar 2: Cocineros */}
          <div className="rounded-3xl border-2 border-border bg-[#FAF6F0] dark:bg-[#1E1917] p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#751010] text-white">
                <ChefHat size={24} />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">2. Cocineros</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Publicas tus preparaciones fijando tu precio. Se le suman $200 de logística y no tienes que salir de clase para hacer las entregas: los tendederos lo hacen por ti.
              </p>
            </div>
            <div className="mt-6 border-t border-border pt-4 text-xs font-mono text-[#8F1414] dark:text-red-400 font-bold flex items-center gap-1.5">
              <ShieldCheck size={14} /> Vende sin interrumpir tu horario
            </div>
          </div>

          {/* Pillar 3: Tendederos */}
          <div className="rounded-3xl border-2 border-border bg-[#FAF6F0] dark:bg-[#1E1917] p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5C0C0C] text-white">
                <Bike size={24} />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">3. Tendederos</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Estudiantes que aceptan solicitudes en sus huecos libres. Recogen el snack del vendedor, se lo llevan al comprador y ganan <strong>$200 COP</strong> por cada entrega rápida.
              </p>
            </div>
            <div className="mt-6 border-t border-border pt-4 text-xs font-mono text-[#8F1414] dark:text-red-400 font-bold flex items-center gap-1.5">
              <DollarSign size={14} /> Ganancias inmediatas en campus
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECCIÓN 4: FLUJO DE ENTREGAS Y CONFIRMACIÓN TRIPLE        */}
      {/* ========================================================= */}
      <section
        ref={(el) => {
          sectionRefs.current[3] = el
        }}
        className="relative z-10 bg-[#FAF6F0] dark:bg-[#1A1614] py-20 px-4 sm:px-6 border-b border-border"
      >
        <div className="mx-auto max-w-4xl text-center space-y-3 mb-12">
          <span className="inline-block rounded-full bg-red-100 text-[#8F1414] dark:bg-red-950 dark:text-red-300 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider">
            Logística Ágil en Campus
          </span>
          <h2 className="font-display text-3xl font-black sm:text-4xl text-foreground">
            Flujo de Entrega con Triple Confirmación
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            Total seguridad y transparencia gracias a la validación de cada parte involucrada.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-mono font-bold">
              1
            </span>
            <h4 className="font-display font-bold text-foreground">Pides tu snack</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Eliges tu preparación, indicas tu edificio y ves el recibo con los +$200 de envío. Se crea la solicitud pública en el campus.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-mono font-bold">
              2
            </span>
            <h4 className="font-display font-bold text-foreground">Tendedero toma el pedido</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Un mensajero acepta el encargo y se habilitan los <strong>chats directos</strong> con comprador y vendedor para coordinar el punto exacto.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-mono font-bold">
              3
            </span>
            <h4 className="font-display font-bold text-foreground">Triple Confirmación</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              El tendedero confirma que entregó, el cliente confirma que recibió y el vendedor confirma que recibió el dinero.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECCIÓN 5: COBERTURA EN CAMPUS ICESI                       */}
      {/* ========================================================= */}
      <section
        ref={(el) => {
          sectionRefs.current[4] = el
        }}
        className="relative z-10 bg-white dark:bg-[#151210] py-20 px-4 sm:px-6 border-b border-border"
      >
        <div className="max-w-3xl mx-auto text-center mb-10 space-y-3">
          <span className="inline-block rounded-full bg-red-100 text-[#8F1414] dark:bg-red-950 dark:text-red-300 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider">
            Cobertura en Campus Icesi
          </span>
          <h2 className="font-display text-3xl font-black sm:text-4xl text-foreground">
            Envíos en menos de 5 minutos
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Llegamos a cualquier edificio dentro de la universidad con entregas a pie rápidas entre clases.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto w-full text-left mb-10">
          <div className="rounded-3xl border-2 border-border bg-card p-6 space-y-2">
            <span className="text-2xl">🏛️</span>
            <h3 className="font-display text-lg font-bold">Edificio D · Plazoleta Central</h3>
            <p className="text-xs text-muted-foreground">Punto de encuentro gastronómico principal de Icesi.</p>
            <span className="inline-block font-mono text-xs font-bold text-primary mt-2">Tarifa envío: $200 COP</span>
          </div>

          <div className="rounded-3xl border-2 border-border bg-card p-6 space-y-2">
            <span className="text-2xl">⚡</span>
            <h3 className="font-display text-lg font-bold">Edificio E · Ingeniería & Aulas</h3>
            <p className="text-xs text-muted-foreground">Entregas directas en pisos de laboratorios y salas de estudio.</p>
            <span className="inline-block font-mono text-xs font-bold text-primary mt-2">Tarifa envío: $200 COP</span>
          </div>

          <div className="rounded-3xl border-2 border-border bg-card p-6 space-y-2">
            <span className="text-2xl">🌿</span>
            <h3 className="font-display text-lg font-bold">El Samán & Biblioteca</h3>
            <p className="text-xs text-muted-foreground">Zonas de descanso y estudio con cobertura completa de Tendederos.</p>
            <span className="inline-block font-mono text-xs font-bold text-primary mt-2">Tarifa envío: $200 COP</span>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/entregas"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#8F1414] text-white px-8 py-4 font-display text-sm font-bold shadow-md hover:bg-[#781010] active:scale-95 transition-all"
          >
            <Bike size={18} />
            <span>Ver Solicitudes de Tendedero Activas</span>
          </Link>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECCIÓN 6: CIERRE DE MARCA & FOOTER                       */}
      {/* ========================================================= */}
      <footer className="relative z-10 bg-[#1C1917] text-white py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <h3 className="font-display text-3xl font-black sm:text-4xl text-white">
            Listo para vivir la experiencia <span className="text-red-400">Bocado</span>.
          </h3>
          <p className="text-sm text-neutral-300 max-w-xl mx-auto leading-relaxed">
            Comida casera hecha por estudiantes, con domicilios internos por Tendederos universitarios en Icesi.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-semibold text-neutral-400">
            <Link to="/catalogo" className="hover:text-white transition-colors">Catálogo de Snacks</Link>
            <Link to="/entregas" className="hover:text-white transition-colors">Panel Tendedero</Link>
            <Link to="/vender" className="hover:text-white transition-colors">Vender Comida</Link>
            <Link to="/pedidos" className="hover:text-white transition-colors">Mis Pedidos</Link>
          </div>

          <p className="text-[11px] text-neutral-500 font-mono pt-6 border-t border-white/10">
            © 2026 Bocado · Universidad Icesi · Cali, Colombia
          </p>
        </div>
      </footer>
    </div>
  )
}
