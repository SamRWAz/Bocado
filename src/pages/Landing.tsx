import { ShoppingBag, Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AnimatedBackdrop } from '../components/landing/AnimatedBackdrop'
import { StallCarousel } from '../components/landing/StallCarousel'

const buyerPerks = [
  'Todo el catálogo del campus en un solo lugar',
  'Reservas en segundos y recoges entre clases',
  'Descubres puestos que no están en tu bloque',
]

const sellerPerks = [
  'Tu puesto visible para toda la universidad',
  'Pedidos ordenados, sin chats perdidos',
  'Publicas tu menú y lo actualizas cuando quieras',
]

export function LandingPage() {
  return (
    <div className="relative">
      <AnimatedBackdrop />

      <section className="relative z-[1] mx-auto max-w-3xl px-4 pb-10 pt-16 text-center sm:px-6 sm:pt-24">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Compra y vende comida en tu universidad.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          Bocado reúne los puestos para que reserves lo que se te antoje y lo recojas en el receso.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/registro"
            className="rounded-lg bg-primary px-6 py-3 text-center font-display font-bold text-primary-foreground"
          >
            Crear cuenta
          </Link>
          <Link
            to="/catalogo"
            className="rounded-lg bg-secondary px-6 py-3 text-center font-display font-semibold"
          >
            Ver catálogo
          </Link>
        </div>
      </section>

      <section id="puestos" className="relative z-[1] scroll-mt-24 py-10 sm:py-14">
        <h2 className="mb-6 text-center font-display text-2xl font-bold sm:text-3xl">
          Puestos que podrías encontrar
        </h2>
        <StallCarousel />
      </section>

      <section id="beneficios" className="relative z-[1] mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6">
        <h2 className="mb-8 text-center font-display text-2xl font-bold sm:text-3xl">Por qué usar Bocado</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-lg border border-border bg-card/80 p-6 backdrop-blur-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShoppingBag size={20} />
            </div>
            <h3 className="font-display text-xl font-semibold">Si compras</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {buyerPerks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-lg border border-border bg-card/80 p-6 backdrop-blur-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Store size={20} />
            </div>
            <h3 className="font-display text-xl font-semibold">Si vendes</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {sellerPerks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Link to="/registro" className="mt-6 inline-block text-sm font-display font-semibold text-primary">
              Crear cuenta para vender →
            </Link>
          </article>
        </div>
      </section>
    </div>
  )
}
