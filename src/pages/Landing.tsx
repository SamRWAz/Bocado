import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Boxes,
  ChevronDown,
  KeyRound,
  Lock,
  LockOpen,
  MapPin,
  Sparkles,
} from 'lucide-react'
import { AnimatedBackdrop } from '../components/landing/AnimatedBackdrop'
import { KamuiCardShowcase } from '../components/landing/KamuiCardShowcase'
import { LOCKER_HUBS, getLockersByHub } from '../lib/lockers'
import { playKeyBeep, playLockerUnlock } from '../lib/sounds'

const SLIDES = [
  { id: 'hero', label: 'Inicio' },
  { id: 'showcase', label: 'Snacks 3D' },
  { id: 'flow', label: 'Flujo' },
  { id: 'campus', label: 'Vitrinas' },
]

export function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [demoLockerOpen, setDemoLockerOpen] = useState(false)
  const [selectedHubId, setSelectedHubId] = useState('hub_edificio_d')
  const [heroLockerUnlocked, setHeroLockerUnlocked] = useState(false)
  const sectionRefs = useRef<(HTMLElement | null)[]>([])

  const scrollToSlide = (index: number) => {
    playKeyBeep(450 + index * 80)
    setCurrentSlide(index)
    sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth' })
  }

  // Handle keyboard arrow navigation
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

  const handleHeroLockerToggle = () => {
    if (!heroLockerUnlocked) {
      playLockerUnlock()
      setHeroLockerUnlocked(true)
    } else {
      playKeyBeep(400)
      setHeroLockerUnlocked(false)
    }
  }

  const handleDemoUnlock = () => {
    playKeyBeep(700)
    setTimeout(() => {
      playLockerUnlock()
      setDemoLockerOpen(true)
    }, 250)
  }

  const handleDemoClose = () => {
    playKeyBeep(400)
    setDemoLockerOpen(false)
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-white">
      <AnimatedBackdrop />
      <div className="cyber-grid pointer-events-none fixed inset-0 opacity-20" />

      {/* Floating Vertical Slide Indicator (Right Side) */}
      <nav className="fixed right-4 sm:right-8 top-1/2 z-40 -translate-y-1/2 hidden md:flex flex-col items-center gap-3">
        {SLIDES.map((slide, idx) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => scrollToSlide(idx)}
            className="group relative flex items-center justify-end py-1"
            title={slide.label}
          >
            <span className="mr-3 rounded-md bg-black/80 px-2 py-0.5 text-[10px] font-mono text-white opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-sm border border-white/10">
              {slide.label}
            </span>
            <span
              className={`block rounded-full transition-all duration-300 ${
                currentSlide === idx
                  ? 'h-8 w-2 bg-primary shadow-[0_0_12px_rgba(249,115,22,0.9)]'
                  : 'h-2 w-2 bg-zinc-600 hover:bg-zinc-400'
              }`}
            />
          </button>
        ))}
      </nav>

      {/* ========================================================= */}
      {/* SLIDE 1: HERO CINEMÁTICO CON ILUSTRACIÓN ANIMADA          */}
      {/* ========================================================= */}
      <section
        ref={(el) => {
          sectionRefs.current[0] = el
        }}
        className="relative z-10 flex min-h-[92vh] flex-col items-center justify-center px-4 py-8 sm:px-6"
      >
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-6 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-widest text-primary backdrop-blur-md animate-pulse">
              <Sparkles size={14} className="text-primary" />
              <span>Vitrina Inteligente Campus Icesi</span>
            </div>

            <h1 className="font-display text-4xl font-black tracking-tight sm:text-6xl text-foreground leading-[1.1]">
              Tus snacks favoritos.{' '}
              <span className="bg-gradient-to-r from-primary via-amber-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(249,115,22,0.25)]">
                En casilleros 24/7.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0">
              Paga digital, recibe tu PIN de 4 dígitos y retira al instante sin esperas ni encuentros personales en el Edificio D, Samán o Biblioteca.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/vitrina"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 font-display text-sm font-bold text-primary-foreground shadow-2xl shadow-primary/30 hover:brightness-110 active:scale-95 transition-all"
              >
                <Boxes size={18} />
                <span>Abrir Vitrina de Casilleros</span>
              </Link>
              <Link
                to="/catalogo"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-secondary/80 px-8 py-4 font-display text-sm font-semibold text-foreground hover:bg-secondary active:scale-95 transition-all backdrop-blur-md"
              >
                <span>Ver Snacks Disponibles</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Right Column: Stylized Animated Anime Locker Artwork */}
          <div className="lg:col-span-6 flex justify-center">
            <div
              onClick={handleHeroLockerToggle}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border-2 border-primary/40 bg-zinc-950/80 p-2 shadow-[0_0_40px_rgba(249,115,22,0.25)] backdrop-blur-2xl transition-all duration-500 hover:scale-[1.02] hover:border-emerald-400"
            >
              {/* Anime Artwork Image */}
              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src="/images/hero_anime_locker.jpg"
                  alt="Estudiante sacando snack del casillero inteligente Bocado"
                  className="h-64 sm:h-80 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Floating UI Badges on Image */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/80 px-3 py-1 text-[11px] font-mono font-bold text-emerald-400 backdrop-blur-md border border-white/10">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>SLOT #042 DESBLOQUEADO</span>
                </div>

                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[11px] font-display font-bold text-primary-foreground shadow-lg animate-bounce">
                  {heroLockerUnlocked ? <LockOpen size={13} /> : <KeyRound size={13} />}
                  <span>{heroLockerUnlocked ? '¡Compuerta Abierta!' : 'Toca para simular retiro'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Down Cue */}
        <button
          type="button"
          onClick={() => scrollToSlide(1)}
          className="mt-8 flex flex-col items-center gap-1 text-xs font-mono text-muted-foreground hover:text-primary transition-colors animate-bounce"
        >
          <span>Desliza para ver los snacks en 3D</span>
          <ChevronDown size={18} />
        </button>
      </section>

      {/* ========================================================= */}
      {/* SLIDE 2: 3D KAMUI CARD SHOWCASE (Snacks con Giro 3D)     */}
      {/* ========================================================= */}
      <section
        ref={(el) => {
          sectionRefs.current[1] = el
        }}
        className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center sm:px-6 border-t border-white/5"
      >
        <div className="max-w-2xl mb-4">
          <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
            Showcase Interactivo 3D
          </span>
          <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-5xl text-foreground">
            Snacks frescos en casillero
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            Toca o pasa el cursor sobre la compuerta para verla abrirse en 3D y apartar tu snack.
          </p>
        </div>

        {/* The Kamui 3D Interactive Flip Showcase */}
        <KamuiCardShowcase />
      </section>

      {/* ========================================================= */}
      {/* SLIDE 3: FLUJO VISUAL EN 3 PASOS                          */}
      {/* ========================================================= */}
      <section
        ref={(el) => {
          sectionRefs.current[2] = el
        }}
        className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 border-t border-white/5"
      >
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Interactive 3D Demo Vault Door */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative rounded-3xl border border-primary/30 bg-card/60 p-8 backdrop-blur-2xl shadow-2xl max-w-sm w-full">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-6 font-mono text-xs">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  SIMULADOR DE CASILLERO
                </span>
                <span className="text-zinc-400">SLOT #101</span>
              </div>

              {/* 3D Locker Component */}
              <div className="locker-vault-perspective mx-auto flex justify-center my-4">
                <div
                  onClick={demoLockerOpen ? handleDemoClose : handleDemoUnlock}
                  className={`relative h-48 w-48 rounded-3xl border-2 transition-all duration-700 cursor-pointer flex flex-col items-center justify-center p-4 text-center ${
                    demoLockerOpen
                      ? 'border-emerald-500 bg-emerald-950/40 locker-door is-open shadow-[0_0_30px_rgba(16,185,129,0.35)]'
                      : 'border-white/20 bg-zinc-900/90 shadow-xl hover:border-primary'
                  }`}
                >
                  {demoLockerOpen ? (
                    <div className="space-y-2 animate-fadeIn">
                      <span className="text-4xl">🍪</span>
                      <p className="text-xs font-bold text-emerald-300">¡Compuerta Abierta!</p>
                      <p className="text-[10px] text-zinc-400">Retira tu brownie melcochudo</p>
                      <span className="text-[9px] font-mono text-emerald-400 underline">
                        Clic para cerrar
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                        <Lock size={24} />
                      </div>
                      <p className="font-brand text-xs font-bold text-foreground">Casillero #101</p>
                      <p className="text-[10px] font-mono text-muted-foreground">PIN: 4892</p>
                      <span className="inline-block rounded-lg bg-primary/20 px-2.5 py-1 text-[10px] font-mono font-bold text-primary border border-primary/30">
                        Toca para Desbloquear
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={demoLockerOpen ? handleDemoClose : handleDemoUnlock}
                  className="rounded-xl bg-secondary px-4 py-2 text-xs font-mono font-bold text-foreground hover:bg-secondary/80 transition-all"
                >
                  {demoLockerOpen ? 'Cerrar Compuerta' : 'Simular Apertura con PIN 4892'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: 3 Sleek Steps */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
                Paso a Paso
              </span>
              <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl text-foreground">
                Cero fricción. Retiro en 10 segundos.
              </h2>
            </div>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-card/40 p-4 backdrop-blur-md">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 font-mono font-bold text-primary text-sm">
                  01
                </div>
                <div>
                  <h3 className="font-brand text-sm font-bold text-foreground">Paga Digitalmente</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Tarjeta o QR Nequi/Bancolombia. Recibe tu pase con <strong>PIN de 4 dígitos</strong> de inmediato.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-card/40 p-4 backdrop-blur-md">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 font-mono font-bold text-amber-400 text-sm">
                  02
                </div>
                <div>
                  <h3 className="font-brand text-sm font-bold text-foreground">El Vendedor Deposita</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    El estudiante cocinero guarda el snack en el casillero usando su PIN de depósito <code>DEP-XXXX</code>.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-card/40 p-4 backdrop-blur-md">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 font-mono font-bold text-emerald-400 text-sm">
                  03
                </div>
                <div>
                  <h3 className="font-brand text-sm font-bold text-foreground">Digita y Disfruta</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pasa por la vitrina del campus, digita tus 4 dígitos en el teclado táctil y la compuerta se abre sola.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SLIDE 4: VITRINAS EN CAMPUS & FINAL CTA                   */}
      {/* ========================================================= */}
      <section
        ref={(el) => {
          sectionRefs.current[3] = el
        }}
        className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center sm:px-6 border-t border-white/5"
      >
        <div className="max-w-2xl mb-8">
          <span className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-bold">
            Vitrinas Activas en Campus
          </span>
          <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-5xl text-foreground">
            Encuentra tu casillero más cercano
          </h2>
        </div>

        {/* Hubs Selector Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl w-full text-left mb-12">
          {LOCKER_HUBS.map((hub) => {
            const isSel = hub.id === selectedHubId
            const hubLockers = getLockersByHub(hub.id)
            const readyCount = hubLockers.filter((l) => l.status === 'listo_para_retiro').length

            return (
              <button
                key={hub.id}
                type="button"
                onClick={() => {
                  setSelectedHubId(hub.id)
                  playKeyBeep(550)
                }}
                className={`rounded-3xl border p-5 backdrop-blur-xl transition-all ${
                  isSel
                    ? 'border-primary bg-primary/15 shadow-xl shadow-primary/15 ring-2 ring-primary'
                    : 'border-white/10 bg-card/50 hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-brand text-sm font-bold text-foreground flex items-center gap-2">
                    <MapPin size={16} className={isSel ? 'text-primary' : 'text-muted-foreground'} />
                    {hub.name}
                  </span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                </div>
                <p className="mt-3 text-xs font-mono font-bold text-emerald-400">
                  {readyCount} snacks listos para retirar
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">{hub.zone}</p>
              </button>
            )
          })}
        </div>

        {/* Bottom Giant CTA Box */}
        <div className="rounded-3xl border border-primary/40 bg-gradient-to-b from-primary/10 via-card to-zinc-950 p-8 sm:p-12 max-w-3xl w-full space-y-6 shadow-2xl">
          <h3 className="font-display text-3xl font-black sm:text-4xl text-foreground">
            ¿Listo para vivir la experiencia Bocado?
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Explora las vitrinas 24/7 en vivo o únete como estudiante cocinero para vender sin perder tiempo de clase.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/vitrina"
              className="rounded-2xl bg-primary px-8 py-4 font-display text-sm font-bold text-primary-foreground shadow-xl shadow-primary/30 hover:brightness-110 active:scale-95 transition-all"
            >
              Abrir Vitrina 24/7
            </Link>
            <Link
              to="/registro"
              className="rounded-2xl border border-white/15 bg-secondary px-8 py-4 font-display text-sm font-semibold text-foreground hover:bg-secondary/80 active:scale-95 transition-all"
            >
              Vender en Casillero
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
