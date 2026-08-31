import type { QuoteDraft, QuoteFlowAction, QuoteStepId } from '@/features/quoteFlow/model'
import type { PublicTenantConfig } from '@/features/tenants/model/tenantConfig'
import { Box, CalendarDays, MapPinned, Pencil, ShieldCheck, Sparkles } from 'lucide-react'
import type { Dispatch, ReactNode } from 'react'
import { StepLayout } from '../StepLayout'

type ReviewStepProps = {
  draft: QuoteDraft
  dispatch: Dispatch<QuoteFlowAction>
  services: PublicTenantConfig['services']
}

type SummaryCardProps = {
  icon: ReactNode
  title: string
  value: ReactNode
  onEdit: () => void
}

function SummaryCard({ icon, title, value, onEdit }: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-[#dfe4de] bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#edf2ee] text-[#315d58]">
            {icon}
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#7b8985]">{title}</p>
            <div className="mt-2 text-sm font-medium leading-6 text-[#173c3a]">{value}</div>
          </div>
        </div>
        <button
          aria-label={`${title} bearbeiten`}
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[#71807c] transition hover:bg-[#edf1ec] hover:text-[#173c3a]"
          onClick={onEdit}
          type="button"
        >
          <Pencil className="size-4" />
        </button>
      </div>
    </div>
  )
}

export function ReviewStep({ draft, dispatch, services }: ReviewStepProps) {
  const edit = (step: QuoteStepId) => dispatch({ type: 'goToStep', step })
  const selectedServices = services.filter((service) => draft.selectedServiceIds.includes(service.id))

  return (
    <StepLayout
      description="Kontrollieren Sie die kalkulationsrelevanten Angaben. Noch wird kein Preis angezeigt."
      eyebrow="Schritt 5 von 6"
      title="Passt alles für Ihre Offerte?"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <SummaryCard
          icon={<MapPinned className="size-4" />}
          onEdit={() => edit('move')}
          title="Route"
          value={
            <>
              <span className="block">{draft.fromAddress}</span>
              <span className="block text-[#7a8884]">
                nach {draft.toAddress} · {draft.distanceKm} km
              </span>
            </>
          }
        />
        <SummaryCard
          icon={<CalendarDays className="size-4" />}
          onEdit={() => edit('move')}
          title="Termin"
          value={
            <>
              {new Intl.DateTimeFormat('de-CH', { dateStyle: 'long' }).format(new Date(`${draft.moveDate}T12:00:00`))}
              {draft.dateFlexible ? <span className="block text-[#658079]">Flexibel</span> : null}
            </>
          }
        />
        <SummaryCard
          icon={<Box className="size-4" />}
          onEdit={() => edit('inventory')}
          title="Inventar"
          value={`${draft.volumeM3} m³ · ${draft.rooms} Zimmer · ca. ${draft.boxes} Kartons`}
        />
        <SummaryCard
          icon={<Sparkles className="size-4" />}
          onEdit={() => edit('services')}
          title="Leistungen"
          value={
            selectedServices.length > 0
              ? selectedServices.map((service) => service.name).join(', ')
              : 'Nur Zügeltransport'
          }
        />
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-4 rounded-2xl border border-[#cfdbd4] bg-[#f0f5f1] p-5">
        <input
          checked={draft.customerAttestation}
          className="mt-1 size-5 shrink-0 accent-[var(--tenant-accent)]"
          onChange={(event) => dispatch({ type: 'setCustomerAttestation', value: event.target.checked })}
          type="checkbox"
        />
        <span>
          <span className="flex items-center gap-2 font-semibold text-[#173c3a]">
            <ShieldCheck className="size-4 text-[#4f766e]" /> Meine Angaben sind vollständig
          </span>
          <span className="mt-1 block text-sm leading-5 text-[#667772]">
            Keller, Estrich, Balkon, Schrankinhalte und Spezialgegenstände sind berücksichtigt.
          </span>
        </span>
      </label>
    </StepLayout>
  )
}
