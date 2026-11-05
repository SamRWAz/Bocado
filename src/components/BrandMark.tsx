import { Sparkles } from 'lucide-react'

type Props = {
  size?: 'sm' | 'md' | 'lg'
  showBadge?: boolean
}

export function BrandMark({ size = 'md', showBadge = true }: Props) {
  const sizeMap = {
    sm: { box: 'h-8 w-8', icon: 15, text: 'text-xl' },
    md: { box: 'h-9 w-9', icon: 17, text: 'text-2xl' },
    lg: { box: 'h-11 w-11', icon: 20, text: 'text-3xl' },
  }

  const current = sizeMap[size]

  return (
    <div className="flex items-center gap-2 select-none group cursor-pointer" title="Bocado">
      <div
        className={`${current.box} rounded-full bg-[#B8385E] text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 shrink-0`}
      >
        <Sparkles size={current.icon} className="text-white" />
      </div>

      {showBadge && (
        <span className={`font-display font-black tracking-tight text-[#1E0C30] dark:text-white ${current.text} leading-none`}>
          bocado<span className="text-[#D94668]">.</span>
        </span>
      )}
    </div>
  )
}
