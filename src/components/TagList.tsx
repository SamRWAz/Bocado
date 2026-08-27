type Props = {
  tags: string[]
  size?: 'sm' | 'md'
}

export function TagList({ tags, size = 'sm' }: Props) {
  if (tags.length === 0) return null

  const pill =
    size === 'md'
      ? 'rounded-full bg-secondary px-3 py-1 text-xs font-display font-semibold'
      : 'rounded-full bg-secondary px-2 py-0.5 text-[10px] font-display font-semibold'

  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {tags.map((tag) => (
        <span key={tag} className={pill}>
          {tag}
        </span>
      ))}
    </div>
  )
}
