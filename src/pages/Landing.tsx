import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Boxes,
  Clock,
  KeyRound,
  Lock,
  MapPin,
  ShieldCheck,
  Smartphone,
  Sparkles,
  ThermometerSnowflake,
  TrendingUp,
  Unlock,
  Zap,
} from 'lucide-react'
import { AnimatedBackdrop } from '../components/landing/AnimatedBackdrop'
import { StallCarousel } from '../components/landing/StallCarousel'
import { LOCKER_HUBS, getLockersByHub } from '../lib/lockers'
import { playKeyBeep, playLockerUnlock } from '../lib/sounds'

const benefits = [
  {
    title: 'Cero esperas y cero encuentros',
    description: 'Ya no tienes que coordinar "¿dónde estás?" ni correr entre pisos. Tu snack te espera seguro en el casillero.',
    icon: Clock,
  },
  {
    title: 'PIN de 4 dígitos o QR Contactless',
    description: 'Al pagar con tarjeta o QR Nequi/Bancolombia recibes de inmediato tu pase digital de apertura.',
    icon: KeyRound,
  },
  {
    title: 'Comida protegida y fresca',
    description: 'Casilleros con compartimentos refrigerados y a temperatura ambiente según el snack.',
    icon: ThermometerSnowflake,
  },
  {
    title: 'Ventas 24/7 para emprendedores',
    description: 'Los estudiantes cocineros depositan por la mañana con su PIN de depósito y el sistema vende automáticamente.',
    icon: TrendingUp,
  },
]

export function LandingPage() {
  const [demoLockerOpen, setDemoLockerOpen] = useState(false)
  const [selectedHubId, setSelectedHubId] = useState('hub_edificio_d')

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
    <div className="relative overflow-hidden">
      <AnimatedBackdrop />

      {/* Cyber Grid background glow */}
      <div className="cyber-grid pointer-events-none fixed inset-0 opacity-25" />

      {/* Hero Section */}
      <section className="relative z-[1] mx-auto max-w-5xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24">
        {/* Glowing Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md mb-6 animate-pulse">
          <Sparkles size={14} className="text-primary" />
          <span className="font-mono uppercase tracking-wider">Nueva Era · Vitrina Inteligente de Campus</span>
        </div>

        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl text-foreground">
          Snacks en campus{' '}
          <span className="bg-gradient-to-r from-primary via-emerald-400 to-cyan-300 bg-clip-text text-transparent">
            con casilleros inteligentes.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
          Olvida los encuentros personales y el caos de WhatsApp. Compra tus postres o snacks favoritos,
          recibe un <strong className="text-foreground">PIN o código QR digital</strong> y retira al instante
          en las vitrinas automatizadas del campus.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col justify-center gap-3.5 sm:flex-row">
          <Link
            to="/vitrina"
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 font-display text-sm font-bold text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:brightness-110 active:scale-95"
          >
            <Boxes size={18} />
            Ver Vitrina de Casilleros 24/7
          </Link>
          <Link
            to="/catalogo"
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/80 px-7 py-3.5 font-display text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:bg-secondary active:scale-95"
          >
            Explorar Snacks Disponibles
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Interactive 3D Demo Locker Teaser */}
        <div className="mt-14 max-w-xl mx-auto rounded-3xl border border-primary/30 bg-card/70 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4 text-xs font-mono text-muted-foreground">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              DEMO VIRTUAL INTERACTIVA
            </span>
            <span>EDIFICIO D · SLOT #101</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
            {/* 3D Locker Door Component */}
            <div className="locker-vault-perspective">
              <div
                className={`relative h-44 w-44 rounded-2xl border-2 transition-all duration-700 cursor-pointer flex flex-col items-center justify-center p-3 text-center ${
                  demoLockerOpen
                    ? 'border-emerald-500 bg-emerald-950/40 locker-door is-open shadow-[0_0_25px_rgba(16,185,129,0.3)]'
                    : 'border-border/80 bg-zinc-900/90 shadow-lg hover:border-primary/60'
                }`}
                onClick={demoLockerOpen ? handleDemoClose : handleDemoUnlock}
              >
                {demoLockerOpen ? (
                  <div className="space-y-2 animate-fadeIn">
                    <span className="text-3xl">🍪</span>
                    <p className="text-xs font-bold text-emerald-300">¡Compuerta Abierta!</p>
                    <p className="text-[10px] text-muted-foreground">Brownie Melcochudo listo para retirar</p>
                    <span className="inline-flex text-[9px] font-mono text-emerald-400 underline">
                      Clic para cerrar
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <Lock size={20} />
                    </div>
                    <p className="text-xs font-bold text-foreground">Casillero #101</p>
                    <p className="text-[10px] font-mono text-muted-foreground">PIN: 4892 · Ocupado</p>
                    <span className="inline-block rounded-md bg-primary/20 px-2 py-0.5 text-[10px] font-mono font-bold text-primary">
                      Toca para Desbloquear
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Teaser copy & interactive prompt */}
            <div className="text-left space-y-3 max-w-xs">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
                <Zap size={15} />
                <span>Simulador de Hardware</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Prueba cómo responde el casillero cuando un comprador digita su PIN o acerca el código QR.
              </p>
              <div className="pt-1 flex gap-2">
                {!demoLockerOpen ? (
                  <button
                    type="button"
                    onClick={handleDemoUnlock}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-500 text-slate-950 px-3 py-1.5 text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-md shadow-emerald-500/20"
                  >
                    <Unlock size={14} />
                    Simular PIN 4892
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDemoClose}
                    className="flex items-center gap-1.5 rounded-lg bg-secondary text-foreground px-3 py-1.5 text-xs font-semibold hover:bg-secondary/80 active:scale-95 transition-all"
                  >
                    <Lock size={14} />
                    Cerrar Compuerta
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Live Campus Radar Gauges */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto text-left">
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
                  playKeyBeep(520)
                }}
                className={`rounded-2xl border p-4 backdrop-blur-md transition-all text-left ${
                  isSel
                    ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10 ring-1 ring-primary'
                    : 'border-border/70 bg-card/50 hover:border-primary/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-brand text-xs font-bold text-foreground flex items-center gap-1.5">
                    <MapPin size={14} className={isSel ? 'text-primary' : 'text-muted-foreground'} />
                    {hub.name}
                  </span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                </div>
                <p className="mt-2 text-xs font-semibold text-emerald-400">
                  {readyCount} snacks listos para recoger
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{hub.zone}</p>
              </button>
            )
          })}
        </div>
      </section>

      {/* Marquee Snacks in lockers */}
      <section id="snacks" className="relative z-[1] scroll-mt-24 py-12">
        <div className="mx-auto max-w-3xl px-4 text-center mb-6">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            Snacks frescos dentro de los casilleros
          </h2>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Brownies, galletas, empanadas, postres fríos y fit disponibles ahora mismo.
          </p>
        </div>
        <StallCarousel />
      </section>

      {/* 3-Step Smart Locker Flow */}
      <section className="relative z-[1] border-t border-border/60 bg-secondary/20 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-primary uppercase tracking-wider">
              Flujo Contactless
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-4xl text-foreground">
              ¿Cómo funciona la Vitrina Bocado?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Comprar en el campus nunca fue tan rápido ni tan seguro.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative rounded-3xl border border-border/80 bg-card/80 p-6 backdrop-blur-sm shadow-sm space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 font-display text-lg font-bold text-primary">
                1
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">Elige & Paga Digital</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Selecciona tu snack favorito en el catálogo. Paga con tarjeta digital o transferencia QR (Nequi / Bancolombia).
              </p>
              <div className="rounded-xl bg-secondary/60 p-3 text-[11px] font-mono text-primary flex items-center gap-2">
                <Smartphone size={15} />
                <span>Generación de PIN y QR en 1 segundo</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-3xl border border-border/80 bg-card/80 p-6 backdrop-blur-sm shadow-sm space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 font-display text-lg font-bold text-primary">
                2
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">Vendedor Deposita</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                El estudiante cocinero coloca la preparación en el casillero asignado usando su PIN especial <code>DEP-XXXX</code>.
              </p>
              <div className="rounded-xl bg-secondary/60 p-3 text-[11px] font-mono text-amber-400 flex items-center gap-2">
                <ShieldCheck size={15} />
                <span>Bloqueo magnético seguro 24/7</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-3xl border border-border/80 bg-card/80 p-6 backdrop-blur-sm shadow-sm space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 font-display text-lg font-bold text-primary">
                3
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">Digita y Retira</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pasa por la vitrina del Edificio D o Samán, digita tus 4 dígitos en el teclado táctil y la compuerta se abre con sonido LED.
              </p>
              <div className="rounded-xl bg-secondary/60 p-3 text-[11px] font-mono text-emerald-400 flex items-center gap-2">
                <Unlock size={15} />
                <span>Desbloqueo físico instantáneo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits Grid */}
      <section className="relative z-[1] mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            Diseñado para la vida universitaria sin fricción
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/80 bg-card/60 p-5 backdrop-blur-sm shadow-sm hover:border-primary/50 transition-all space-y-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <b.icon size={20} />
              </div>
              <h3 className="font-display text-sm font-bold text-foreground">{b.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{b.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="relative z-[1] border-t border-border/60 bg-gradient-to-b from-transparent to-primary/10 py-16 text-center">
        <div className="mx-auto max-w-3xl px-4 space-y-6">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl text-foreground">
            ¿Listo para probar la vitrina inteligente?
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Explora la vitrina en tiempo real o regístrate como vendedor para comenzar a generar ingresos sin interrumpir tus clases.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/vitrina"
              className="rounded-xl bg-primary px-8 py-3.5 font-display text-sm font-bold text-primary-foreground shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
            >
              Abrir Vitrina 24/7
            </Link>
            <Link
              to="/registro"
              className="rounded-xl border border-border bg-card px-8 py-3.5 font-display text-sm font-semibold text-foreground hover:bg-secondary active:scale-95 transition-all"
            >
              Vender con Casillero
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
