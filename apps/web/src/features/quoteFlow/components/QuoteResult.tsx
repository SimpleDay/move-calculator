'use client'

import { formatMoneyRappen, type QuoteCalculation } from '@/features/pricing/model'
import type { QuoteDraft } from '@/features/quoteFlow/model'
import type { PublicTenantConfig, ServiceId } from '@/features/tenants/model/tenantConfig'
import {
  BadgeCheck,
  Check,
  Clock3,
  Download,
  MessageSquareText,
  RefreshCcw,
  ShieldCheck,
  Truck,
  UsersRound,
} from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { QuoteAccuracyCard } from './QuoteAccuracyCard'
import { OpenChatButton, QuoteChat } from './QuoteChat'

type QuoteResultProps = {
  calculation: QuoteCalculation
  draft: QuoteDraft
  error: string | null
  isUpdating: boolean
  tenant: PublicTenantConfig
  onRequestConfirmation: () => Promise<void>
  onReset: () => void
  onToggleService: (serviceId: ServiceId) => Promise<void>
}

const statusCopy = {
  calculated: {
    label: 'Automatisch berechnet',
    description: 'Noch nicht durch das Unternehmen bestätigt',
  },
  confirmationRequested: {
    label: 'Bestätigung angefragt',
    description: 'Das Unternehmen prüft Preis und Angaben',
  },
  companyConfirmed: {
    label: 'Vom Unternehmen bestätigt',
    description: 'Preis und Leistungsumfang wurden geprüft',
  },
  companyChanged: {
    label: 'Vom Unternehmen angepasst',
    description: 'Bitte prüfen Sie die aktualisierte Offerte',
  },
  draft: {
    label: 'Entwurf',
    description: 'Die Berechnung ist noch nicht abgeschlossen',
  },
} satisfies Record<QuoteDraft['status'], { label: string; description: string }>

export function QuoteResult({
  calculation,
  draft,
  error,
  isUpdating,
  tenant,
  onRequestConfirmation,
  onReset,
  onToggleService,
}: QuoteResultProps) {
  const [chatOpen, setChatOpen] = useState(false)
  const status = statusCopy[draft.status]
  const selectedServices = tenant.services.filter((service) => draft.selectedServiceIds.includes(service.id))
  const visibleComponents = calculation.components.filter((component) => component.visibleToCustomer)

  return (
    <div className={`quote-result-layout ${chatOpen ? 'quote-result-layout--chat' : ''}`}>
      <main className="min-w-0 transition-all duration-300">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--tenant-accent)]">Ihre Offerte</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#173c3a] sm:text-4xl">
                Bereit zum Prüfen
              </h1>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-[#eaf2ed] px-4 py-2 text-sm font-semibold text-[#315d58]">
              <span className="size-2 rounded-full bg-[#4b8b6f]" /> Entwurf gespeichert
            </div>
          </div>

          <section className="overflow-hidden rounded-[1.75rem] border border-[#d7dfd8] bg-white shadow-[0_22px_60px_rgba(23,60,58,0.09)]">
            <div className="relative overflow-hidden bg-[#173c3a] px-6 py-8 text-white sm:px-9 sm:py-10">
              <div aria-hidden="true" className="route-pattern absolute inset-0 opacity-20" />
              <div className="relative flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                    <ShieldCheck className="size-3.5" /> Unverbindliche Offerte
                  </div>
                  <p className="mt-5 text-sm text-white/65">Gesamtpreis inkl. MWST</p>
                  <p
                    className="mt-1 text-[clamp(2.8rem,10vw,5rem)] font-semibold leading-none tracking-[-0.055em]"
                    data-testid="quote-total"
                  >
                    {formatMoneyRappen(calculation.totalRappen)}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm sm:max-w-xs">
                  <p className="flex items-center gap-2 text-sm font-bold">
                    <BadgeCheck className="size-4" /> {status.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/70">{status.description}</p>
                </div>
              </div>
            </div>

            <div className="grid divide-y divide-[#e5e9e4] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <ResultMetric
                icon={<Clock3 className="size-4" />}
                label="Geschätzte Dauer"
                value={`${Math.round(calculation.estimatedMinutes / 30) / 2} Std.`}
              />
              <ResultMetric
                icon={<UsersRound className="size-4" />}
                label="Zügelteam"
                value={`${calculation.requiredWorkers} Personen`}
              />
              <ResultMetric
                icon={<Truck className="size-4" />}
                label="Fahrzeuge"
                value={
                  calculation.tripsPerVehicle > 1
                    ? `${calculation.requiredVehicles} · max. ${calculation.tripsPerVehicle} Fahrten`
                    : `${calculation.requiredVehicles}`
                }
              />
            </div>
          </section>

          <QuoteAccuracyCard accuracy={calculation.accuracy} />

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-2xl border border-[#dfe4de] bg-white p-5 sm:p-6">
              <h2 className="font-semibold text-[#173c3a]">Im Preis enthalten</h2>
              <div className="mt-4 divide-y divide-[#edf0ec]">
                {visibleComponents.map((component) => (
                  <div className="flex items-start justify-between gap-4 py-3" key={component.id}>
                    <div>
                      <p className="text-sm font-medium text-[#294e49]">{component.customerLabel}</p>
                      <p className="mt-0.5 text-xs leading-5 text-[#7a8884]">{component.explanation}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-[#173c3a]">
                      {formatMoneyRappen(component.amountRappen)}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-[#dfe4de] bg-white p-5 sm:p-6">
              <h2 className="font-semibold text-[#173c3a]">Ihre Leistungen</h2>
              <p className="mt-1 text-sm text-[#74827e]">Änderungen werden sofort neu berechnet.</p>
              <div className="mt-4 space-y-2">
                {tenant.services.map((service) => {
                  const selected = selectedServices.some((candidate) => candidate.id === service.id)
                  return (
                    <button
                      aria-pressed={selected}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left text-sm transition ${
                        selected
                          ? 'border-[#b8cdc3] bg-[#eff5f1] text-[#294e49]'
                          : 'border-[#e0e5df] text-[#71807c] hover:border-[#b8c5bf]'
                      }`}
                      disabled={isUpdating}
                      key={service.id}
                      onClick={() => void onToggleService(service.id)}
                      type="button"
                    >
                      <span className="font-medium">{service.name}</span>
                      <span
                        className={`flex size-5 items-center justify-center rounded-md border ${selected ? 'border-[#4f806e] bg-[#4f806e] text-white' : 'border-[#b9c5bf]'}`}
                      >
                        {selected ? <Check className="size-3.5" /> : null}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          </div>

          <section className="mt-5 rounded-2xl border border-[#dfded5] bg-[#fffdf8] p-5 sm:p-6">
            <h2 className="font-semibold text-[#173c3a]">Wichtige Annahmen</h2>
            <ul className="mt-3 space-y-2 text-sm leading-5 text-[#687873]">
              {calculation.assumptions.map((assumption) => (
                <li className="flex gap-2" key={assumption.id}>
                  <Check className="mt-0.5 size-4 shrink-0 text-[#5e8479]" /> {assumption.text}
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {draft.status === 'calculated' ? (
              <button
                className="min-h-13 inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--tenant-accent)] px-6 text-sm font-bold text-white shadow-[0_10px_26px_color-mix(in_srgb,var(--tenant-accent)_24%,transparent)] transition hover:-translate-y-0.5 hover:brightness-95"
                disabled={isUpdating}
                onClick={() => void onRequestConfirmation()}
                type="button"
              >
                <BadgeCheck className="size-5" /> Preis bestätigen lassen
              </button>
            ) : (
              <div className="min-h-13 flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#e8f2ec] px-6 text-sm font-bold text-[#315f53]">
                <Check className="size-5" /> Anfrage wurde dem Unternehmen übermittelt
              </div>
            )}
            <button
              className="min-h-13 inline-flex items-center justify-center gap-2 rounded-xl border border-[#cbd5cf] bg-white px-5 text-sm font-semibold text-[#3e5f59] hover:border-[#9eafa8]"
              disabled
              title="PDF folgt in der Pilotphase"
              type="button"
            >
              <Download className="size-4" /> PDF
            </button>
            <button
              className="min-h-13 inline-flex items-center justify-center gap-2 rounded-xl border border-[#cbd5cf] bg-white px-5 text-sm font-semibold text-[#3e5f59] hover:border-[#9eafa8]"
              onClick={() => setChatOpen(true)}
              type="button"
            >
              <MessageSquareText className="size-4" /> Frage stellen
            </button>
          </div>

          {error ? (
            <p className="mt-3 rounded-xl border border-[#efc8ba] bg-[#fff5f1] p-3 text-sm font-medium text-[#91452f]">
              {error}
            </p>
          ) : null}

          <button
            className="mx-auto mt-7 flex items-center gap-2 text-xs font-semibold text-[#7a8884] hover:text-[#173c3a]"
            onClick={onReset}
            type="button"
          >
            <RefreshCcw className="size-3.5" /> Neue Offerte starten
          </button>
        </div>
      </main>

      {chatOpen ? (
        <QuoteChat
          calculation={calculation}
          draft={draft}
          isUpdating={isUpdating}
          onClose={() => setChatOpen(false)}
          onToggleService={onToggleService}
          services={tenant.services}
        />
      ) : (
        <OpenChatButton onClick={() => setChatOpen(true)} />
      )}
    </div>
  )
}

function ResultMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 sm:justify-center">
      <span className="flex size-9 items-center justify-center rounded-xl bg-[#edf2ee] text-[#315d58]">{icon}</span>
      <div>
        <p className="text-xs text-[#7a8884]">{label}</p>
        <p className="text-sm font-bold text-[#173c3a]">{value}</p>
      </div>
    </div>
  )
}
