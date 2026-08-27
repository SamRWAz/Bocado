import { useCallback, useEffect, useState } from 'react'
import { BarChart3, Heart, Package, Percent } from 'lucide-react'
import { fetchMetrics } from '../lib/api'
import type { Metrics } from '../types'

const empty: Omit<Metrics, 'id'> = {
  total_intents: 0,
  inventory_updates: 0,
  commission_accepted: 0,
  commission_rejected: 0,
  useful_yes: 0,
  useful_no: 0,
}

export function MetricsView() {
  const [metrics, setMetrics] = useState(empty)

  const refresh = useCallback(async () => {
    setMetrics(await fetchMetrics())
  }, [])

  useEffect(() => {
    void refresh()
    const id = setInterval(() => void refresh(), 3000)
    return () => clearInterval(id)
  }, [refresh])

  const cards = [
    {
      icon: Heart,
      label: 'Clicks "Lo quiero"',
      value: metrics.total_intents,
      sub: 'Deseabilidad',
    },
    {
      icon: Package,
      label: 'Actualizaciones inventario',
      value: metrics.inventory_updates,
      sub: 'Operación',
    },
  ]

  return (
    <div className="space-y-3">
      <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
        <BarChart3 size={18} className="text-primary" /> Métricas de Experimento
      </h3>

      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-card rounded-lg p-4 border border-border flex items-center gap-3 sm:gap-4"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <card.icon size={20} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">{card.label}</p>
            <p className="font-display font-bold text-foreground text-2xl">{card.value}</p>
          </div>
          <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-1 rounded-full shrink-0">
            {card.sub}
          </span>
        </div>
      ))}

      <div className="bg-card rounded-lg p-4 border border-border space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Percent size={20} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Aceptación de comisión</p>
            <p className="text-xs text-muted-foreground">10 personas encuestadas</p>
          </div>
          <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-1 rounded-full shrink-0">
            Viabilidad
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary rounded-lg p-3 text-center">
            <p className="font-display font-bold text-foreground text-2xl">70%</p>
            <p className="text-[10px] text-muted-foreground mt-1">Comisión del 5%</p>
          </div>
          <div className="bg-secondary rounded-lg p-3 text-center">
            <p className="font-display font-bold text-foreground text-2xl">40%</p>
            <p className="text-[10px] text-muted-foreground mt-1">Comisión del 10%</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg p-4 border border-border flex items-center gap-3 sm:gap-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <BarChart3 size={20} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">¿Es útil la app?</p>
          <p className="font-display font-bold text-foreground text-2xl">100%</p>
        </div>
        <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-1 rounded-full shrink-0">
          38 personas
        </span>
      </div>
    </div>
  )
}
