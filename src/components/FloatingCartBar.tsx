import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Bike, BookmarkCheck } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { money } from '../lib/format'
import { playKeyBeep } from '../lib/sounds'

export function FloatingCartBar() {
  const { count, total } = useCart()
  const location = useLocation()

  // Hide on cart, checkout or auth pages
  const isHidden =
    count === 0 ||
    location.pathname === '/carrito' ||
    location.pathname === '/checkout' ||
    location.pathname === '/login' ||
    location.pathname === '/registro'

  return (
    <AnimatePresence>
      {!isHidden && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-lg"
        >
          <div className="flex items-center justify-between rounded-2xl border-2 border-primary/30 bg-[#8F1414] text-white p-3 sm:p-3.5 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white font-bold">
                <BookmarkCheck size={20} />
                <motion.span
                  key={count}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-black text-black shadow-xs"
                >
                  {count}
                </motion.span>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-red-100">
                  <Bike size={12} />
                  <span>Domicilio Campus: $200 COP</span>
                </div>
                <p className="font-display font-black text-sm sm:text-base leading-none">
                  {money(total)}
                  <span className="text-xs font-normal text-red-200 ml-1.5">
                    ({count} {count === 1 ? 'snack' : 'snacks'})
                  </span>
                </p>
              </div>
            </div>

            <Link
              to="/carrito"
              onClick={() => playKeyBeep(850)}
              className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 font-display text-xs font-black text-[#8F1414] shadow-md hover:bg-neutral-100 active:scale-95 transition-all"
            >
              <span>Ver Carrito</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
