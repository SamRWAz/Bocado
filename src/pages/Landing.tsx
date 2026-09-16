import { MapPin, MessageSquare, ShieldCheck, ShoppingBag, Sparkles, TrendingUp, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AnimatedBackdrop } from '../components/landing/AnimatedBackdrop'
import { StallCarousel } from '../components/landing/StallCarousel'

const buyerPerks = [
  'Vitrina centralizada con stock real: olvídate de preguntar "¿aún te queda?" por WhatsApp.',
  'Filtros por restricciones dietéticas: opciones veganas, sin gluten, fit/proteicas y sin azúcar.',
  'Ubicación en tiempo real: entérate en qué edificio o piso está el vendedor entre clases.',
  'Chat integrado express: respuestas con 1 toque para coordinar tu entrega en 30 segundos.',
]

const sellerPerks = [
  'Panel de control ágil: actualiza tu inventario en menos de 10 segundos.',
  'Cero pedidos perdidos: reservas ordenadas con punto de entrega pactado en campus.',
  'Pin de ubicación activa: fija dónde te encuentras hoy (Edificio D, Samán, etc.) y hasta qué hora.',
  'Métricas operativas: conoce la demanda real de tus snacks y calcula tus ganancias diarias.',
]

export function LandingPage() {
  return (
    <div className="relative">
      <AnimatedBackdrop />

      {/* Hero Section */}
      <section className="relative z-[1] mx-auto max-w-4xl px-4 pb-12 pt-16 text-center sm:px-6 sm:pt-24">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md mb-6 animate-pulse">
          <Sparkles size={14} />
          <span>El ecosistema de snacks universitarios en tiempo real</span>
        </div>

        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl text-foreground">
          Tus snacks favoritos en el campus,{' '}
          <span className="bg-gradient-to-r from-primary via-amber-400 to-orange-300 bg-clip-text text-transparent">
            sin perder tiempo entre clases.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
          Bocado conecta a estudiantes emprendedores con compradores en el campus. Vitrina en vivo, ubicación de vendedores en tiempo real y chat express para recoger tu comida al instante.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3.5 sm:flex-row">
          <Link
            to="/catalogo"
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 font-display text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-95 active:scale-95"
          >
            <ShoppingBag size={18} />
            Ver Snacks en el Campus
          </Link>
          <Link
            to="/registro"
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/80 px-7 py-3.5 font-display text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:bg-secondary active:scale-95"
          >
            Quiero Vender Snacks
          </Link>
        </div>

        {/* Quick Highlights Bar */}
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-3xl mx-auto text-left">
          <div className="rounded-xl border border-border/80 bg-card/60 p-3.5 backdrop-blur-sm">
            <Zap size={16} className="text-primary mb-1.5" />
            <p className="text-xs font-bold text-foreground">Stock en Tiempo Real</p>
            <p className="text-[11px] text-muted-foreground">Sin ceguera de inventario</p>
          </div>
          <div className="rounded-xl border border-border/80 bg-card/60 p-3.5 backdrop-blur-sm">
            <MapPin size={16} className="text-primary mb-1.5" />
            <p className="text-xs font-bold text-foreground">Ubicación en Campus</p>
            <p className="text-[11px] text-muted-foreground">Edificio D, Samán, Biblio</p>
          </div>
          <div className="rounded-xl border border-border/80 bg-card/60 p-3.5 backdrop-blur-sm">
            <MessageSquare size={16} className="text-primary mb-1.5" />
            <p className="text-xs font-bold text-foreground">Chat Integrado</p>
            <p className="text-[11px] text-muted-foreground">Respuestas en 1 toque</p>
          </div>
          <div className="rounded-xl border border-border/80 bg-card/60 p-3.5 backdrop-blur-sm">
            <ShieldCheck size={16} className="text-primary mb-1.5" />
            <p className="text-xs font-bold text-foreground">Reserva Garantizada</p>
            <p className="text-[11px] text-muted-foreground">Aparta antes del receso</p>
          </div>
        </div>
      </section>

      {/* Marquee Snacks Section */}
      <section id="snacks" className="relative z-[1] scroll-mt-24 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 text-center mb-6">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Snacks que están rodando por la universidad
          </h2>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Brownies, galletas, empanadas, postres saludables y más preparados por tus compañeros.
          </p>
        </div>
        <StallCarousel />
      </section>

      {/* Value Proposition Grid */}
      <section id="beneficios" className="relative z-[1] mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Diseñado para la vida universitaria
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Eliminamos la fricción de los grupos masivos de WhatsApp y las entregas erráticas en el campus.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Buyer Card */}
          <article className="rounded-2xl border border-border/80 bg-card/80 p-7 backdrop-blur-sm shadow-sm hover:border-primary/40 transition-all">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <ShoppingBag size={24} />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">Si eres Comprador</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Estudiantes y docentes que quieren comer rico sin esperar ni caminar a ciegas.
            </p>
            <ul className="mt-5 space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {buyerPerks.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-primary font-bold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/catalogo"
              className="mt-6 inline-flex items-center gap-1.5 font-display text-xs font-bold text-primary hover:underline"
            >
              Explorar vitrina universitaria →
            </Link>
          </article>

          {/* Seller Card */}
          <article className="rounded-2xl border border-border/80 bg-card/80 p-7 backdrop-blur-sm shadow-sm hover:border-primary/40 transition-all">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <TrendingUp size={24} />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">Si eres Estudiante Vendedor</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Emprendedores universitarios que quieren vender más rápido y sin caos de mensajes.
            </p>
            <ul className="mt-5 space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {sellerPerks.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-primary font-bold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/registro"
              className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 font-display text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Comenzar a vender en campus →
            </Link>
          </article>
        </div>
      </section>

      {/* How it Works 3 Steps */}
      <section className="relative z-[1] border-t border-border/60 bg-secondary/30 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center font-display text-2xl font-bold tracking-tight sm:text-3xl">
            ¿Cómo funciona una entrega en Bocado?
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 font-display text-lg font-bold text-primary">
                1
              </div>
              <h3 className="font-display text-base font-bold">Explora y Aparta</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Mira qué snacks hay disponibles en este instante en el campus y resérvalo antes de salir de tu salón.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 font-display text-lg font-bold text-primary">
                2
              </div>
              <h3 className="font-display text-base font-bold">Coordina por Chat</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Usa las respuestas rápidas ("Voy en camino", "📍 Estoy en el piso 2") para encontrarse en 30 segundos.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 font-display text-lg font-bold text-primary">
                3
              </div>
              <h3 className="font-display text-base font-bold">Recibe y Disfruta</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Pagas en el punto pactado (en efectivo o transferencia Nequi) y disfrutas tu receso.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
