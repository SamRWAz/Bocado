import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import {
  ArrowRight,
  ArrowUpRight,
  Bike,
  ChefHat,
  ShoppingBag,
} from 'lucide-react'
import { ThreeHeroCanvas } from '../components/ThreeHeroCanvas'
import { BrandMark } from '../components/BrandMark'
import { playKeyBeep } from '../lib/sounds'

type RoleKey = 'compradores' | 'vendedores' | 'domiciliarios'

const ROLES_DATA: Record<
  RoleKey,
  {
    num: string
    tabLabel: string
    icon: typeof ShoppingBag
    headline: string
    description: string
    metricValue: string
    metricLabel: string
  }
> = {
  compradores: {
    num: '01',
    tabLabel: 'Compradores',
    icon: ShoppingBag,
    headline: 'Lo que quieres, cuando lo quieres.',
    description:
      'Encuentra ese antojo que te salva la tarde y recíbelo donde estés en el campus sin perderte el descanso.',
    metricValue: '2 min',
    metricLabel: 'para pedir',
  },
  vendedores: {
    num: '02',
    tabLabel: 'Vendedores / Cocineros',
    icon: ChefHat,
    headline: 'Tu cocina, tu horario, tu ingreso.',
    description:
      'Publica tus recetas y preparaciones caseras en segundos y vende a toda la comunidad universitaria sin pausar tus clases.',
    metricValue: '100%',
    metricLabel: 'casero y fresco',
  },
  domiciliarios: {
    num: '03',
    tabLabel: 'Domiciliarios',
    icon: Bike,
    headline: 'Gana en tus huecos libres caminando.',
    description:
      'Acepta entregas a pie durante tus huecos libres entre materias, lleva el snack y gana de forma inmediata.',
    metricValue: '0 esperas',
    metricLabel: 'entregas a pie',
  },
}

export function LandingPage() {
  const [activeRole, setActiveRole] = useState<RoleKey>('compradores')
  const heroRef = useRef<HTMLDivElement>(null)

  // Fluid GSAP reveal on mount
  useEffect(() => {
    if (!heroRef.current) return
    const ctx = gsap.context(() => {
      gsap.from('.hero-stagger', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  const currentRole = ROLES_DATA[activeRole]

  return (
    <div className="relative min-h-screen bg-[#FAF6F5] dark:bg-[#130920] text-[#1E0C30] dark:text-[#F6EEF2] overflow-x-hidden selection:bg-[#B8385E] selection:text-white transition-colors duration-200">
      {/* ========================================================= */}
      {/* 1. HERO SECTION: "TU ANTOJO. EN MOVIMIENTO."              */}
      {/* ========================================================= */}
      <section
        ref={heroRef}
        className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center px-4 sm:px-8 lg:px-14 py-12 sm:py-16 border-b border-[#EFE8E6] dark:border-[#2D1945] overflow-hidden"
      >
        <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Left Column: Expressive Brand Typography */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 z-10 text-center lg:text-left">
            {/* Headline with Outlined Words */}
            <h1 className="hero-stagger font-display text-4xl sm:text-6xl lg:text-8xl font-black tracking-tight leading-[1.02] text-[#1E0C30] dark:text-white">
              Tu antojo.
              <br />
              <span className="text-outline-pink font-light">En</span>
              <br />
              <span className="text-outline-pink font-light">movimiento.</span>
            </h1>

            {/* Description */}
            <p className="hero-stagger text-sm sm:text-base lg:text-lg text-[#59483E] dark:text-[#C5B7C2] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              El micro-comercio gastronómico que conecta a todo el campus. Pide, cocina o entrega.{' '}
              <strong className="text-[#1E0C30] dark:text-white font-bold">
                El sabor se mueve contigo.
              </strong>
            </p>

            {/* CTA Buttons */}
            <div className="hero-stagger flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/catalogo"
                onClick={() => playKeyBeep(700)}
                className="w-full sm:w-auto justify-center rounded-full bg-[#B8385E] px-8 py-4 font-display text-sm font-bold text-white shadow-md hover:bg-[#A32F51] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Explorar snacks</span>
                <ArrowUpRight size={17} />
              </Link>

              <a
                href="#ecosistema"
                onClick={() => playKeyBeep(550)}
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-display font-bold text-[#1E0C30] dark:text-[#E8DCED] hover:text-[#B8385E] dark:hover:text-[#D94668] transition-colors cursor-pointer"
              >
                <span>Conoce Bocado</span>
                <ArrowRight size={16} />
              </a>
            </div>
          </div>

          {/* Right Column: 3D Chocolate Chip Cookie with Fluid Organic Backdrop */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Soft Organic Layered Backdrop */}
            <div className="absolute w-64 h-64 sm:w-88 sm:h-88 rounded-full bg-[#E8A5B8]/30 dark:bg-[#B8385E]/20 blur-xl pointer-events-none -top-4 -right-4" />
            <div className="absolute w-56 h-56 sm:w-76 sm:h-76 rounded-full bg-[#B8385E]/15 dark:bg-[#1E0C30]/50 blur-lg pointer-events-none -bottom-6 -left-4" />

            {/* The 3D Interactive Cookie in Three.js */}
            <div className="relative w-full aspect-square max-w-[420px] flex items-center justify-center">
              <ThreeHeroCanvas />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. SECTION: "UNA RED QUE SE ANTOJA." (INTERACTIVE ROLES)  */}
      {/* ========================================================= */}
      <section
        id="ecosistema"
        className="py-16 sm:py-24 px-4 sm:px-8 lg:px-14 border-b border-[#EFE8E6] dark:border-[#2D1945] bg-[#F7F2F6] dark:bg-[#180C28]"
      >
        <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#B8385E]">
                UN SOLO CAMPUS. INFINITAS POSIBILIDADES.
              </span>
              <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-[#1E0C30] dark:text-white">
                Una red que <span className="text-outline-pink font-light">se antoja.</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm md:text-base text-[#59483E] dark:text-[#C5B7C2] max-w-sm">
              Bocado une a quienes tienen hambre, talento y ganas de moverse.
            </p>
          </div>

          {/* Interactive Role Switcher Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: 3 Role Tabs */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              {(['compradores', 'vendedores', 'domiciliarios'] as RoleKey[]).map((roleKey) => {
                const data = ROLES_DATA[roleKey]
                const isSelected = activeRole === roleKey
                const Icon = data.icon

                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => {
                      playKeyBeep(520)
                      setActiveRole(roleKey)
                    }}
                    className={`w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl font-display text-sm font-bold transition-all cursor-pointer text-left border ${
                      isSelected
                        ? 'bg-[#1E0C30] text-white border-[#1E0C30] dark:border-[#3A1856] shadow-md scale-[1.01]'
                        : 'bg-white dark:bg-[#1D102E] text-[#1E0C30] dark:text-[#E8DCED] border-[#EFE8E6] dark:border-[#2D1945] hover:bg-neutral-50 dark:hover:bg-[#25153A]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-semibold opacity-70">
                        {data.num}
                      </span>
                      <Icon
                        size={18}
                        className={isSelected ? 'text-[#E27D7D]' : 'text-[#B8385E]'}
                      />
                      <span>{data.tabLabel}</span>
                    </div>
                    <ArrowUpRight
                      size={16}
                      className={isSelected ? 'text-white' : 'text-[#59483E] opacity-50'}
                    />
                  </button>
                )
              })}
            </div>

            {/* Center Column: Fluid Orbital Visual with Central Badge */}
            <div className="lg:col-span-4 flex items-center justify-center py-4 sm:py-6">
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
                {/* Thin Elliptical Orbital Rings */}
                <div className="absolute inset-0 rounded-full border border-[#1E0C30]/15 dark:border-white/15 scale-110" />
                <div className="absolute inset-4 rounded-full border border-[#B8385E]/20 dark:border-[#B8385E]/30" />
                <div className="absolute inset-8 rounded-full border border-dashed border-[#1E0C30]/20 dark:border-white/20" />

                {/* Central Round Dark Pill */}
                <motion.div
                  key={activeRole}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#1E0C30] text-white shadow-xl flex flex-col items-center justify-center text-center p-3 z-10"
                >
                  <currentRole.icon size={24} className="text-[#E27D7D] mb-1.5" />
                  <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-neutral-300">
                    Tu rol
                  </span>
                  <span className="text-xs font-bold leading-tight">en Bocado</span>
                </motion.div>
              </div>
            </div>

            {/* Right Column: Dynamic Role Explanation */}
            <div className="lg:col-span-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeRole}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 sm:space-y-6"
                >
                  <h3 className="font-display text-2xl sm:text-3xl font-black text-[#1E0C30] dark:text-white leading-snug">
                    {currentRole.headline}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#59483E] dark:text-[#C5B7C2] leading-relaxed">
                    {currentRole.description}
                  </p>

                  <div className="pt-4 sm:pt-6 border-t border-[#EFE8E6] dark:border-[#2D1945] flex items-baseline gap-3">
                    <span className="font-display text-2xl sm:text-3xl font-black text-[#1E0C30] dark:text-white">
                      {currentRole.metricValue}
                    </span>
                    <span className="text-xs font-mono text-[#59483E] dark:text-neutral-400">
                      {currentRole.metricLabel}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. SECTION: "DEL ANTOJO A TU PUERTA." (DARK PURPLE RECIPE)*/}
      {/* ========================================================= */}
      <section
        id="como-funciona"
        className="py-16 sm:py-24 px-4 sm:px-8 lg:px-14 bg-[#1E0C30] text-white overflow-hidden"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: Recipe Eyebrow & Headline */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6 text-center lg:text-left">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#E27D7D]">
              LA RECETA ES SIMPLE
            </span>

            <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black leading-tight text-white">
              Del antojo
              <br />
              a tu <span className="text-outline-coral font-light">puerta.</span>
            </h2>

            <p className="text-xs sm:text-sm lg:text-base text-neutral-300 max-w-md mx-auto lg:mx-0 leading-relaxed font-normal">
              Sin filas, sin vueltas, sin perderte el descanso. Así funciona el sabor en movimiento.
            </p>
          </div>

          {/* Right: 3 Numbered Steps with Dividers */}
          <div className="lg:col-span-7 flex flex-col divide-y divide-white/15">
            {/* Step 01 */}
            <div className="py-5 sm:py-7 flex items-start gap-4 sm:gap-6 group">
              <span className="font-display text-2xl sm:text-4xl font-black text-[#E27D7D] shrink-0 font-mono">
                01
              </span>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg sm:text-xl font-bold text-white group-hover:text-[#E27D7D] transition-colors">
                    Explora
                  </h3>
                  <ArrowUpRight size={18} className="text-white/60 group-hover:text-white transition-colors" />
                </div>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  Encuentra tu próximo favorito entre recetas hechas cerca de ti.
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div className="py-5 sm:py-7 flex items-start gap-4 sm:gap-6 group">
              <span className="font-display text-2xl sm:text-4xl font-black text-[#E27D7D] shrink-0 font-mono">
                02
              </span>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg sm:text-xl font-bold text-white group-hover:text-[#E27D7D] transition-colors">
                    Pide
                  </h3>
                  <ArrowUpRight size={18} className="text-white/60 group-hover:text-white transition-colors" />
                </div>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  Un par de taps y tu antojo empieza su camino.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div className="py-5 sm:py-7 flex items-start gap-4 sm:gap-6 group">
              <span className="font-display text-2xl sm:text-4xl font-black text-[#E27D7D] shrink-0 font-mono">
                03
              </span>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg sm:text-xl font-bold text-white group-hover:text-[#E27D7D] transition-colors">
                    Disfruta
                  </h3>
                  <ArrowUpRight size={18} className="text-white/60 group-hover:text-white transition-colors" />
                </div>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  Recíbelo donde estés. El campus nunca estuvo tan rico.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. CALL TO ACTION BANNER: "HAZ QUE EL CAMPUS SE MUEVA."   */}
      {/* ========================================================= */}
      <footer className="bg-[#B8385E] text-white py-16 sm:py-20 px-4 sm:px-8 lg:px-14">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8 sm:gap-10">
          {/* Left Brand Headline */}
          <div className="space-y-4">
            <BrandMark size="md" />

            <h3 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black leading-tight text-white">
              Haz que el campus
              <br />
              <span className="text-outline-white font-light">se mueva.</span>
            </h3>
          </div>

          {/* Right Question & Action Button */}
          <div className="space-y-4 md:text-right">
            <p className="text-xs sm:text-sm md:text-base text-white/90 max-w-sm">
              ¿Tienes una receta, una bici o simplemente hambre?
            </p>
            <div>
              <Link
                to="/registro"
                onClick={() => playKeyBeep(700)}
                className="inline-flex items-center gap-2 rounded-full bg-[#1E0C30] px-8 py-4 font-display text-sm font-bold text-white shadow-xl hover:bg-[#2E124A] active:scale-95 transition-all cursor-pointer"
              >
                <span>Entrar a Bocado</span>
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
