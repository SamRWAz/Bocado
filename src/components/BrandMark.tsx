import { Utensils } from 'lucide-react'

type Props = {
  size?: 'sm' | 'md' | 'lg'
  showBadge?: boolean
}

export function BrandMark({ size = 'md', showBadge = true }: Props) {
  const sizeMap = {
    sm: { box: 'h-8 w-8', icon: 16, text: 'text-lg' },
    md: { box: 'h-9 w-9', icon: 18, text: 'text-xl' },
    lg: { box: 'h-11 w-11', icon: 22, text: 'text-2xl' },
  }

  const current = sizeMap[size]

  return (
    <div className="flex items-center gap-2.5 select-none group cursor-pointer" title="Bocado">
      <div
        className={`${current.box} rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-display font-black shadow-xs transition-transform group-hover:scale-105`}
      >
        <Utensils size={current.icon} />
      </div>

      {showBadge && (
        <span className={`font-display font-black tracking-tight text-foreground ${current.text} group-hover:text-primary transition-colors`}>
          Bocado
        </span>
      )}
    </div>
  )
}
