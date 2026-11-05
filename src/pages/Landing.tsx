import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import {
  ArrowRight,
  ArrowUpRight,
  Bike,
  ChefHat,
  Clock,
  ShoppingBag,
  Sparkles,
} from 'lucide-react'
import { ThreeHeroCanvas } from '../components/ThreeHeroCanvas'
import { playKeyBeep } from '../lib/sounds'

type RoleKey = 'compradores' | 'vendedores' | 'domiciliarios'

const ROLES_DATA: Record<
  RoleKey,
  {
    step: string
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
    step: '01 / 03 — ELIGE TU ROL',
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
    step: '02 / 03 — ELIGE TU ROL',
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
    step: '03 / 03 — ELIGE TU ROL',
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
        y: 22,
        duration: 0.85,
        stagger: 0.1,
        ease: 'power3.out',
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  const currentRole = ROLES_DATA[activeRole]

  return (
    <div className="relative min-h-screen bg-[#FAF6F5] dark:bg-[#120F0D] text-[#1E0C30] dark:text-[#EAE3D9] overflow-x-hidden selection:bg-[#B8385E] selection:text-white">
      {/* ========================================================= */}
      {/* 1. HERO SECTION: "TU ANTOJO. EN MOVIMIENTO."              */}
      {/* ========================================================= */}
      <section
        ref={heroRef}
        className="relative min-h-[92vh] flex items-center justify-center px-4 sm:px-8 lg:px-14 py-16 border-b border-[#EBE4DC] dark:border-[#26201C] overflow-hidden"
      >
        <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Expressive Brand Typography */}
          <div className="lg:col-span-7 space-y-7 z-10">
            {/* Eyebrow */}
            <div className="hero-stagger inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#B8385E]">
              <span className="h-2 w-2 rounded-full bg-[#B8385E] animate-pulse" />
              <span>LA VIDA PASA ENTRE CLASES</span>
            </div>

            {/* Headline with Outlined Words */}
            <h1 className="hero-stagger font-display text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.98] text-[#1E0C30] dark:text-white">
              Tu antojo.
              <br />
              <span className="text-outline-pink font-light">En</span>
              <br />
              <span className="text-outline-pink font-light">movimiento.</span>
            </h1>

            {/* Description */}
            <p className="hero-stagger text-base sm:text-lg text-[#59483E] dark:text-[#B8ABA0] max-w-xl leading-relaxed font-normal">
              El micro-comercio gastronómico que conecta a todo el campus. Pide, cocina o entrega.{' '}
              <strong className="text-[#1E0C30] dark:text-white font-bold">
                El sabor se mueve contigo.
              </strong>
            </p>

            {/* CTA Buttons */}
            <div className="hero-stagger flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/catalogo"
                onClick={() => playKeyBeep(700)}
                className="rounded-full bg-[#B8385E] px-8 py-4 font-display text-sm font-bold text-white shadow-md hover:bg-[#A32F51] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Explorar snacks</span>
                <ArrowUpRight size={17} />
              </Link>

              <a
                href="#ecosistema"
                onClick={() => playKeyBeep(550)}
                className="inline-flex items-center gap-2 px-6 py-4 text-sm font-display font-bold text-[#1E0C30] dark:text-neutral-200 hover:text-[#B8385E] dark:hover:text-[#E27D7D] transition-colors cursor-pointer"
              >
                <span>Conoce Bocado</span>
                <ArrowRight size={16} />
              </a>
            </div>

            {/* Social Proof Avatars */}
            <div className="hero-stagger flex items-center gap-3 pt-4 border-t border-[#EBE4DC] dark:border-[#26201C]">
              <div className="flex -space-x-2">
                <div className="h-8 w-8 rounded-full bg-[#F5C7A9] flex items-center justify-center text-[10px] font-bold text-[#4A2810] border-2 border-[#FAF6F5] dark:border-[#120F0D]">
                  AM
                </div>
                <div className="h-8 w-8 rounded-full bg-[#D4BBFF] flex items-center justify-center text-[10px] font-bold text-[#2A1054] border-2 border-[#FAF6F5] dark:border-[#120F0D]">
                  JR
                </div>
                <div className="h-8 w-8 rounded-full bg-[#FFE58F] flex items-center justify-center text-[10px] font-bold text-[#594200] border-2 border-[#FAF6F5] dark:border-[#120F0D]">
                  LO
                </div>
                <div className="h-8 w-8 rounded-full bg-[#1E0C30] flex items-center justify-center text-[10px] font-bold text-white border-2 border-[#FAF6F5] dark:border-[#120F0D]">
                  +
                </div>
              </div>
              <div className="text-xs text-[#59483E] dark:text-neutral-400">
                <p className="font-bold text-[#1E0C30] dark:text-white leading-none">Más de 500</p>
                <p className="text-[11px] mt-0.5">personas ya se mueven con Bocado</p>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Chocolate Chip Cookie & Fluid Organic Stage */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Soft Organic Layered Circles Background */}
            <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#E8A5B8]/35 dark:bg-[#701E3C]/20 blur-xl pointer-events-none -top-6 -right-4" />
            <div className="absolute w-60 h-60 sm:w-80 sm:h-80 rounded-full bg-[#B8385E]/20 dark:bg-[#B8385E]/15 blur-lg pointer-events-none -bottom-8 -left-4" />

            {/* The 3D Interactive Cookie in Three.js */}
            <div className="relative w-full aspect-square max-w-[440px] flex items-center justify-center">
              <ThreeHeroCanvas />

              {/* Floating Badge 1: Live experience */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-4 left-2 sm:left-6 rounded-full bg-white/80 dark:bg-[#1E0C30]/80 backdrop-blur-md border border-white/60 dark:border-white/10 px-3.5 py-1.5 shadow-sm text-xs font-mono font-bold text-[#1E0C30] dark:text-white flex items-center gap-2 z-20"
              >
                <span className="h-2 w-2 rounded-full bg-[#B8385E]" />
                <span>Live experience</span>
              </motion.div>

              {/* Floating Badge 2: Entrega en 15 min */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute bottom-6 right-2 sm:right-6 rounded-full bg-white/90 dark:bg-[#1E0C30]/90 backdrop-blur-md border border-white/60 dark:border-white/10 px-4 py-2 shadow-sm text-xs font-mono font-bold text-[#1E0C30] dark:text-white flex items-center gap-2 z-20"
              >
                <Clock size={14} className="text-[#B8385E]" />
                <span>Entrega en 15 min</span>
              </motion.div>

              {/* Floating Label 3: Todo lo bueno está cerca */}
              <div className="absolute -bottom-4 left-4 text-xs font-mono text-[#59483E] dark:text-neutral-400">
                <span className="font-bold text-[#1E0C30] dark:text-white">01</span> Todo lo bueno está cerca.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. SECTION: "UNA RED QUE SE ANTOJA." (INTERACTIVE ROLES)  */}
      {/* ========================================================= */}
      <section
        id="ecosistema"
        className="py-24 px-4 sm:px-8 lg:px-14 border-b border-[#EBE4DC] dark:border-[#26201C] bg-[#F7F2F6] dark:bg-[#16111A]"
      >
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#B8385E]">
                UN SOLO CAMPUS. INFINITAS POSIBILIDADES.
              </span>
              <h2 className="font-display text-4xl sm:text-6xl font-black text-[#1E0C30] dark:text-white">
                Una red que <span className="text-outline-pink font-light">se antoja.</span>
              </h2>
            </div>
            <p className="text-sm sm:text-base text-[#59483E] dark:text-[#B8ABA0] max-w-sm">
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
                        ? 'bg-[#1E0C30] text-white border-[#1E0C30] shadow-md scale-[1.02]'
                        : 'bg-white dark:bg-[#1E1924] text-[#1E0C30] dark:text-neutral-200 border-[#EBE4DC] dark:border-[#2E2434] hover:bg-neutral-50 dark:hover:bg-[#251E2D]'
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
            <div className="lg:col-span-4 flex items-center justify-center py-6">
              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Thin Elliptical Orbital Rings */}
                <div className="absolute inset-0 rounded-full border border-[#1E0C30]/15 dark:border-white/15 scale-110" />
                <div className="absolute inset-4 rounded-full border border-[#B8385E]/20 dark:border-[#B8385E]/30" />
                <div className="absolute inset-8 rounded-full border border-dashed border-[#1E0C30]/20 dark:border-white/20 animate-spin-slow" />

                {/* Central Round Dark Pill */}
                <motion.div
                  key={activeRole}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                  className="w-32 h-32 rounded-full bg-[#1E0C30] text-white shadow-xl flex flex-col items-center justify-center text-center p-3 z-10"
                >
                  <currentRole.icon size={26} className="text-[#E27D7D] mb-1.5" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-300">
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
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <span className="text-xs font-mono font-bold tracking-widest text-[#B8385E] block">
                    {currentRole.step}
                  </span>

                  <h3 className="font-display text-2xl sm:text-3xl font-black text-[#1E0C30] dark:text-white leading-snug">
                    {currentRole.headline}
                  </h3>

                  <p className="text-sm text-[#59483E] dark:text-[#B8ABA0] leading-relaxed">
                    {currentRole.description}
                  </p>

                  <div className="pt-6 border-t border-[#EBE4DC] dark:border-[#2E2434] flex items-baseline gap-3">
                    <span className="font-display text-3xl font-black text-[#1E0C30] dark:text-white">
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
        className="py-24 px-4 sm:px-8 lg:px-14 bg-[#1E0C30] text-white overflow-hidden"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Recipe Eyebrow & Headline */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#E27D7D]">
              LA RECETA ES SIMPLE
            </span>

            <h2 className="font-display text-4xl sm:text-6xl font-black leading-tight text-white">
              Del antojo
              <br />
              a tu <span className="text-outline-coral font-light">puerta.</span>
            </h2>

            <p className="text-sm sm:text-base text-neutral-300 max-w-md leading-relaxed font-normal">
              Sin filas, sin vueltas, sin perderte el descanso. Así funciona el sabor en movimiento.
            </p>
          </div>

          {/* Right: 3 Numbered Steps with Dividers */}
          <div className="lg:col-span-7 flex flex-col divide-y divide-white/15">
            {/* Step 01 */}
            <div className="py-7 flex items-start gap-6 group">
              <span className="font-display text-3xl sm:text-4xl font-black text-[#E27D7D] shrink-0 font-mono">
                01
              </span>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-bold text-white group-hover:text-[#E27D7D] transition-colors">
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
            <div className="py-7 flex items-start gap-6 group">
              <span className="font-display text-3xl sm:text-4xl font-black text-[#E27D7D] shrink-0 font-mono">
                02
              </span>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-bold text-white group-hover:text-[#E27D7D] transition-colors">
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
            <div className="py-7 flex items-start gap-6 group">
              <span className="font-display text-3xl sm:text-4xl font-black text-[#E27D7D] shrink-0 font-mono">
                03
              </span>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-bold text-white group-hover:text-[#E27D7D] transition-colors">
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
      <footer className="bg-[#B8385E] text-white py-20 px-4 sm:px-8 lg:px-14">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-10">
          {/* Left Brand Headline */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-white text-[#B8385E] flex items-center justify-center shadow-xs">
                <Sparkles size={14} />
              </div>
              <span className="font-display font-black text-2xl tracking-tight text-white">
                bocado<span className="text-white/80">.</span>
              </span>
            </div>

            <h3 className="font-display text-4xl sm:text-6xl font-black leading-tight text-white">
              Haz que el campus
              <br />
              <span className="text-outline-white font-light">se mueva.</span>
            </h3>
          </div>

          {/* Right Question & Action Button */}
          <div className="space-y-4 md:text-right">
            <p className="text-sm sm:text-base text-white/90 max-w-sm">
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
