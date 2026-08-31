'use client'

import { PricingConfigurator } from '@/features/pricing/components/PricingConfigurator'
import { formatMoneyRappen } from '@/features/pricing/model'
import type { PricingConfiguration } from '@/features/pricing/model/pricingConfiguration'
import {
  confirmPortalQuote,
  fetchPortalOverview,
  publishPortalPricing,
  savePortalPricing,
  type PortalOverview,
} from '@/features/quotes/client/portalApi'
import type { QuoteRecord } from '@/features/quotes/model/quoteRecord'
import type { PublicTenantConfig } from '@/features/tenants/model/tenantConfig'
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Clock3,
  FileCheck2,
  Inbox,
  MapPinned,
  SlidersHorizontal,
  UsersRound,
} from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

type TenantPortalProps = {
  locale: string
  tenant: PublicTenantConfig
}

type PortalView = 'pricing' | 'quotes'

const portalStatusCopy = {
  draft: 'Entwurf',
  calculated: 'Neu berechnet',
  confirmationRequested: 'Bestätigung angefragt',
  companyConfirmed: 'Bestätigt',
  companyChanged: 'Angepasst',
} satisfies Record<QuoteRecord['draft']['status'], string>

export function TenantPortal({ locale, tenant }: TenantPortalProps) {
  const [overview, setOverview] = useState<PortalOverview | null>(null)
  const [configuration, setConfiguration] = useState<PricingConfiguration | null>(null)
  const [view, setView] = useState<PortalView>('quotes')
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const accentStyle = { '--tenant-accent': tenant.branding.accentColor } as CSSProperties

  const refresh = useCallback(async () => {
    setError(null)
    try {
      const nextOverview = await fetchPortalOverview(tenant.slug)
      setOverview(nextOverview)
      setConfiguration({ settings: nextOverview.pricing.settings, services: nextOverview.pricing.services })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Das Portal konnte nicht geladen werden.')
    }
  }, [tenant.slug])

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0)
    return () => window.clearTimeout(timer)
  }, [refresh])

  const metrics = useMemo(() => {
    const quotes = overview?.quotes ?? []
    const confirmations = quotes.filter((quote) => quote.draft.status === 'confirmationRequested')
    return {
      quoteCount: quotes.length,
      confirmationCount: confirmations.length,
      potentialRappen: quotes.reduce((sum, quote) => sum + quote.calculation.totalRappen, 0),
    }
  }, [overview?.quotes])

  const confirmQuote = async (quoteId: string) => {
    setError(null)
    try {
      await confirmPortalQuote(tenant.slug, quoteId)
      await refresh()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Die Offerte konnte nicht bestätigt werden.')
    }
  }

  const savePricing = async () => {
    if (!configuration || !overview) {
      return
    }
    setIsSaving(true)
    setError(null)
    try {
      const pricing = await savePortalPricing(tenant.slug, configuration)
      setOverview({ ...overview, pricing })
      setConfiguration({ settings: pricing.settings, services: pricing.services })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Der Entwurf konnte nicht gespeichert werden.')
    } finally {
      setIsSaving(false)
    }
  }

  const publishPricing = async () => {
    if (!overview) {
      return
    }
    setIsPublishing(true)
    setError(null)
    try {
      const pricing = await publishPortalPricing(tenant.slug)
      setOverview({ ...overview, pricing })
      setConfiguration({ settings: pricing.settings, services: pricing.services })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Das Preisprofil konnte nicht aktiviert werden.')
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f4f0]" style={accentStyle}>
      <header className="border-b border-[#dfe4de] bg-white">
        <div className="min-h-18 mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#173c3a] text-xs font-extrabold text-white">
              {tenant.branding.initials}
            </span>
            <div>
              <p className="text-sm font-bold text-[#173c3a]">{tenant.branding.name}</p>
              <p className="text-xs text-[#74827e]">Offertportal · lokaler POC-Zugang</p>
            </div>
          </div>
          <a
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#ccd6d0] px-3 text-sm font-semibold text-[#315d58] hover:border-[#9cafa6]"
            href={`/${locale}/${tenant.slug}`}
          >
            <ArrowLeft className="size-4" /> Rechner
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--tenant-accent)]">
              Unternehmenscockpit
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#173c3a] sm:text-4xl">
              {view === 'quotes' ? 'Offerten, die weitergehen' : 'Ihre Preise. Ihre Logik.'}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[#71807c]">
              {view === 'quotes'
                ? 'Bestätigungsanfragen stehen automatisch ganz oben – inklusive aller Daten und der exakten Preisversion.'
                : 'Passen Sie die wirksamen Parameter an, prüfen Sie den Musterpreis live und aktivieren Sie Änderungen versioniert.'}
            </p>
          </div>
          <a
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#173c3a] px-4 text-sm font-bold text-white"
            href={`/${locale}/${tenant.slug}`}
          >
            Kundenflow öffnen <ArrowUpRight className="size-4" />
          </a>
        </div>

        <nav
          className="mt-7 inline-flex rounded-2xl border border-[#dce3dd] bg-white p-1.5 shadow-sm"
          aria-label="Portalbereiche"
        >
          <PortalTab active={view === 'quotes'} icon={<Inbox className="size-4" />} onClick={() => setView('quotes')}>
            Offerten
            {metrics.confirmationCount > 0 ? (
              <span className="rounded-full bg-[#f6d9cf] px-2 py-0.5 text-[10px] text-[#9b4328]">
                {metrics.confirmationCount}
              </span>
            ) : null}
          </PortalTab>
          <PortalTab
            active={view === 'pricing'}
            icon={<SlidersHorizontal className="size-4" />}
            onClick={() => setView('pricing')}
          >
            Preislogik
          </PortalTab>
        </nav>

        {error && !overview ? (
          <div className="mt-7 rounded-2xl border border-[#efc8ba] bg-[#fff6f2] p-6 text-sm text-[#8f432d]">
            {error}
          </div>
        ) : null}

        {!overview || !configuration ? (
          <div className="mt-7 flex min-h-72 items-center justify-center rounded-2xl border border-[#dce3dd] bg-white text-sm font-semibold text-[#71807c]">
            Portal wird geladen …
          </div>
        ) : view === 'pricing' ? (
          <PricingConfigurator
            configuration={configuration}
            error={error}
            isPublishing={isPublishing}
            isSaving={isSaving}
            onChange={setConfiguration}
            onPublish={publishPricing}
            onSave={savePricing}
            pricingState={overview.pricing}
          />
        ) : (
          <QuotesView
            error={error}
            locale={locale}
            metrics={metrics}
            onConfirm={confirmQuote}
            quotes={overview.quotes}
            tenant={tenant}
          />
        )}
      </main>
    </div>
  )
}

function PortalTab({
  active,
  children,
  icon,
  onClick,
}: {
  active: boolean
  children: ReactNode
  icon: ReactNode
  onClick: () => void
}) {
  return (
    <button
      className={`flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold transition ${active ? 'bg-[#173c3a] text-white shadow-sm' : 'text-[#60736e] hover:bg-[#eef2ee]'}`}
      onClick={onClick}
      type="button"
    >
      {icon} {children}
    </button>
  )
}

function QuotesView({
  error,
  locale,
  metrics,
  onConfirm,
  quotes,
  tenant,
}: {
  error: string | null
  locale: string
  metrics: { confirmationCount: number; potentialRappen: number; quoteCount: number }
  onConfirm: (quoteId: string) => Promise<void>
  quotes: QuoteRecord[]
  tenant: PublicTenantConfig
}) {
  return (
    <>
      <section className="mt-7 grid gap-3 sm:grid-cols-3">
        <PortalMetric icon={<Inbox className="size-5" />} label="Offerten" value={String(metrics.quoteCount)} />
        <PortalMetric
          emphasized={metrics.confirmationCount > 0}
          icon={<BadgeCheck className="size-5" />}
          label="Bestätigung angefragt"
          value={String(metrics.confirmationCount)}
        />
        <PortalMetric
          icon={<FileCheck2 className="size-5" />}
          label="Potenzielles Volumen"
          value={formatMoneyRappen(metrics.potentialRappen)}
        />
      </section>

      {error ? <p className="mt-4 rounded-xl bg-[#fff1ec] p-3 text-xs font-medium text-[#9b4328]">{error}</p> : null}

      <section className="mt-7 overflow-hidden rounded-2xl border border-[#dce2dc] bg-white shadow-[0_16px_45px_rgba(23,60,58,0.05)]">
        <div className="flex items-center justify-between border-b border-[#e5e9e4] px-5 py-4 sm:px-6">
          <h2 className="font-semibold text-[#173c3a]">Aktuelle Offerten</h2>
          <span className="text-xs text-[#7a8884]">Nach letzter Aktivität</span>
        </div>
        {quotes.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="size-13 flex items-center justify-center rounded-2xl bg-[#edf2ee] text-[#4f716a]">
              <Inbox className="size-6" />
            </span>
            <h3 className="mt-4 font-semibold text-[#173c3a]">Noch keine Offerte</h3>
            <p className="mt-1 max-w-md text-sm leading-6 text-[#71807c]">
              Spielen Sie den Kundenflow bis zum Preis durch. Die serverseitig gespeicherte Anfrage erscheint hier.
            </p>
            <a
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--tenant-accent)] px-4 text-sm font-bold text-white"
              href={`/${locale}/${tenant.slug}`}
            >
              Demo starten <ArrowUpRight className="size-4" />
            </a>
          </div>
        ) : (
          <div className="divide-y divide-[#e8ece7]">
            {quotes.map((quote) => (
              <QuoteRow key={quote.id} onConfirm={() => onConfirm(quote.id)} quote={quote} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}

function PortalMetric({
  emphasized,
  icon,
  label,
  value,
}: {
  emphasized?: boolean
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${emphasized ? 'border-[#e8a087] bg-[#fff5f1]' : 'border-[#dce2dc] bg-white'}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-[#7a8884]">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[#173c3a]">{value}</p>
        </div>
        <span
          className={`flex size-10 items-center justify-center rounded-xl ${emphasized ? 'bg-[#f6d9cf] text-[#a84d30]' : 'bg-[#edf2ee] text-[#4f716a]'}`}
        >
          {icon}
        </span>
      </div>
    </div>
  )
}

function QuoteRow({ quote, onConfirm }: { quote: QuoteRecord; onConfirm: () => Promise<void> }) {
  const needsConfirmation = quote.draft.status === 'confirmationRequested'
  return (
    <article className={`p-5 sm:p-6 ${needsConfirmation ? 'bg-[#fffaf7]' : ''}`}>
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-[#173c3a]">
              {quote.draft.contact.firstName} {quote.draft.contact.lastName}
            </h3>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${needsConfirmation ? 'bg-[#f7d9ce] text-[#9b4328]' : 'bg-[#eaf2ed] text-[#42695f]'}`}
            >
              {portalStatusCopy[quote.draft.status]}
            </span>
            <span className="rounded-full border border-[#d9e2dc] px-2.5 py-1 text-[10px] font-semibold text-[#71807c]">
              Preis v{quote.calculation.pricingVersion}
            </span>
            {quote.calculation.accuracy.reviewRecommended ? (
              <span className="rounded-full bg-[#fff0e9] px-2.5 py-1 text-[10px] font-bold text-[#9b4b2f]">
                Prüfspanne {formatMoneyRappen(quote.calculation.accuracy.minTotalRappen)}–
                {formatMoneyRappen(quote.calculation.accuracy.maxTotalRappen)}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-[#71807c]">
            {quote.draft.contact.email} · {quote.draft.contact.phone}
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-[#58706a]">
            <span className="flex items-center gap-1.5">
              <MapPinned className="size-3.5" /> {quote.draft.fromAddress} → {quote.draft.toAddress}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />{' '}
              {new Intl.DateTimeFormat('de-CH').format(new Date(`${quote.draft.moveDate}T12:00:00`))}
            </span>
            <span className="flex items-center gap-1.5">
              <UsersRound className="size-3.5" /> {quote.calculation.requiredWorkers} Personen
            </span>
            <span className="flex items-center gap-1.5">
              <Clock3 className="size-3.5" /> {Math.round(quote.calculation.estimatedMinutes / 30) / 2} Std.
            </span>
          </div>
          {quote.calculation.accuracy.reviewRecommended && quote.calculation.accuracy.factors[0] ? (
            <p className="mt-3 text-xs leading-5 text-[#8a593f]">
              <span className="font-bold">Prüfgrund:</span> {quote.calculation.accuracy.factors[0].title} –{' '}
              {quote.calculation.accuracy.factors[0].description}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center justify-between gap-5 border-t border-[#e5e9e4] pt-4 xl:border-t-0 xl:pt-0">
          <div className="text-right">
            <p className="text-xs text-[#7a8884]">Offertpreis</p>
            <p className="mt-1 text-xl font-bold text-[#173c3a]">{formatMoneyRappen(quote.calculation.totalRappen)}</p>
          </div>
          {needsConfirmation ? (
            <button
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--tenant-accent)] px-4 text-sm font-bold text-white"
              onClick={() => void onConfirm()}
              type="button"
            >
              <BadgeCheck className="size-4" /> Bestätigen
            </button>
          ) : (
            <span className="text-xs font-semibold text-[#71807c]">Revision {quote.draft.revision}</span>
          )}
        </div>
      </div>
    </article>
  )
}
