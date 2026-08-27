type Props = {
  size?: number
  className?: string
}

const bittenBody =
  'M10 4h12a8 8 0 0 1 8 8v8a8 8 0 0 1-8 8H10A8 8 0 0 1 2 20v-8a8 8 0 0 1 8-8Zm6.8-2.4a5.4 5.4 0 1 0 10.8 0 5.4 5.4 0 1 0-10.8 0ZM23.6 7.4a5.8 5.8 0 1 0 11.6 0 5.8 5.8 0 1 0-11.6 0ZM24.9 16.2a5.3 5.3 0 1 0 10.6 0 5.3 5.3 0 1 0-10.6 0Z'

export function BrandMark({ size = 28, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
    >
      <path fill="currentColor" fillRule="evenodd" d={bittenBody} />
      <circle cx="29.2" cy="3.6" r="2" fill="currentColor" />
      <circle cx="31.2" cy="8.4" r="1.15" fill="currentColor" opacity="0.6" />
    </svg>
  )
}
