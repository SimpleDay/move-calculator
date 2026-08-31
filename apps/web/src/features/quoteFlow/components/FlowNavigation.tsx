import { ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react'

type FlowNavigationProps = {
  canContinue: boolean
  isFirstStep: boolean
  isLoading?: boolean
  nextLabel?: string
  onBack: () => void
  onNext: () => void
}

export function FlowNavigation({
  canContinue,
  isFirstStep,
  isLoading,
  nextLabel = 'Weiter',
  onBack,
  onNext,
}: FlowNavigationProps) {
  return (
    <div className="mt-9 flex items-center justify-between gap-4 border-t border-[#e1e5df] pt-6">
      <button
        className="inline-flex min-h-12 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-[#47635f] transition hover:bg-[#edf1ec] disabled:invisible"
        disabled={isFirstStep || isLoading}
        onClick={onBack}
        type="button"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        Zurück
      </button>
      <button
        className="inline-flex min-h-12 min-w-36 items-center justify-center gap-2 rounded-xl bg-[var(--tenant-accent)] px-6 text-sm font-bold text-white shadow-[0_8px_22px_color-mix(in_srgb,var(--tenant-accent)_24%,transparent)] transition hover:-translate-y-0.5 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
        disabled={!canContinue || isLoading}
        onClick={onNext}
        type="button"
      >
        {isLoading ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
        {nextLabel}
        {!isLoading ? <ChevronRight aria-hidden="true" className="size-4" /> : null}
      </button>
    </div>
  )
}
