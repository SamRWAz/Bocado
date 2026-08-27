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

export function MetricsPage() {
  const [metrics, setMetrics] = useState(empty)

  const refresh = useCallback(async () => {
    setMetrics(await fetchMetrics())
  }, [])

  useEffect(() => {
    void refresh()
    const id = setInterval(() => void refresh(), 4000)
    return () => clearInterval(id)
  }, [refresh])

  const cards = [
    { icon: Heart, label: 'Clicks “Lo quiero”', value: metrics.total_intents, sub: 'Deseabilidad' },
    { icon: Package, label: 'Movimientos de inventario', value: metrics.inventory_updates, sub: 'Operación' },
  ]

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold">Métricas del experimento</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <div key={card.label} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <card.icon size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className="font-display text-2xl font-bold">{card.value}</p>
            </div>
            <span className="rounded-full bg-secondary px-2 py-1 text-[10px]">{card.sub}</span>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Percent size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Aceptación de comisión</p>
            <p className="text-xs text-muted-foreground">10 personas encuestadas</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-secondary p-3 text-center">
            <p className="font-display text-2xl font-bold">70%</p>
            <p className="text-[10px] text-muted-foreground">Comisión del 5%</p>
          </div>
          <div className="rounded-lg bg-secondary p-3 text-center">
            <p className="font-display text-2xl font-bold">40%</p>
            <p className="text-[10px] text-muted-foreground">Comisión del 10%</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
        <BarChart3 className="text-primary" />
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">¿Es útil la app?</p>
          <p className="font-display text-2xl font-bold">100%</p>
        </div>
        <span className="rounded-full bg-secondary px-2 py-1 text-[10px]">38 personas</span>
      </div>
    </div>
  )
}
