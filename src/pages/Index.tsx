import { useState } from 'react'
import { BarChart3, ShoppingBag, Store } from 'lucide-react'
import { BuyView } from '../components/BuyView'
import { MetricsView } from '../components/MetricsView'
import { SellView } from '../components/SellView'
import type { TabId } from '../types'

const tabs: { id: TabId; label: string; icon: typeof ShoppingBag }[] = [
  { id: 'comprar', label: 'Comprar', icon: ShoppingBag },
  { id: 'vender', label: 'Vender', icon: Store },
  { id: 'metricas', label: 'Métricas', icon: BarChart3 },
]

export function IndexPage() {
  const [tab, setTab] = useState<TabId>('comprar')

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border px-4 pt-4 pb-3">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-2xl">🍿</span>
            <h1 className="font-display font-bold text-foreground text-2xl tracking-tight">
              Bocado
            </h1>
          </div>
          <p className="text-center text-xs text-muted-foreground mb-3">
            El mecato de tu campus, en un solo lugar
          </p>
          <nav className="flex bg-secondary rounded-lg p-1 gap-1">
            {tabs.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-md text-sm font-display font-medium transition-all ${
                  tab === item.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </nav>
        </header>
        <main className="flex-1 px-4 py-4">
          {tab === 'comprar' && <BuyView />}
          {tab === 'vender' && <SellView />}
          {tab === 'metricas' && <MetricsView />}
        </main>
        <footer className="text-center py-4 text-[10px] text-muted-foreground">
          Bocado MVP — Validación de concepto 🚀
        </footer>
      </div>
    </div>
  )
}
