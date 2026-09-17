import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  KeyRound,
  RotateCcw,
  ShoppingBag,
  Sparkles,
} from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { money } from '../../lib/format'
import { playKeyBeep, playLockerUnlock } from '../../lib/sounds'
import type { Product } from '../../types'

type ShowcaseItem = {
  id: string
  name: string
  seller: string
  price: number
  image_url: string
  lockerCode: string
  hubName: string
  category: string
  tag: string
  temp: 'refrigerado' | 'ambiente'
  description: string
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: 'showcase_1',
    name: 'Brownie Melcochudo con Nueces',
    seller: 'Valeria M. (Ed. D)',
    price: 3500,
    image_url: '/images/snack_anime_brownie.jpg',
    lockerCode: 'D-02',
    hubName: 'Edificio D',
    category: 'Postres · Sin Gluten',
    tag: '🍫 Más Vendido',
    temp: 'ambiente',
    description: 'Chocolate 70% cacao con centro fundido y nueces crocantes. Preparado esta mañana.',
  },
  {
    id: 'showcase_2',
    name: 'Parfait de Frutos Rojos y Chía',
    seller: 'Carlos R. (Samán)',
    price: 5000,
    image_url: '/images/snack_anime_parfait.jpg',
    lockerCode: 'S-01',
    hubName: 'Plazoleta Samán',
    category: 'Fit · Saludable',
    tag: '🍓 Refrigerado',
    temp: 'refrigerado',
    description: 'Yogur griego artesanal, coulis de arándanos y fresas silvestres con semillas de chía.',
  },
  {
    id: 'showcase_3',
    name: 'Empanadas Crocantes de Pollo (x2)',
    seller: 'Lucía D. (Biblioteca)',
    price: 4000,
    image_url: '/images/snack_anime_empanadas.jpg',
    lockerCode: 'B-04',
    hubName: 'Biblioteca Central',
    category: 'Salado · Horneado',
    tag: '🔥 Recién Horneado',
    temp: 'ambiente',
    description: 'Masa de maíz crujiente rellena de pechuga desmechada con guiso criollo y ají casero.',
  },
  {
    id: 'showcase_4',
    name: 'Galletas de Avena y Chispas',
    seller: 'Andrés P. (Ed. D)',
    price: 3000,
    image_url: '/images/snack_anime_cookies.jpg',
    lockerCode: 'D-05',
    hubName: 'Edificio D',
    category: 'Snack · Sin Azúcar',
    tag: '🍪 Endulzado con Miel',
    temp: 'ambiente',
    description: 'Pack de 3 galletas artesanales de avena en hojuelas con canela y chips de chocolate semiamargo.',
  },
]

export function KamuiCardShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const { add } = useCart()
  const navigate = useNavigate()

  const count = SHOWCASE_ITEMS.length
  const currentItem = SHOWCASE_ITEMS[activeIndex]

  const prevIndex = (activeIndex - 1 + count) % count
  const nextIndex = (activeIndex + 1) % count

  const prevItem = SHOWCASE_ITEMS[prevIndex]
  const nextItem = SHOWCASE_ITEMS[nextIndex]

  const handlePrev = () => {
    playKeyBeep(520)
    setIsFlipped(false)
    setActiveIndex(prevIndex)
  }

  const handleNext = () => {
    playKeyBeep(640)
    setIsFlipped(false)
    setActiveIndex(nextIndex)
  }

  const handleCardClick = () => {
    playKeyBeep(isFlipped ? 440 : 880)
    setIsFlipped(!isFlipped)
  }

  const handleInstantBuy = (e: React.MouseEvent, item: ShowcaseItem) => {
    e.stopPropagation()
    playLockerUnlock()
    const productData: Product = {
      id: item.id,
      name: item.name,
      price: item.price,
      stock: 5,
      sold_out: false,
      seller: item.seller,
      intent_count: 10,
      created_at: new Date().toISOString(),
      image_url: item.image_url,
      category: item.category,
      description: item.description,
      lockerNumber: item.lockerCode,
    }
    add(productData, 1)
    navigate('/carrito')
  }

  return (
    <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center justify-center py-6">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-72 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />

      {/* 3D Kamui Triple Card Carousel Container */}
      <div className="perspective-1200 relative flex h-[440px] sm:h-[480px] w-full items-center justify-center">
        {/* Left Dimmed Perspective Card */}
        <div
          onClick={handlePrev}
          className="absolute left-2 sm:left-12 z-10 hidden sm:flex h-[360px] w-[240px] cursor-pointer flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/70 p-4 opacity-40 shadow-2xl backdrop-blur-md transition-all duration-500 hover:opacity-75 hover:scale-95"
          style={{
            transform: 'translateX(-40px) rotateY(25deg) scale(0.85)',
          }}
        >
          <img
            src={prevItem.image_url}
            alt={prevItem.name}
            className="h-44 w-full rounded-2xl object-cover grayscale brightness-75"
          />
          <div className="mt-3 space-y-1">
            <span className="font-mono text-[10px] text-zinc-400">{prevItem.lockerCode}</span>
            <p className="font-brand text-xs font-bold text-zinc-300 truncate">{prevItem.name}</p>
            <p className="font-mono text-xs text-primary font-bold">{money(prevItem.price)}</p>
          </div>
        </div>

        {/* Center Active 3D Flip Card */}
        <div
          onClick={handleCardClick}
          className={`card-3d-card relative z-20 h-[430px] sm:h-[460px] w-[280px] sm:w-[320px] cursor-pointer rounded-3xl ${
            isFlipped ? 'is-flipped' : ''
          }`}
        >
          {/* Card FRONT Face */}
          <div className="backface-hidden absolute inset-0 flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-primary/50 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black p-4 shadow-[0_0_35px_rgba(249,115,22,0.3)] backdrop-blur-xl">
            {/* Top Bar with Slot ID & Temp Status */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-mono text-xs font-black tracking-wider text-emerald-400">
                  SLOT #{currentItem.lockerCode}
                </span>
              </div>
              <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-primary border border-primary/30">
                {currentItem.hubName}
              </span>
            </div>

            {/* Snack Visual with Gem Hologram Frame */}
            <div className="relative my-2 overflow-hidden rounded-2xl border border-white/15 group">
              <img
                src={currentItem.image_url}
                alt={currentItem.name}
                className="h-48 w-full object-cover transition-transform duration-500 hover:scale-110"
              />
              <span className="absolute top-2 left-2 rounded-lg bg-black/75 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300 backdrop-blur-sm border border-white/10">
                {currentItem.tag}
              </span>
              <div className="absolute bottom-2 right-2 rounded-full bg-black/80 px-2 py-0.5 text-[10px] font-mono text-zinc-300 flex items-center gap-1 backdrop-blur-sm">
                <RotateCcw size={11} className="text-primary animate-spin" />
                <span>Toca para girar</span>
              </div>
            </div>

            {/* Info and Price */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">
                {currentItem.category}
              </span>
              <h3 className="font-brand text-base font-bold text-foreground line-clamp-1">
                {currentItem.name}
              </h3>
              <p className="text-[11px] text-muted-foreground truncate">Por {currentItem.seller}</p>

              <div className="pt-2 flex items-center justify-between border-t border-white/10">
                <div>
                  <span className="text-[9px] uppercase text-zinc-400 block">Precio</span>
                  <span className="font-mono text-lg font-black text-primary">{money(currentItem.price)}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleInstantBuy(e, currentItem)}
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 font-display text-xs font-bold text-primary-foreground shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95 transition-all"
                >
                  <ShoppingBag size={14} />
                  <span>Apartar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card BACK Face (Revealed on 180° Flip) */}
          <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-cyan-500/60 bg-gradient-to-b from-slate-950 via-zinc-950 to-black p-5 shadow-[0_0_35px_rgba(6,182,212,0.35)] backdrop-blur-xl">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-mono text-xs font-bold text-cyan-400 flex items-center gap-1">
                  <Sparkles size={13} /> FICHA DE CASILLERO
                </span>
                <span className="font-mono text-xs text-zinc-400">{currentItem.lockerCode}</span>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-400">Preparación</span>
                  <h4 className="font-brand text-base font-bold text-white">{currentItem.name}</h4>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
                  {currentItem.description}
                </p>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>Ubicación:</span>
                    <strong className="text-white">{currentItem.hubName}</strong>
                  </div>
                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>Temperatura:</span>
                    <strong className={currentItem.temp === 'refrigerado' ? 'text-cyan-400' : 'text-amber-400'}>
                      {currentItem.temp === 'refrigerado' ? '❄️ Refrigerado Activo' : '⚡ Temperatura Ambiente'}
                    </strong>
                  </div>
                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>Desbloqueo:</span>
                    <strong className="text-emerald-400">PIN de 4 Dígitos / QR</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 space-y-2">
              <button
                type="button"
                onClick={(e) => handleInstantBuy(e, currentItem)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-amber-500 py-3 font-display text-xs font-bold text-primary-foreground shadow-xl hover:brightness-110 active:scale-95 transition-all"
              >
                <KeyRound size={15} />
                <span>Comprar {money(currentItem.price)} & Generar PIN</span>
              </button>
              <p className="text-center text-[10px] text-zinc-400">
                Toca la tarjeta para volver al frente
              </p>
            </div>
          </div>
        </div>

        {/* Right Dimmed Perspective Card */}
        <div
          onClick={handleNext}
          className="absolute right-2 sm:right-12 z-10 hidden sm:flex h-[360px] w-[240px] cursor-pointer flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/70 p-4 opacity-40 shadow-2xl backdrop-blur-md transition-all duration-500 hover:opacity-75 hover:scale-95"
          style={{
            transform: 'translateX(40px) rotateY(-25deg) scale(0.85)',
          }}
        >
          <img
            src={nextItem.image_url}
            alt={nextItem.name}
            className="h-44 w-full rounded-2xl object-cover grayscale brightness-75"
          />
          <div className="mt-3 space-y-1">
            <span className="font-mono text-[10px] text-zinc-400">{nextItem.lockerCode}</span>
            <p className="font-brand text-xs font-bold text-zinc-300 truncate">{nextItem.name}</p>
            <p className="font-mono text-xs text-primary font-bold">{money(nextItem.price)}</p>
          </div>
        </div>
      </div>

      {/* Kamui-style Sleek Navigation Controls */}
      <div className="mt-6 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={handlePrev}
          className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-zinc-400 hover:text-primary transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Anterior</span>
        </button>

        {/* Pagination Pill Indicators */}
        <div className="flex items-center gap-2">
          {SHOWCASE_ITEMS.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                playKeyBeep(500 + idx * 50)
                setIsFlipped(false)
                setActiveIndex(idx)
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? 'w-8 bg-primary shadow-[0_0_8px_rgba(249,115,22,0.8)]'
                  : 'w-2 bg-zinc-700 hover:bg-zinc-500'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-zinc-400 hover:text-primary transition-colors"
        >
          <span>Siguiente</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
