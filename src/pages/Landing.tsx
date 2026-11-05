import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import {
  ArrowRight,
  Bike,
  ChefHat,
  Package,
  Store,
  Users,
} from 'lucide-react'
import { ThreeHeroCanvas } from '../components/ThreeHeroCanvas'
import { playKeyBeep } from '../lib/sounds'

export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const heroTextRef = useRef<HTMLDivElement>(null)

  // GSAP subtle fluid entrance on mount
  useEffect(() => {
    if (!heroTextRef.current) return
    const ctx = gsap.context(() => {
      gsap.from('.gsap-fade-in', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
      })
    }, heroTextRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-[#FAF6F0] dark:bg-[#120F0D] text-[#2C221C] dark:text-[#EAE3D9] overflow-x-hidden selection:bg-[#8F1414] selection:text-white"
    >
      {/* ========================================================= */}
      {/* 1. HERO SECTION: MINIMALIST & THREE.JS ORGANIC CANVAS     */}
      {/* ========================================================= */}
      <section className="relative min-h-[88vh] flex flex-col justify-center px-4 sm:px-8 lg:px-12 pt-16 pb-20 border-b border-[#E5DFD7] dark:border-[#26201C] overflow-hidden">
        {/* Interactive 3D Canvas Background */}
        <ThreeHeroCanvas />

        <div ref={heroTextRef} className="relative z-10 max-w-4xl mx-auto w-full text-center space-y-8">
          {/* Minimalist Pill Badge */}
          <div className="gsap-fade-in inline-flex items-center gap-2 rounded-full border border-[#8F1414]/20 bg-white/70 dark:bg-[#1C1816]/80 px-4 py-1.5 backdrop-blur-md shadow-xs">
            <span className="h-2 w-2 rounded-full bg-[#8F1414]" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#8F1414] dark:text-red-400">
              Campus Universitario Icesi
            </span>
          </div>

          {/* Fluid Headline */}
          <h1 className="gsap-fade-in font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.06] text-[#2C221C] dark:text-[#FAF6F0]">
            Snacks hechos a mano.{' '}
            <span className="text-[#8F1414] dark:text-red-400 inline-block">
              Entregados en tu salón.
            </span>
          </h1>

          {/* Description */}
          <p className="gsap-fade-in text-base sm:text-lg lg:text-xl text-[#59483E] dark:text-[#B3A69C] max-w-2xl mx-auto leading-relaxed font-normal">
            Conectamos a estudiantes que hornean con antojos en todo el campus. Pide brownies, galletas, postres y salados preparados por tus compañeros y recíbelos donde estés.
          </p>

          {/* Action CTAs */}
          <div className="gsap-fade-in flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/catalogo"
              onClick={() => playKeyBeep(700)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#8F1414] px-8 py-4 font-display text-sm font-bold text-white shadow-sm hover:bg-[#751010] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Package size={18} />
              <span>Explorar Catálogo</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/vender"
              onClick={() => playKeyBeep(600)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl border-2 border-[#2C221C]/20 dark:border-white/20 bg-white/60 dark:bg-transparent px-8 py-4 font-display text-sm font-bold text-[#2C221C] dark:text-white hover:bg-white dark:hover:bg-white/10 active:scale-[0.98] transition-all cursor-pointer backdrop-blur-xs"
            >
              <Store size={18} />
              <span>Vender mis Snacks</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. LOS 3 ROLES DEL ECOSISTEMA (CLEAN MINIMALIST)          */}
      {/* ========================================================= */}
      <section className="py-20 px-4 sm:px-8 lg:px-12 border-b border-[#E5DFD7] dark:border-[#26201C] bg-white dark:bg-[#161210]">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-display text-3xl sm:text-4xl font-black text-[#2C221C] dark:text-[#FAF6F0]">
              La comunidad gastronómica del campus
            </h2>
            <p className="text-sm text-[#59483E] dark:text-[#B3A69C]">
              Estudiantes trabajando juntos entre clases para hacer los recesos más fáciles y deliciosos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Rol 1: Comprador */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="rounded-3xl border border-[#E5DFD7] dark:border-[#26201C] bg-[#FAF6F0] dark:bg-[#1C1816] p-8 flex flex-col justify-between shadow-xs"
            >
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8F1414] text-white">
                  <Users size={22} />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-[#2C221C] dark:text-[#FAF6F0]">
                    Comprador
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#59483E] dark:text-[#B3A69C] leading-relaxed">
                  Pide antojos caseros desde tu celular. Seleccionas en qué punto del campus estás y te lo llevan directamente a tu salón o lugar de estudio.
                </p>
              </div>
            </motion.div>

            {/* Rol 2: Vendedor */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="rounded-3xl border border-[#E5DFD7] dark:border-[#26201C] bg-[#FAF6F0] dark:bg-[#1C1816] p-8 flex flex-col justify-between shadow-xs"
            >
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#751010] text-white">
                  <ChefHat size={22} />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-[#2C221C] dark:text-[#FAF6F0]">
                    Vendedor
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#59483E] dark:text-[#B3A69C] leading-relaxed">
                  Publica tus recetas y preparaciones caseras en segundos. Vende a tus compañeros sin tener que pausar tus clases ni descuidar tus materias.
                </p>
              </div>
            </motion.div>

            {/* Rol 3: Domiciliario */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="rounded-3xl border border-[#E5DFD7] dark:border-[#26201C] bg-[#FAF6F0] dark:bg-[#1C1816] p-8 flex flex-col justify-between shadow-xs"
            >
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#590C0C] text-white">
                  <Bike size={22} />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-[#2C221C] dark:text-[#FAF6F0]">
                    Domiciliario
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#59483E] dark:text-[#B3A69C] leading-relaxed">
                  Acepta entregas a pie durante tus huecos y tiempos libres entre clases. Recoge el snack con el cocinero y entrégalo al comprador en minutos.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. FLUJO LOGÍSTICO PASO A PASO                            */}
      {/* ========================================================= */}
      <section className="py-20 px-4 sm:px-8 lg:px-12 border-b border-[#E5DFD7] dark:border-[#26201C] bg-[#FAF6F0] dark:bg-[#120F0D]">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="font-display text-3xl sm:text-4xl font-black text-[#2C221C] dark:text-[#FAF6F0]">
              Simple y en 3 pasos
            </h2>
            <p className="text-xs sm:text-sm text-[#59483E] dark:text-[#B3A69C] max-w-xl mx-auto">
              Todo ocurre dentro del campus con coordinación directa entre estudiantes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-[#E5DFD7] dark:border-[#26201C] bg-white dark:bg-[#1C1816] p-6 space-y-4 shadow-xs">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8F1414] text-white font-mono font-bold text-sm">
                01
              </span>
              <h3 className="font-display text-lg font-bold text-[#2C221C] dark:text-[#FAF6F0]">
                Pides tu snack
              </h3>
              <p className="text-xs text-[#59483E] dark:text-[#B3A69C] leading-relaxed">
                Eliges tu producto del catálogo y marcas el edificio donde te encuentras para recibirlo.
              </p>
            </div>

            <div className="rounded-3xl border border-[#E5DFD7] dark:border-[#26201C] bg-white dark:bg-[#1C1816] p-6 space-y-4 shadow-xs">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#751010] text-white font-mono font-bold text-sm">
                02
              </span>
              <h3 className="font-display text-lg font-bold text-[#2C221C] dark:text-[#FAF6F0]">
                Coordinación ágil
              </h3>
              <p className="text-xs text-[#59483E] dark:text-[#B3A69C] leading-relaxed">
                Un estudiante domiciliario acepta el encargo y recoge el snack con el cocinero en el campus.
              </p>
            </div>

            <div className="rounded-3xl border border-[#E5DFD7] dark:border-[#26201C] bg-white dark:bg-[#1C1816] p-6 space-y-4 shadow-xs">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#590C0C] text-white font-mono font-bold text-sm">
                03
              </span>
              <h3 className="font-display text-lg font-bold text-[#2C221C] dark:text-[#FAF6F0]">
                Entrega en tu salón
              </h3>
              <p className="text-xs text-[#59483E] dark:text-[#B3A69C] leading-relaxed">
                Recibes tu comida caliente o fresca en mano sin tener que desplazarte de tu edificio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. CALL TO ACTION & FOOTER                                */}
      {/* ========================================================= */}
      <footer className="bg-[#1C1816] text-[#FAF6F0] py-16 px-4 sm:px-8 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl border border-white/10 bg-[#26201C] p-8 sm:p-12 text-center space-y-6">
            <h3 className="font-display text-3xl sm:text-4xl font-black text-white">
              ¿Listo para pedir tu primer antojo?
            </h3>
            <p className="text-sm text-neutral-300 max-w-xl mx-auto leading-relaxed">
              Descubre los mejores snacks hechos en casa por tus compañeros de universidad.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/catalogo"
                className="rounded-2xl bg-[#8F1414] px-8 py-3.5 font-display text-sm font-bold text-white hover:bg-[#751010] active:scale-95 transition-all cursor-pointer"
              >
                Ir al Catálogo de Snacks
              </Link>
              <Link
                to="/registro"
                className="rounded-2xl border border-white/20 px-8 py-3.5 font-display text-sm font-bold text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              >
                Crear Cuenta Gratuita
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
