'use client'

import { useQuoteCalculator } from '@/features/quoteFlow/client/useQuoteCalculator'
import { QuoteResult } from '@/features/quoteFlow/components/QuoteResult'
import type { PublicTenantConfig } from '@/features/tenants/model/tenantConfig'
import { Building2, Check, CircleHelp } from 'lucide-react'
import type { CSSProperties } from 'react'
import { FlowNavigation } from './FlowNavigation'
import { QuoteProgress } from './QuoteProgress'
import { QuoteSummaryAside } from './QuoteSummaryAside'
import { AccessStep } from './steps/AccessStep'
import { ContactStep } from './steps/ContactStep'
import { InventoryStep } from './steps/InventoryStep'
import { MoveStep } from './steps/MoveStep'
import { ReviewStep } from './steps/ReviewStep'
import { ServicesStep } from './steps/ServicesStep'

type QuoteCalculatorProps = {
  locale: string
  mapsEmbedApiKey: string | null
  tenant: PublicTenantConfig
}

export function QuoteCalculator({ locale, mapsEmbedApiKey, tenant }: QuoteCalculatorProps) {
  const calculator = useQuoteCalculator(tenant)
  const { draft, dispatch } = calculator
  const accentStyle = { '--tenant-accent': tenant.branding.accentColor } as CSSProperties

  if (!calculator.isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f4ef]" style={accentStyle}>
        <div className="flex items-center gap-3 text-sm font-semibold text-[#55716c]">
          <span className="size-2 animate-pulse rounded-full bg-[var(--tenant-accent)]" /> Offerte wird vorbereitet …
        </div>
      </div>
    )
  }

  if (draft.currentStep === 'result' && calculator.calculation) {
    return (
      <div className="min-h-screen bg-[#f5f4ef]" style={accentStyle}>
        <QuoteHeader locale={locale} tenant={tenant} />
        <QuoteResult
          calculation={calculator.calculation}
          draft={draft}
          error={calculator.error}
          isUpdating={calculator.isCalculating}
          onRequestConfirmation={calculator.requestConfirmation}
          onReset={calculator.reset}
          onToggleService={calculator.toggleResultService}
          tenant={tenant}
        />
      </div>
    )
  }

  const isFirstStep = draft.currentStep === 'move'
  const isContactStep = draft.currentStep === 'contact'
  const nextLabel = draft.currentStep === 'review' ? 'Zu den Kontaktangaben' : 'Weiter'

  return (
    <div className="min-h-screen bg-[#f5f4ef]" style={accentStyle}>
      <QuoteHeader locale={locale} tenant={tenant} />
      <QuoteProgress currentStep={draft.currentStep} />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 sm:py-11 lg:grid-cols-[minmax(0,1fr)_270px] lg:px-8">
        <main className="min-w-0 rounded-[1.75rem] border border-[#e0e4de] bg-[#fbfbf8] p-5 shadow-[0_20px_55px_rgba(23,60,58,0.06)] sm:p-8 lg:p-10">
          {draft.currentStep === 'move' ? (
            <MoveStep dispatch={dispatch} draft={draft} mapsEmbedApiKey={mapsEmbedApiKey} />
          ) : null}
          {draft.currentStep === 'access' ? <AccessStep dispatch={dispatch} draft={draft} /> : null}
          {draft.currentStep === 'inventory' ? <InventoryStep dispatch={dispatch} draft={draft} /> : null}
          {draft.currentStep === 'services' ? (
            <ServicesStep dispatch={dispatch} draft={draft} services={tenant.services} />
          ) : null}
          {draft.currentStep === 'review' ? (
            <ReviewStep dispatch={dispatch} draft={draft} services={tenant.services} />
          ) : null}
          {draft.currentStep === 'contact' ? (
            <ContactStep
              canCalculate={calculator.canContinue}
              dispatch={dispatch}
              draft={draft}
              error={calculator.error}
              isCalculating={calculator.isCalculating}
              onCalculate={calculator.calculate}
              phoneRequired={tenant.contact.phoneRequired}
            />
          ) : null}

          {!isContactStep ? (
            <FlowNavigation
              canContinue={calculator.canContinue || draft.currentStep === 'services'}
              isFirstStep={isFirstStep}
              nextLabel={nextLabel}
              onBack={calculator.goBack}
              onNext={calculator.goNext}
            />
          ) : (
            <button
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-[#55716c] hover:bg-[#edf1ec]"
              onClick={calculator.goBack}
              type="button"
            >
              Zurück zur Zusammenfassung
            </button>
          )}
        </main>
        <QuoteSummaryAside draft={draft} />
      </div>
    </div>
  )
}

function QuoteHeader({ locale, tenant }: Pick<QuoteCalculatorProps, 'locale' | 'tenant'>) {
  return (
    <header className="bg-[#f5f4ef]">
      <div className="mx-auto flex min-h-20 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#173c3a] text-xs font-extrabold tracking-wide text-white">
            {tenant.branding.initials}
          </span>
          <div>
            <p className="text-sm font-bold text-[#173c3a] sm:text-base">{tenant.branding.name}</p>
            <p className="hidden text-xs text-[#74827e] sm:block">{tenant.branding.promise}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full bg-[#e8eeea] px-3 py-1.5 text-xs font-semibold text-[#59736d] sm:flex">
            <Check className="size-3.5" /> Automatisch gespeichert
          </span>
          <a
            className="flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold text-[#60736e] transition hover:bg-[#e8eeea]"
            href={`/${locale}/${tenant.slug}/portal`}
            title="Unternehmensansicht"
          >
            <Building2 className="size-4" /> <span className="hidden sm:inline">Für Unternehmen</span>
          </a>
          <button
            aria-label="Hilfe"
            className="flex size-10 items-center justify-center rounded-xl text-[#60736e] transition hover:bg-[#e8eeea]"
            type="button"
          >
            <CircleHelp className="size-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
