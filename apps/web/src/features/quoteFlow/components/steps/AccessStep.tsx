import type { AccessDraft, QuoteDraft, QuoteFlowAction } from '@/features/quoteFlow/model'
import { ArrowDownToLine, ArrowUpFromLine, Check, Footprints, Warehouse } from 'lucide-react'
import type { Dispatch } from 'react'
import { SelectInput } from '../FormControls'
import { StepLayout } from '../StepLayout'

type AccessStepProps = {
  draft: QuoteDraft
  dispatch: Dispatch<QuoteFlowAction>
}

const floorOptions = [
  { value: -1, label: 'Untergeschoss' },
  { value: 0, label: 'Erdgeschoss' },
  ...Array.from({ length: 10 }, (_, index) => ({ value: index + 1, label: `${index + 1}. Etage` })),
]

const carryDistances = [10, 25, 50, 80]

type AccessCardProps = {
  access: AccessDraft
  location: 'from' | 'to'
  title: string
  subtitle: string
  dispatch: Dispatch<QuoteFlowAction>
}

function AccessCard({ access, location, title, subtitle, dispatch }: AccessCardProps) {
  return (
    <div className="rounded-2xl border border-[#dfe4de] bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-[#edf2ee] text-[#315d58]">
          {location === 'from' ? <ArrowUpFromLine className="size-5" /> : <ArrowDownToLine className="size-5" />}
        </span>
        <div>
          <h2 className="font-semibold text-[#173c3a]">{title}</h2>
          <p className="line-clamp-1 text-sm text-[#778581]">{subtitle || 'Adresse noch offen'}</p>
        </div>
      </div>

      <label className="text-sm font-semibold text-[#173c3a]" htmlFor={`${location}-floor`}>
        Auf welcher Etage?
      </label>
      <SelectInput
        className="mt-2"
        id={`${location}-floor`}
        onChange={(event) =>
          dispatch({
            type: 'setAccess',
            location,
            value: { floor: event.target.value === '' ? null : Number(event.target.value) },
          })
        }
        value={access.floor ?? ''}
      >
        <option value="">Bitte wählen</option>
        {floorOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectInput>

      {access.floor !== null && access.floor > 0 ? (
        <div className="mt-6">
          <p className="mb-2 text-sm font-semibold text-[#173c3a]">Ist ein nutzbarer Lift vorhanden?</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              { value: 'large' as const, label: 'Ja, gross' },
              { value: 'small' as const, label: 'Ja, klein' },
              { value: 'none' as const, label: 'Nein' },
            ].map((option) => (
              <button
                aria-pressed={access.lift === option.value}
                className={`min-h-11 rounded-xl border px-3 text-sm font-semibold transition ${
                  access.lift === option.value
                    ? 'border-[var(--tenant-accent)] bg-[color-mix(in_srgb,var(--tenant-accent)_8%,white)] text-[#173c3a]'
                    : 'border-[#dce2dc] bg-white text-[#60706c] hover:border-[#aebdb7]'
                }`}
                key={option.value}
                onClick={() => dispatch({ type: 'setAccess', location, value: { lift: option.value } })}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ) : access.floor !== null ? (
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#edf4ef] p-3 text-sm text-[#3f685f]">
          <Check aria-hidden="true" className="size-4" /> Kein Lift nötig
        </div>
      ) : null}

      <div className="mt-6">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#173c3a]">
          <Footprints aria-hidden="true" className="size-4 text-[#71807c]" /> Tragweg bis zum Eingang
        </div>
        <div className="grid grid-cols-4 gap-2">
          {carryDistances.map((distance) => (
            <button
              aria-pressed={access.carryDistanceM === distance}
              className={`min-h-11 rounded-xl border text-sm font-semibold transition ${
                access.carryDistanceM === distance
                  ? 'border-[var(--tenant-accent)] bg-[color-mix(in_srgb,var(--tenant-accent)_8%,white)] text-[#173c3a]'
                  : 'border-[#dce2dc] text-[#60706c] hover:border-[#aebdb7]'
              }`}
              key={distance}
              onClick={() => dispatch({ type: 'setAccess', location, value: { carryDistanceM: distance } })}
              type="button"
            >
              {distance} m{distance === 80 ? '+' : ''}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AccessStep({ draft, dispatch }: AccessStepProps) {
  return (
    <StepLayout
      aside={
        <span className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-[#eaf0ec] text-[#315d58] sm:flex">
          <Warehouse className="size-5" />
        </span>
      }
      description="Etage, Lift und Tragweg beeinflussen den Zeitaufwand deutlich. Wir fragen nur nach dem, was wirklich zählt."
      eyebrow="Schritt 2 von 6"
      title="Wie gut sind beide Zugänge?"
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <AccessCard
          access={draft.fromAccess}
          dispatch={dispatch}
          location="from"
          subtitle={draft.fromAddress}
          title="Am Start"
        />
        <AccessCard
          access={draft.toAccess}
          dispatch={dispatch}
          location="to"
          subtitle={draft.toAddress}
          title="Am Ziel"
        />
      </div>
    </StepLayout>
  )
}
