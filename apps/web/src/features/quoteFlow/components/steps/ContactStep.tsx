import type { QuoteDraft, QuoteFlowAction } from '@/features/quoteFlow/model'
import { LockKeyhole, Mail, Phone, UserRound } from 'lucide-react'
import type { Dispatch, FormEvent } from 'react'
import { Field, TextInput } from '../FormControls'
import { StepLayout } from '../StepLayout'

type ContactStepProps = {
  draft: QuoteDraft
  dispatch: Dispatch<QuoteFlowAction>
  error: string | null
  canCalculate: boolean
  isCalculating: boolean
  phoneRequired: boolean
  onCalculate: () => Promise<void>
}

export function ContactStep({
  draft,
  dispatch,
  error,
  canCalculate,
  isCalculating,
  phoneRequired,
  onCalculate,
}: ContactStepProps) {
  const submit = (event: FormEvent) => {
    event.preventDefault()
    void onCalculate()
  }

  return (
    <StepLayout
      aside={
        <span className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-[#eaf0ec] text-[#315d58] sm:flex">
          <LockKeyhole className="size-5" />
        </span>
      }
      description="Damit Sie Ihre Berechnung wiederfinden und das Unternehmen Rückfragen klären kann. Direkt danach sehen Sie den Preis."
      eyebrow="Letzter Schritt"
      title="Wohin dürfen wir Ihre Offerte senden?"
    >
      <form className="rounded-2xl border border-[#dfe4de] bg-white p-5 sm:p-7" onSubmit={submit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field htmlFor="first-name" label="Vorname">
            <div className="relative">
              <UserRound className="absolute left-4 top-3.5 size-5 text-[#82908c]" />
              <TextInput
                autoComplete="given-name"
                className="pl-11"
                id="first-name"
                onChange={(event) => dispatch({ type: 'setContact', value: { firstName: event.target.value } })}
                value={draft.contact.firstName}
              />
            </div>
          </Field>
          <Field htmlFor="last-name" label="Nachname">
            <TextInput
              autoComplete="family-name"
              id="last-name"
              onChange={(event) => dispatch({ type: 'setContact', value: { lastName: event.target.value } })}
              value={draft.contact.lastName}
            />
          </Field>
          <Field htmlFor="email" label="E-Mail">
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 size-5 text-[#82908c]" />
              <TextInput
                autoComplete="email"
                className="pl-11"
                id="email"
                inputMode="email"
                onChange={(event) => dispatch({ type: 'setContact', value: { email: event.target.value } })}
                type="email"
                value={draft.contact.email}
              />
            </div>
          </Field>
          <Field htmlFor="phone" label="Telefon" optional={!phoneRequired}>
            <div className="relative">
              <Phone className="absolute left-4 top-3.5 size-5 text-[#82908c]" />
              <TextInput
                autoComplete="tel"
                className="pl-11"
                id="phone"
                inputMode="tel"
                onChange={(event) => dispatch({ type: 'setContact', value: { phone: event.target.value } })}
                type="tel"
                value={draft.contact.phone}
              />
            </div>
          </Field>
        </div>

        <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl bg-[#f4f6f2] p-4 text-sm leading-5 text-[#586c67]">
          <input
            checked={draft.contact.contactConsent}
            className="mt-0.5 size-4 shrink-0 accent-[var(--tenant-accent)]"
            onChange={(event) => dispatch({ type: 'setContact', value: { contactConsent: event.target.checked } })}
            type="checkbox"
          />
          <span>
            Ich bin einverstanden, dass das Zügelunternehmen mich zu dieser Anfrage kontaktiert. Die Angaben werden nur
            für die Offerte verwendet.
          </span>
        </label>

        {error ? <p className="mt-4 rounded-xl bg-[#fff0eb] p-3 text-sm text-[#9a4329]">{error}</p> : null}

        <button
          className="min-h-13 mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--tenant-accent)] px-6 text-base font-bold text-white shadow-[0_10px_26px_color-mix(in_srgb,var(--tenant-accent)_24%,transparent)] transition hover:-translate-y-0.5 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-45"
          disabled={!canCalculate || isCalculating}
          type="submit"
        >
          {isCalculating ? 'Offerte wird berechnet …' : 'Meine unverbindliche Offerte anzeigen'}
        </button>
        <p className="mt-3 text-center text-xs text-[#7a8884]">Kostenlos · unverbindlich · Preis sofort sichtbar</p>
      </form>
    </StepLayout>
  )
}
