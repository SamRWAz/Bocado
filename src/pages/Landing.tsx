import { MapPin, Search, ShieldCheck, Store, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PublicFooter, PublicHeader } from '../components/layout/PublicChrome'
import { fetchProducts } from '../lib/api'
import { displaySeller, money } from '../lib/format'
import type { Product } from '../types'

const steps = [
  {
    icon: Search,
    title: 'Encuentra el mecato',
    text: 'Un solo catálogo con brownies, paquetes, tortas y lo que se venda hoy en el campus.',
  },
  {
    icon: Wallet,
    title: 'Reserva en segundos',
    text: 'Indicas que lo quieres, eliges punto de encuentro y el vendedor prepara tu pedido.',
  },
  {
    icon: MapPin,
    title: 'Recógelo en el campus',
    text: 'Sin domicilio raro ni grupos de WhatsApp perdidos. Todo queda registrado.',
  },
]

const highlights = [
  { label: 'Puestos en un solo feed', value: 'Todo el mecato' },
  { label: 'Para estudiantes', value: 'Compra y vende' },
  { label: 'Sin comisión oculta', value: '5% opcional' },
]

export function LandingPage() {
  const [featured, setFeatured] = useState<Product[]>([])

  useEffect(() => {
    void fetchProducts().then((products) => {
      setFeatured(products.filter((p) => !p.sold_out && p.stock > 0).slice(0, 4))
    })
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-display font-semibold text-primary">
              El mecato de tu campus
            </p>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Compra y vende snacks universitarios en un solo lugar.
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Bocado junta los puestos del campus, te deja reservar lo que se te antoje y le da a
              quien vende un tablero simple de inventario y pedidos.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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
            <div className="mt-10 grid grid-cols-3 gap-3">
              {highlights.map((item) => (
                <div key={item.label} className="rounded-lg border border-border bg-card p-3">
                  <p className="font-display text-sm font-bold sm:text-base">{item.value}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {featured.map((product) => (
              <Link
                key={product.id}
                to={`/producto/${product.id}`}
                className="overflow-hidden rounded-lg border border-border bg-card"
              >
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="h-32 w-full object-cover" />
                ) : (
                  <div className="flex h-32 items-center justify-center bg-secondary text-2xl">🍿</div>
                )}
                <div className="p-3">
                  <p className="truncate font-display font-semibold">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{displaySeller(product.seller)}</p>
                  <p className="mt-2 font-display font-bold text-primary">{money(product.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="border-y border-border bg-card/40 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-3xl font-bold">Cómo funciona</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Pensado para el receso entre clases, no para un supermercado.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.title} className="rounded-lg border border-border bg-background p-6">
                <step.icon className="mb-4 text-primary" size={28} />
                <h3 className="font-display text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="puestos" className="py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold">Si vendes en el campus, esto es tu puesto digital.</h2>
            <p className="mt-4 text-muted-foreground">
              Publica el snack, controla unidades, ve quién lo pidió y marca el pedido como listo
              para recoger. El catálogo se actualiza solo.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                'Inventario con un toque',
                'Pedidos separados por puesto',
                'Foto opcional y categorías reales de mecato',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-primary" /> {item}
                </li>
              ))}
            </ul>
            <Link
              to="/vender"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-display font-bold text-primary-foreground"
            >
              <Store size={18} /> Empezar a vender
            </Link>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Hoy en el feed</p>
            <p className="mt-2 font-display text-4xl font-bold text-primary">
              {featured.reduce((sum, p) => sum + p.stock, 0)}
            </p>
            <p className="text-sm text-muted-foreground">unidades disponibles en el catálogo</p>
          </div>
        </div>
      </section>
      <PublicFooter />
    </div>
  )
}
