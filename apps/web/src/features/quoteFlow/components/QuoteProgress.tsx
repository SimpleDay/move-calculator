import { Check } from 'lucide-react'
import type { QuoteStepId } from '../model'

const steps = [
  { id: 'move', label: 'Umzug' },
  { id: 'access', label: 'Zugang' },
  { id: 'inventory', label: 'Inventar' },
  { id: 'services', label: 'Leistungen' },
  { id: 'review', label: 'Prüfen' },
  { id: 'contact', label: 'Offerte' },
] as const

type QuoteProgressProps = {
  currentStep: QuoteStepId
}

export function QuoteProgress({ currentStep }: QuoteProgressProps) {
  const currentIndex = currentStep === 'result' ? steps.length : steps.findIndex((step) => step.id === currentStep)

  return (
    <nav aria-label="Fortschritt" className="border-y border-[#e5e8e2] bg-white/75">
      <ol className="mx-auto flex max-w-6xl items-center overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
        {steps.map((step, index) => {
          const isComplete = index < currentIndex
          const isCurrent = index === currentIndex
          return (
            <li className="flex min-w-0 flex-1 items-center" key={step.id}>
              <div className="flex shrink-0 items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className={`flex size-7 items-center justify-center rounded-full text-xs font-bold transition ${
                    isComplete
                      ? 'bg-[#173c3a] text-white'
                      : isCurrent
                        ? 'bg-[var(--tenant-accent)] text-white ring-4 ring-[color-mix(in_srgb,var(--tenant-accent)_12%,transparent)]'
                        : 'bg-[#edf1ec] text-[#7c8985]'
                  }`}
                >
                  {isComplete ? <Check className="size-3.5" /> : index + 1}
                </span>
                <span
                  className={`hidden text-xs font-semibold md:block ${isCurrent ? 'text-[#173c3a]' : 'text-[#7a8884]'}`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 ? (
                <span className={`mx-3 h-px min-w-3 flex-1 ${isComplete ? 'bg-[#6c8b84]' : 'bg-[#dce2dc]'}`} />
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
