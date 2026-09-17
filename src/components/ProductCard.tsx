import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Flame,
  Lock,
  LockOpen,
  MessageCircle,
  ShoppingBag,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { displaySeller, money, ownsListing, parseTags, sellerUserId } from '../lib/format'
import { playKeyBeep, playLockerUnlock } from '../lib/sounds'
import type { Product } from '../types'
import { TagList } from './TagList'

type Props = {
  product: Product
  onAdd: (product: Product) => void
}

export function ProductCard({ product, onAdd }: Props) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [doorOpen, setDoorOpen] = useState(false)

  const sellerId = sellerUserId(product.seller)
  const sellerName = displaySeller(product.seller)
  const isMyProduct = user ? ownsListing(product.seller, user.id, user.name) : false

  const handleStartChat = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    playKeyBeep(600)
    if (!user) {
      navigate('/login', { state: { from: `/catalogo` } })
      return
    }
    if (isMyProduct) {
      navigate('/vender')
      return
    }
    navigate(
      `/mensajes?partnerId=${encodeURIComponent(sellerId)}&partnerName=${encodeURIComponent(
        sellerName,
      )}&productId=${encodeURIComponent(product.id)}&productName=${encodeURIComponent(product.name)}`,
    )
  }

  const handleToggleDoor = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!doorOpen) {
      playLockerUnlock()
      setDoorOpen(true)
    } else {
      playKeyBeep(450)
      setDoorOpen(false)
    }
  }

  const isLowStock = product.stock > 0 && product.stock <= 3
  const lockerSlot = product.lockerNumber || '01'

  // Map product image to anime stylized assets if it's default or placeholder
  const displayImage = (() => {
    if (!product.image_url) return '/images/snack_anime_brownie.jpg'
    const nameLower = product.name.toLowerCase()
    if (nameLower.includes('brownie')) return '/images/snack_anime_brownie.jpg'
    if (nameLower.includes('parfait') || nameLower.includes('yogur') || nameLower.includes('chia')) {
      return '/images/snack_anime_parfait.jpg'
    }
    if (nameLower.includes('empanada')) return '/images/snack_anime_empanadas.jpg'
    if (nameLower.includes('galleta') || nameLower.includes('cookie') || nameLower.includes('avena')) {
      return '/images/snack_anime_cookies.jpg'
    }
    return product.image_url
  })()

  return (
    <article
      onMouseEnter={() => {
        if (!doorOpen) {
          playKeyBeep(520)
          setDoorOpen(true)
        }
      }}
      onMouseLeave={() => {
        if (doorOpen) setDoorOpen(false)
      }}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black p-4 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-primary/60 hover:shadow-[0_0_30px_rgba(249,115,22,0.25)]"
    >
      {/* Top Locker Status Bar with LED */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-emerald-400">SLOT #{lockerSlot}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-zinc-400 border border-white/5">
            Campus 24/7
          </span>
          <button
            type="button"
            onClick={handleStartChat}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-zinc-400 hover:text-primary hover:bg-primary/20 transition-colors"
            title={`Chat con ${sellerName}`}
          >
            <MessageCircle size={13} />
          </button>
        </div>
      </div>

      {/* 3D Smart Locker Vault with Opening Glass Window Door */}
      <div className="locker-vault-perspective relative h-56 w-full overflow-hidden rounded-2xl bg-zinc-950 border border-white/10">
        {/* Interior Chamber (Inside the locker) */}
        <div className="absolute inset-0 flex items-center justify-center p-2 bg-gradient-to-t from-black via-zinc-950 to-zinc-900">
          {/* Spotlight light ray */}
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-20 w-32 bg-primary/20 blur-xl" />

          <img
            src={displayImage}
            alt={product.name}
            className="h-full w-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {isLowStock && (
            <span className="absolute bottom-2 left-2 rounded-lg bg-rose-500/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-md backdrop-blur-sm animate-pulse flex items-center gap-1">
              <Flame size={11} /> ¡Solo {product.stock}!
            </span>
          )}
        </div>

        {/* 3D Smart Glass Window Door (Swings open on left hinge) */}
        <div
          onClick={handleToggleDoor}
          className={`locker-door absolute inset-0 cursor-pointer rounded-2xl border-2 transition-all duration-700 ${
            doorOpen
              ? 'is-open border-emerald-500/80 bg-emerald-950/20'
              : 'border-cyan-500/40 bg-slate-900/60 backdrop-blur-[2px] shadow-inner hover:border-cyan-400'
          }`}
        >
          {/* Glass Window Tint & Grid Reflection Overlay */}
          {!doorOpen ? (
            <div className="flex h-full w-full flex-col justify-between p-3 bg-gradient-to-tr from-cyan-950/40 via-transparent to-white/10">
              <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300">
                <span className="flex items-center gap-1">
                  <Lock size={12} className="text-cyan-400" /> VENTANA SEGURA
                </span>
                <span className="text-[9px] opacity-75">NFC / PIN</span>
              </div>

              {/* Center Touch To Open Badge */}
              <div className="mx-auto rounded-xl bg-black/75 px-3 py-1.5 text-center backdrop-blur-md border border-cyan-400/30 shadow-lg">
                <p className="text-[10px] font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                  <Sparkles size={11} className="text-primary animate-spin" />
                  <span>Pasa el cursor para abrir</span>
                </p>
              </div>

              <div className="text-[9px] font-mono text-zinc-400 flex justify-between">
                <span>SENSOR ACTIVO</span>
                <span>DESBLOQUEO AUTOMÁTICO</span>
              </div>
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center p-2 text-center font-mono text-[10px] font-bold text-emerald-400">
              <LockOpen size={18} className="animate-bounce" />
            </div>
          )}
        </div>
      </div>

      {/* Card Details & Instant Cart Action */}
      <div className="mt-4 flex flex-1 flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="truncate">Cocinero: {sellerName}</span>
          </div>

          <Link to={`/producto/${product.id}`} className="hover:text-primary transition-colors">
            <h3 className="font-brand text-base font-bold text-foreground line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <div className="mt-2">
            <TagList tags={parseTags(product.category)} size="sm" />
          </div>
        </div>

        {/* Price and Cart Button */}
        <div className="pt-3 flex items-center justify-between border-t border-white/10">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-mono block">
              Precio
            </span>
            <p className="font-mono text-lg font-black text-primary">{money(product.price)}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              playLockerUnlock()
              onAdd(product)
            }}
            disabled={product.sold_out || product.stock <= 0}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-amber-500 px-4 py-2.5 font-display text-xs font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all"
          >
            <ShoppingBag size={14} />
            <span>{product.sold_out ? 'Agotado' : 'Apartar & Retirar'}</span>
          </button>
        </div>
      </div>
    </article>
  )
}
