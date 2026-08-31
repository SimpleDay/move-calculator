import type { QuoteDraft, QuoteFlowAction } from '@/features/quoteFlow/model'
import type { PublicTenantConfig } from '@/features/tenants/model/tenantConfig'
import { Check, PackageCheck } from 'lucide-react'
import type { Dispatch } from 'react'
import { StepLayout } from '../StepLayout'

type ServicesStepProps = {
  draft: QuoteDraft
  dispatch: Dispatch<QuoteFlowAction>
  services: PublicTenantConfig['services']
}

export function ServicesStep({ draft, dispatch, services }: ServicesStepProps) {
  return (
    <StepLayout
      aside={
        <span className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-[#eaf0ec] text-[#315d58] sm:flex">
          <PackageCheck className="size-5" />
        </span>
      }
      description="Wählen Sie nur, was Sie brauchen. Der konkrete Leistungsumfang bleibt in Ihrer Offerte nachvollziehbar."
      eyebrow="Schritt 4 von 6"
      title="Was dürfen wir zusätzlich übernehmen?"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {services.map((service) => {
          const selected = draft.selectedServiceIds.includes(service.id)
          return (
            <button
              aria-pressed={selected}
              className={`flex min-h-32 items-start gap-4 rounded-2xl border bg-white p-5 text-left transition ${
                selected
                  ? 'border-[var(--tenant-accent)] shadow-[0_8px_24px_rgba(23,60,58,0.07)]'
                  : 'border-[#dfe4de] hover:border-[#b8c5bf]'
              }`}
              key={service.id}
              onClick={() => dispatch({ type: 'toggleService', serviceId: service.id })}
              type="button"
            >
              <span
                className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg border ${
                  selected ? 'border-[var(--tenant-accent)] bg-[var(--tenant-accent)] text-white' : 'border-[#b8c4be]'
                }`}
              >
                {selected ? <Check className="size-4" /> : null}
              </span>
              <span>
                <span className="font-semibold text-[#173c3a]">{service.name}</span>
                <span className="mt-1.5 block text-sm leading-5 text-[#6f7e79]">{service.description}</span>
              </span>
            </button>
          )
        })}
      </div>
      <button
        className="mt-5 text-sm font-semibold text-[#55716c] underline decoration-[#aebbb6] underline-offset-4 hover:text-[#173c3a]"
        onClick={() => dispatch({ type: 'markServicesReviewed' })}
        type="button"
      >
        Keine Zusatzleistung nötig
      </button>
    </StepLayout>
  )
}
