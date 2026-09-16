type Props = {
  size?: number
  className?: string
}

export function BrandMark({ size = 32, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Light mode PNG logo */}
      <img
        src="/logo-light.png"
        alt="Bocado Logo"
        width={size}
        height={size}
        className="block dark:hidden h-full w-full object-contain"
        loading="eager"
      />
      {/* Dark mode PNG logo */}
      <img
        src="/logo-dark.png"
        alt="Bocado Logo"
        width={size}
        height={size}
        className="hidden dark:block h-full w-full object-contain"
        loading="eager"
      />
    </span>
  )
}
