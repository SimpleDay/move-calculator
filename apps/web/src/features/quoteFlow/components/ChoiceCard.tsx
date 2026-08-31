import { cn } from '@/lib/ui'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type ChoiceCardProps = {
  title: string
  description?: string
  icon?: LucideIcon
  meta?: ReactNode
  selected: boolean
  onSelect: () => void
  compact?: boolean
}

export function ChoiceCard({ title, description, icon: Icon, meta, selected, onSelect, compact }: ChoiceCardProps) {
  return (
    <button
      aria-pressed={selected}
      className={cn(
        'focus-visible:ring-3 group relative flex w-full items-start gap-4 rounded-2xl border bg-white text-left transition duration-200 focus-visible:outline-none focus-visible:ring-[color-mix(in_srgb,var(--tenant-accent)_22%,transparent)]',
        compact ? 'p-4' : 'p-5',
        selected
          ? 'border-[var(--tenant-accent)] shadow-[0_8px_26px_rgba(23,60,58,0.08)]'
          : 'border-[#dde3dd] hover:-translate-y-0.5 hover:border-[#b8c5bf] hover:shadow-[0_8px_24px_rgba(23,60,58,0.06)]',
      )}
      onClick={onSelect}
      type="button"
    >
      {Icon ? (
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-xl transition',
            selected ? 'bg-[var(--tenant-accent)] text-white' : 'bg-[#eff3ef] text-[#315d58]',
          )}
        >
          <Icon aria-hidden="true" className="size-5" />
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-3">
          <span className="font-semibold text-[#173c3a]">{title}</span>
          <span
            aria-hidden="true"
            className={cn(
              'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border',
              selected ? 'border-[var(--tenant-accent)] bg-[var(--tenant-accent)]' : 'border-[#b9c5bf]',
            )}
          >
            {selected ? <span className="size-1.5 rounded-full bg-white" /> : null}
          </span>
        </span>
        {description ? <span className="mt-1 block text-sm leading-5 text-[#687873]">{description}</span> : null}
        {meta ? <span className="mt-3 block">{meta}</span> : null}
      </span>
    </button>
  )
}
