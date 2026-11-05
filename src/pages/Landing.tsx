import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import {
  ArrowRight,
  Bike,
  ChefHat,
  ChevronRight,
  Package,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { ThreeHeroCanvas } from '../components/ThreeHeroCanvas'
import { playKeyBeep } from '../lib/sounds'
import { fetchProducts } from '../lib/api'
import { displaySeller, money } from '../lib/format'
import { calculateDeliveryFee } from '../lib/pricing'
import type { Product } from '../types'

const FALLBACK_SNACKS: Product[] = [
  {
    id: 'f1',
    name: 'Brownie Melcochudo con Arequipe',
    description: 'Textura fudgy horneada con chocolate semi-amargo al 70% y corazón de dulce de leche.',
    price: 4500,
    image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    category: 'Brownies',
    stock: 12,
    sold_out: false,
    seller: 'Camila Repostería',
    intent_count: 5,
    created_at: new Date().toISOString(),
  },
  {
    id: 'f2',
    name: 'Galleta Choco-Chips XL',
    description: 'Mantequilla tostada, chispas de chocolate belga y una pizca de sal marina.',
    price: 3500,
    image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80',
    category: 'Galletas',
    stock: 15,
    sold_out: false,
    seller: 'BakeLab Icesi',
    intent_count: 8,
    created_at: new Date().toISOString(),
  },
  {
    id: 'f3',
    name: 'Mini Cheesecake Frutos Rojos',
    description: 'Base de galleta crujiente con coulis artesanal de moras y fresas del Valle.',
    price: 5500,
    image_url: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?auto=format&fit=crop&w=600&q=80',
    category: 'Postres',
    stock: 8,
    sold_out: false,
    seller: 'Dulce Detalle',
    intent_count: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: 'f4',
    name: 'Empanadas Vallunas Horneadas (x2)',
    description: 'Rellenas de carne desmechada sazonada con hogao tradicional.',
    price: 4000,
    image_url: 'https://images.unsplash.com/photo-1628191010210-a59de33e5941?auto=format&fit=crop&w=600&q=80',
    category: 'Salados',
    stock: 10,
    sold_out: false,
    seller: 'Snacks Caseros M',
    intent_count: 4,
    created_at: new Date().toISOString(),
  },
]

const DISTANCE_PRESETS = [
  { origin: 'Edificio D', dest: 'Edificio E', label: 'Corta distancia (Mismo bloque)' },
  { origin: 'Edificio M', dest: 'Edificio B', label: 'Media distancia (Cruce central)' },
  { origin: 'Edificio M', dest: 'Coliseo', label: 'Larga distancia (Campus completo)' },
]

export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const heroTextRef = useRef<HTMLDivElement>(null)
  const [selectedRoute, setSelectedRoute] = useState(DISTANCE_PRESETS[0])
  const [snacks, setSnacks] = useState<Product[]>(FALLBACK_SNACKS)

  const calculatedFee = calculateDeliveryFee(selectedRoute.origin, selectedRoute.dest)

  useEffect(() => {
    fetchProducts()
      .then((data) => {
        if (data && data.length > 0) {
          setSnacks(data.slice(0, 4))
        }
      })
      .catch(() => {})
  }, [])

  // GSAP subtle fluid entrance on mount
  useEffect(() => {
    if (!heroTextRef.current) return
    const ctx = gsap.context(() => {
      gsap.from('.gsap-fade-in', {
        opacity: 0,
        y: 24,
        duration: 0.9,
        stagger: 0.12,
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
      <section className="relative min-h-[90vh] flex flex-col justify-center px-4 sm:px-8 lg:px-12 pt-16 pb-20 border-b border-[#E5DFD7] dark:border-[#26201C] overflow-hidden">
        {/* Interactive 3D Canvas Background */}
        <ThreeHeroCanvas />

        <div ref={heroTextRef} className="relative z-10 max-w-4xl mx-auto w-full text-center space-y-8">
          {/* Minimalist Pill Badge */}
          <div className="gsap-fade-in inline-flex items-center gap-2 rounded-full border border-[#8F1414]/25 bg-white/70 dark:bg-[#1C1816]/80 px-4 py-1.5 backdrop-blur-md shadow-xs">
            <span className="h-2 w-2 rounded-full bg-[#8F1414] animate-pulse" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#8F1414] dark:text-red-400">
              Red Logística Universidad Icesi
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
            Conectamos estudiantes que hornean con antojos en todo el campus. Domiciliarios en sus huecos libres te llevan brownies, postres y salados en minutos por solo <strong>$100 a $500 COP</strong>.
          </p>

          {/* Action CTAs */}
          <div className="gsap-fade-in flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/catalogo"
              onClick={() => playKeyBeep(700)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#8F1414] px-8 py-4 font-display text-sm font-bold text-white shadow-sm hover:bg-[#751010] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Package size={18} />
              <span>Explorar Snacks Disponibles</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/entregas"
              onClick={() => playKeyBeep(600)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl border-2 border-[#2C221C]/20 dark:border-white/20 bg-white/60 dark:bg-transparent px-8 py-4 font-display text-sm font-bold text-[#2C221C] dark:text-white hover:bg-white dark:hover:bg-white/10 active:scale-[0.98] transition-all cursor-pointer backdrop-blur-xs"
            >
              <Bike size={18} />
              <span>Ser Domiciliario</span>
            </Link>
          </div>

          {/* Micro Value Proposition Bar */}
          <div className="gsap-fade-in pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-[#59483E] dark:text-[#9E9084]">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8F1414]" />
              Tarifas por distancia ($100 - $500)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8F1414]" />
              Vendedores móviles en campus
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8F1414]" />
              Wompi (Nequi, Tarjetas, PSE)
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. LOS 3 ROLES DEL ECOSISTEMA (CLEAN MINIMALIST BENTO)    */}
      {/* ========================================================= */}
      <section className="py-20 px-4 sm:px-8 lg:px-12 border-b border-[#E5DFD7] dark:border-[#26201C] bg-white dark:bg-[#161210]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#8F1414] dark:text-red-400">
              Arquitectura Simplificada · 3 Roles
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-[#2C221C] dark:text-[#FAF6F0]">
              Diseñado exclusivamente para la vida universitaria
            </h2>
            <p className="text-sm text-[#59483E] dark:text-[#B3A69C]">
              Sin burocracia, sin algoritmos opacos. Tres actores trabajando juntos en la misma universidad.
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
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#8F1414] dark:text-red-400 block mb-1">
                    Rol 01
                  </span>
                  <h3 className="font-display text-2xl font-bold text-[#2C221C] dark:text-[#FAF6F0]">
                    Comprador
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#59483E] dark:text-[#B3A69C] leading-relaxed">
                  Pide antojos caseros desde tu celular. Seleccionas en qué punto del campus estás y un domiciliario te lo lleva hasta tu ubicación en minutos.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#E5DFD7] dark:border-[#26201C] flex items-center justify-between text-xs font-mono text-[#2C221C] dark:text-[#FAF6F0]">
                <span>Micro-tarifa de entrega</span>
                <span className="font-bold text-[#8F1414] dark:text-red-400">$100 - $500 COP</span>
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
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#751010] dark:text-red-400 block mb-1">
                    Rol 02
                  </span>
                  <h3 className="font-display text-2xl font-bold text-[#2C221C] dark:text-[#FAF6F0]">
                    Vendedor
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#59483E] dark:text-[#B3A69C] leading-relaxed">
                  Publica tus recetas y snacks caseros en segundos. Muévete libremente por el campus mientras los domiciliarios coordinan la entrega directa.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#E5DFD7] dark:border-[#26201C] flex items-center justify-between text-xs font-mono text-[#2C221C] dark:text-[#FAF6F0]">
                <span>Comisión fija justa</span>
                <span className="font-bold text-[#751010] dark:text-red-400">$100 - $500 COP máx</span>
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
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#8F1414] dark:text-red-400 block mb-1">
                    Rol 03
                  </span>
                  <h3 className="font-display text-2xl font-bold text-[#2C221C] dark:text-[#FAF6F0]">
                    Domiciliario
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#59483E] dark:text-[#B3A69C] leading-relaxed">
                  Acepta pedidos en tus huecos y tiempos libres entre clases. Conecta con el vendedor por chat, recoge el snack y llévalo al comprador a pie.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#E5DFD7] dark:border-[#26201C] flex items-center justify-between text-xs font-mono text-[#2C221C] dark:text-[#FAF6F0]">
                <span>Ganancia por entrega</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">100% de la tarifa</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. SIMULADOR INTERACTIVO DE DISTANCIAS Y LOGÍSTICA         */}
      {/* ========================================================= */}
      <section className="py-20 px-4 sm:px-8 lg:px-12 border-b border-[#E5DFD7] dark:border-[#26201C] bg-[#FAF6F0] dark:bg-[#120F0D]">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#8F1414] dark:text-red-400">
              Simulador en Tiempo Real
            </span>
            <h2 className="font-display text-3xl font-black text-[#2C221C] dark:text-[#FAF6F0]">
              Tarifas micro-escaladas por distancia
            </h2>
            <p className="text-xs sm:text-sm text-[#59483E] dark:text-[#B3A69C] max-w-xl mx-auto">
              Los domicilios se calculan de forma transparente entre las zonas de la Universidad Icesi. Selecciona una ruta para probar:
            </p>
          </div>

          <div className="rounded-3xl border border-[#E5DFD7] dark:border-[#26201C] bg-white dark:bg-[#1C1816] p-6 sm:p-8 shadow-sm space-y-6">
            {/* Route selector buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DISTANCE_PRESETS.map((preset) => {
                const isSelected = selectedRoute.origin === preset.origin && selectedRoute.dest === preset.dest
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      playKeyBeep(520)
                      setSelectedRoute(preset)
                    }}
                    className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#8F1414] bg-[#8F1414]/5 dark:bg-[#8F1414]/15 shadow-xs'
                        : 'border-[#E5DFD7] dark:border-[#26201C] hover:bg-neutral-50 dark:hover:bg-neutral-900'
                    }`}
                  >
                    <p className="text-xs font-mono font-bold text-[#8F1414] dark:text-red-400">
                      {preset.origin} → {preset.dest}
                    </p>
                    <p className="text-[11px] text-[#59483E] dark:text-[#B3A69C] mt-1 font-medium">
                      {preset.label}
                    </p>
                  </button>
                )
              })}
            </div>

            {/* Calculated Breakdown Display */}
            <motion.div
              key={selectedRoute.origin + selectedRoute.dest}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl bg-[#FAF6F0] dark:bg-[#14100E] p-6 border border-[#E5DFD7] dark:border-[#26201C] flex flex-col sm:flex-row items-center justify-between gap-6"
            >
              <div className="space-y-1.5 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck size={14} />
                  <span>Tarifa oficial Bocado</span>
                </div>
                <h4 className="font-display text-lg font-bold text-[#2C221C] dark:text-[#FAF6F0]">
                  Ruta {selectedRoute.origin} a {selectedRoute.dest}
                </h4>
                <p className="text-xs text-[#59483E] dark:text-[#B3A69C]">
                  El domiciliario gana el 100% de esta tarifa por llevar el encargo a pie.
                </p>
              </div>

              <div className="text-center sm:text-right shrink-0">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#59483E] dark:text-[#B3A69C] block">
                  Costo de Envío
                </span>
                <span className="font-display text-4xl font-black text-[#8F1414] dark:text-red-400">
                  {money(calculatedFee)} COP
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. SHOWCASE DE PRODUCTOS (NO CALIFICACIONES FALSAS)        */}
      {/* ========================================================= */}
      <section className="py-20 px-4 sm:px-8 lg:px-12 border-b border-[#E5DFD7] dark:border-[#26201C] bg-white dark:bg-[#161210]">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#8F1414] dark:text-red-400">
                Catálogo Vivo
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-[#2C221C] dark:text-[#FAF6F0]">
                Antojos destacados de hoy
              </h2>
              <p className="text-xs sm:text-sm text-[#59483E] dark:text-[#B3A69C] mt-1">
                Preparados por estudiantes en el campus, frescos todos los días.
              </p>
            </div>

            <Link
              to="/catalogo"
              className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#8F1414] dark:text-red-400 hover:underline"
            >
              <span>Ver todos los snacks</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {snacks.map((product: Product) => (
              <motion.div
                key={product.id}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="group rounded-3xl border border-[#E5DFD7] dark:border-[#26201C] bg-[#FAF6F0] dark:bg-[#1C1816] overflow-hidden flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="aspect-square relative overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                    <img
                      src={product.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="inline-block rounded-full bg-white/90 dark:bg-black/80 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#2C221C] dark:text-white backdrop-blur-xs">
                        {product.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-display text-base font-bold text-[#2C221C] dark:text-[#FAF6F0] line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-[#59483E] dark:text-[#B3A69C] line-clamp-2 leading-relaxed">
                      {product.description || 'Delicioso snack artesanal preparado en campus.'}
                    </p>
                    <p className="text-[11px] font-mono text-[#59483E] dark:text-[#9E9084] pt-1">
                      Por <span className="font-bold text-[#2C221C] dark:text-[#FAF6F0]">{displaySeller(product.seller)}</span>
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between border-t border-[#E5DFD7]/60 dark:border-[#26201C] mt-2">
                  <span className="font-display text-lg font-black text-[#8F1414] dark:text-red-400">
                    {money(product.price)}
                  </span>
                  <Link
                    to={`/producto/${product.id}`}
                    onClick={() => playKeyBeep(650)}
                    className="inline-flex items-center gap-1 rounded-xl bg-[#2C221C] dark:bg-[#FAF6F0] px-3.5 py-2 text-xs font-display font-bold text-white dark:text-[#2C221C] hover:opacity-90 active:scale-95 transition-all"
                  >
                    <span>Pedir</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. CÓMO FUNCIONA EL FLUJO PASO A PASO                     */}
      {/* ========================================================= */}
      <section className="py-20 px-4 sm:px-8 lg:px-12 border-b border-[#E5DFD7] dark:border-[#26201C] bg-[#FAF6F0] dark:bg-[#120F0D]">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#8F1414] dark:text-red-400">
              Proceso Logístico
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-[#2C221C] dark:text-[#FAF6F0]">
              Simple, seguro y en 3 pasos
            </h2>
            <p className="text-xs sm:text-sm text-[#59483E] dark:text-[#B3A69C] max-w-xl mx-auto">
              Todo ocurre dentro del campus universitario con confirmación en cada punto.
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
                Eliges tu producto, marcas el edificio donde te encuentras y pagas con Wompi o contra-entrega. Se genera una solicitud de entrega inmediata.
              </p>
            </div>

            <div className="rounded-3xl border border-[#E5DFD7] dark:border-[#26201C] bg-white dark:bg-[#1C1816] p-6 space-y-4 shadow-xs">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#751010] text-white font-mono font-bold text-sm">
                02
              </span>
              <h3 className="font-display text-lg font-bold text-[#2C221C] dark:text-[#FAF6F0]">
                Un domiciliario toma la ruta
              </h3>
              <p className="text-xs text-[#59483E] dark:text-[#B3A69C] leading-relaxed">
                Un estudiante cercano acepta el encargo. Se abre un chat privado para coordinar la recogida con el cocinero y la entrega con el comprador.
              </p>
            </div>

            <div className="rounded-3xl border border-[#E5DFD7] dark:border-[#26201C] bg-white dark:bg-[#1C1816] p-6 space-y-4 shadow-xs">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#590C0C] text-white font-mono font-bold text-sm">
                03
              </span>
              <h3 className="font-display text-lg font-bold text-[#2C221C] dark:text-[#FAF6F0]">
                Entrega y validación
              </h3>
              <p className="text-xs text-[#59483E] dark:text-[#B3A69C] leading-relaxed">
                Recibes tu comida caliente o fresca en mano. El domiciliario confirma la entrega y los fondos se liberan al vendedor y al repartidor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. CALL TO ACTION & FOOTER                                */}
      {/* ========================================================= */}
      <footer className="bg-[#1C1816] text-[#FAF6F0] py-16 px-4 sm:px-8 lg:px-12">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="rounded-3xl border border-white/10 bg-[#26201C] p-8 sm:p-12 text-center space-y-6">
            <h3 className="font-display text-3xl sm:text-4xl font-black text-white">
              ¿Listo para pedir tu primer antojo?
            </h3>
            <p className="text-sm text-neutral-300 max-w-xl mx-auto leading-relaxed">
              Descubre los mejores productos hechos por tus compañeros de universidad. O únete como vendedor o domiciliario hoy mismo.
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

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-white/10 text-xs font-mono text-neutral-400">
            <div>
              <p className="font-display font-bold text-white text-sm">Bocado Marketplace</p>
              <p className="text-[11px] mt-0.5">Micro-comercio universitario · Universidad Icesi · Cali, Colombia</p>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <Link to="/catalogo" className="hover:text-white transition-colors">Catálogo</Link>
              <Link to="/vender" className="hover:text-white transition-colors">Vender</Link>
              <Link to="/entregas" className="hover:text-white transition-colors">Domicilios</Link>
              <Link to="/pedidos" className="hover:text-white transition-colors">Pedidos</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
