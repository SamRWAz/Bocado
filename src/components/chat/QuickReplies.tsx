import { CAMPUS_QUICK_REPLIES } from '../../lib/chat'

type Props = {
  onSelect: (text: string) => void
  disabled?: boolean
}

export function QuickReplies({ onSelect, disabled }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar">
      {CAMPUS_QUICK_REPLIES.map((item, index) => (
        <button
          key={index}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(item.text)}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-all hover:bg-primary/25 hover:border-primary/40 active:scale-95 disabled:opacity-50"
        >
          <span>{item.icon}</span>
          <span>{item.text}</span>
        </button>
      ))}
    </div>
  )
}
