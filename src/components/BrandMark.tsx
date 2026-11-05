function StarSparkleIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 2C12.4 7.2 16.8 11.6 22 12C16.8 12.4 12.4 16.8 12 22C11.6 16.8 7.2 12.4 2 12C7.2 11.6 11.6 7.2 12 2Z" />
      <circle cx="19" cy="5" r="1.5" />
    </svg>
  )
}

type Props = {
  size?: 'sm' | 'md' | 'lg'
  showBadge?: boolean
}

export function BrandMark({ size = 'md', showBadge = true }: Props) {
  const sizeMap = {
    sm: { box: 'h-8 w-8', icon: 16, text: 'text-xl' },
    md: { box: 'h-9 w-9', icon: 18, text: 'text-2xl' },
    lg: { box: 'h-11 w-11', icon: 22, text: 'text-3xl' },
  }

  const current = sizeMap[size]

  return (
    <div className="flex items-center gap-2.5 select-none group cursor-pointer" title="bocado.">
      <div
        className={`${current.box} rounded-full bg-[#B8385E] text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 shrink-0`}
      >
        <StarSparkleIcon size={current.icon} className="text-white" />
      </div>

      {showBadge && (
        <span className={`font-display font-black tracking-tight text-[#1E0C30] dark:text-white ${current.text} leading-none`}>
          bocado <span className="text-[#B8385E]">.</span>
        </span>
      )}
    </div>
  )
}
