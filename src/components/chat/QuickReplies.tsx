import { CAMPUS_QUICK_REPLIES } from '../../lib/chat'

type Props = {
  onSelect: (text: string) => void
  disabled?: boolean
}

export function QuickReplies({ onSelect, disabled }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto py-1.5 no-scrollbar">
      {CAMPUS_QUICK_REPLIES.map((item, index) => (
        <button
          key={index}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(item.text)}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-xs font-display font-medium text-foreground transition-all hover:bg-primary/20 hover:border-primary/50 hover:text-primary active:scale-95 disabled:opacity-50 shadow-sm"
        >
          <span>{item.icon}</span>
          <span className="truncate max-w-[220px]">{item.text}</span>
        </button>
      ))}
    </div>
  )
}

