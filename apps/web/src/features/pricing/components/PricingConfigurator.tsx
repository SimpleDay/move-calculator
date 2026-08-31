'use client'

import { calculateQuote, formatMoneyRappen } from '@/features/pricing/model'
import type { PricingConfiguration, TenantPricingState } from '@/features/pricing/model/pricingConfiguration'
import type { PricingProfileSettings } from '@/features/pricing/model/pricingProfile'
import type { ServiceDefinition } from '@/features/tenants/model/tenantConfig'
import {
  BadgeCheck,
  Boxes,
  Calculator,
  CarFront,
  Check,
  ChevronDown,
  Clock3,
  Layers3,
  Save,
  Sparkles,
  UsersRound,
} from 'lucide-react'
import type { ReactNode } from 'react'

type PricingConfiguratorProps = {
  configuration: PricingConfiguration
  error: string | null
  isPublishing: boolean
  isSaving: boolean
  pricingState: TenantPricingState
  onChange: (configuration: PricingConfiguration) => void
  onPublish: () => Promise<void>
  onSave: () => Promise<void>
}

const monthLabels = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']

export function PricingConfigurator({
  configuration,
  error,
  isPublishing,
  isSaving,
  pricingState,
  onChange,
  onPublish,
  onSave,
}: PricingConfiguratorProps) {
  const updateSetting = <Key extends keyof PricingProfileSettings>(key: Key, value: PricingProfileSettings[Key]) => {
    onChange({ ...configuration, settings: { ...configuration.settings, [key]: value } })
  }

  const updateService = (serviceId: ServiceDefinition['id'], patch: Partial<ServiceDefinition>) => {
    onChange({
      ...configuration,
      services: configuration.services.map((service) =>
        service.id === serviceId ? { ...service, ...patch } : service,
      ),
    })
  }

  const preview = calculateQuote({
    calculationDate: '2026-08-30',
    move: {
      moveType: 'apartment',
      moveDate: '2026-10-14',
      distanceKm: 28,
      routeDurationMinutes: 36,
      routeSource: 'google',
      inventoryMethod: 'manual',
      rooms: 3.5,
      volumeM3: 24,
      boxes: 35,
      fromAccess: { floor: 2, lift: 'small', carryDistanceM: 20 },
      toAccess: { floor: 1, lift: 'large', carryDistanceM: 10 },
      specialtyItems: { piano: false, safe: false },
      selectedServiceIds: [],
    },
    pricingVersion: {
      id: 'pricing-preview',
      version: pricingState.activeVersion,
      ...configuration.settings,
    },
    services: configuration.services,
  })

  const locallyChanged =
    JSON.stringify({ settings: pricingState.settings, services: pricingState.services }) !==
    JSON.stringify(configuration)
  const canPublish = pricingState.hasUnpublishedChanges && !locallyChanged

  return (
    <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-4">
        <ConfiguratorSection
          description="Die vier stärksten Hebel für die meisten Zügelunternehmen. Alle Beträge werden intern in Rappen gespeichert."
          icon={<Calculator className="size-5" />}
          title="Grundkalkulation"
        >
          <SettingGrid>
            <NumberSetting
              label="Mindestpreis"
              onChange={(value) => updateSetting('minimumPriceRappen', Math.round(value * 100))}
              suffix="CHF"
              value={configuration.settings.minimumPriceRappen / 100}
            />
            <NumberSetting
              label="Stundenansatz pro Person"
              onChange={(value) => updateSetting('workerHourlyRateRappen', Math.round(value * 100))}
              suffix="CHF"
              value={configuration.settings.workerHourlyRateRappen / 100}
            />
            <NumberSetting
              label="Fahrzeug pro Stunde"
              onChange={(value) => updateSetting('vehicleHourlyRateRappen', Math.round(value * 100))}
              suffix="CHF"
              value={configuration.settings.vehicleHourlyRateRappen / 100}
            />
            <NumberSetting
              label="Preis pro Fahrkilometer"
              onChange={(value) => updateSetting('distanceRateRappen', Math.round(value * 100))}
              step={0.1}
              suffix="CHF"
              value={configuration.settings.distanceRateRappen / 100}
            />
          </SettingGrid>
        </ConfiguratorSection>

        <ConfiguratorSection
          description="Aus Volumen, Strecke und Zugängen wird eine realistische Einsatzdauer und Teamgrösse."
          icon={<UsersRound className="size-5" />}
          title="Team & Zeitmodell"
        >
          <SettingGrid>
            <NumberSetting
              label="Grundaufwand"
              onChange={(value) => updateSetting('baseHandlingMinutes', Math.round(value))}
              suffix="Min."
              value={configuration.settings.baseHandlingMinutes}
            />
            <NumberSetting
              label="Aufwand pro m³"
              onChange={(value) => updateSetting('volumeMinutesPerM3', value)}
              step={0.5}
              suffix="Min."
              value={configuration.settings.volumeMinutesPerM3}
            />
            <NumberSetting
              label="Aufwand pro Karton"
              onChange={(value) => updateSetting('boxHandlingMinutesPerBox', value)}
              step={0.1}
              suffix="Min."
              value={configuration.settings.boxHandlingMinutesPerBox}
            />
            <NumberSetting
              label="Fahrzeit pro km"
              onChange={(value) => updateSetting('travelMinutesPerKm', value)}
              step={0.1}
              suffix="Min."
              value={configuration.settings.travelMinutesPerKm}
            />
            <NumberSetting
              label="Abrechnungsintervall"
              onChange={(value) => updateSetting('billingIntervalMinutes', Math.round(value))}
              suffix="Min."
              value={configuration.settings.billingIntervalMinutes}
            />
            <NumberSetting
              label="Maximale Einsatzdauer"
              onChange={(value) => updateSetting('targetMoveDurationMinutes', Math.round(value))}
              suffix="Min."
              value={configuration.settings.targetMoveDurationMinutes}
            />
            <NumberSetting
              label="Basisteam"
              onChange={(value) => updateSetting('baseWorkers', Math.round(value))}
              suffix="Pers."
              value={configuration.settings.baseWorkers}
            />
            <NumberSetting
              label="Mittlere Teamoption"
              onChange={(value) => updateSetting('mediumTeamWorkers', Math.round(value))}
              suffix="Pers."
              value={configuration.settings.mediumTeamWorkers}
            />
            <NumberSetting
              label="Grosse Teamoption"
              onChange={(value) => updateSetting('largeTeamWorkers', Math.round(value))}
              suffix="Pers."
              value={configuration.settings.largeTeamWorkers}
            />
            <PercentageSetting
              label="Effizienz je Zusatzperson"
              onChange={(value) => updateSetting('additionalWorkerEfficiencyBasisPoints', value)}
              value={configuration.settings.additionalWorkerEfficiencyBasisPoints}
            />
          </SettingGrid>
        </ConfiguratorSection>

        <ConfiguratorSection
          description="Kapazität und Dispositionsanteil wirken direkt auf Fahrzeuganzahl, Fahrzeit und Kilometerkosten."
          icon={<CarFront className="size-5" />}
          title="Fahrzeuge & Strecke"
        >
          <SettingGrid>
            <NumberSetting
              label="Kapazität pro Fahrzeug"
              onChange={(value) => updateSetting('vehicleCapacityM3', value)}
              suffix="m³"
              value={configuration.settings.vehicleCapacityM3}
            />
            <NumberSetting
              label="Maximale Fahrten pro Fahrzeug"
              onChange={(value) => updateSetting('maxTripsPerVehicle', Math.max(1, Math.round(value)))}
              suffix="Fahrten"
              value={configuration.settings.maxTripsPerVehicle}
            />
            <NumberSetting
              label="Aufwand je Zusatzfahrt"
              onChange={(value) => updateSetting('additionalTripMinutes', Math.round(value))}
              suffix="Min."
              value={configuration.settings.additionalTripMinutes}
            />
            <NumberSetting
              label="Depotpauschale"
              onChange={(value) => updateSetting('depotAllowanceKm', Math.round(value))}
              suffix="km"
              value={configuration.settings.depotAllowanceKm}
            />
            <NumberSetting
              label="Routenfaktor"
              onChange={(value) => updateSetting('routeDistanceMultiplierBasisPoints', Math.round(value * 100))}
              step={1}
              suffix="%"
              value={configuration.settings.routeDistanceMultiplierBasisPoints / 100}
            />
          </SettingGrid>
        </ConfiguratorSection>

        <ConfiguratorSection
          description="Zusatzleistungen sind für Kund:innen auswählbar und werden transparent in die Offerte aufgenommen."
          icon={<Boxes className="size-5" />}
          title="Zusatzleistungen"
        >
          <div className="divide-y divide-[#e8ece8] overflow-hidden rounded-xl border border-[#dde4de]">
            {configuration.services.map((service) => (
              <div
                className="grid gap-3 bg-white p-4 md:grid-cols-[minmax(0,1fr)_150px_120px] md:items-end"
                key={service.id}
              >
                <div>
                  <p className="text-sm font-semibold text-[#173c3a]">{service.name}</p>
                  <p className="mt-1 text-xs leading-5 text-[#71807c]">{service.description}</p>
                </div>
                <NumberSetting
                  compact
                  label={
                    service.priceType === 'fixed'
                      ? 'Pauschale'
                      : service.priceType === 'perM3'
                        ? 'Pro m³'
                        : 'Pro Zimmer'
                  }
                  onChange={(value) => updateService(service.id, { unitPriceRappen: Math.round(value * 100) })}
                  suffix="CHF"
                  value={service.unitPriceRappen / 100}
                />
                <NumberSetting
                  compact
                  label="Zusatzzeit"
                  onChange={(value) => updateService(service.id, { addedMinutes: Math.round(value) })}
                  suffix="Min."
                  value={service.addedMinutes}
                />
              </div>
            ))}
          </div>
        </ConfiguratorSection>

        <details className="group overflow-hidden rounded-2xl border border-[#dce3dd] bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#edf3ee] text-[#426b62]">
                <Layers3 className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold text-[#173c3a]">Zugänge, Zuschläge & Spezialtransporte</h2>
                <p className="mt-1 text-xs text-[#71807c]">Erweiterte Regeln für eine noch genauere Kalkulation</p>
              </div>
            </div>
            <ChevronDown className="size-5 text-[#71807c] transition group-open:rotate-180" />
          </summary>
          <div className="space-y-7 border-t border-[#e7ebe7] p-5 sm:p-6">
            <SettingGroup title="Aufwand nach Umzugsart">
              <SettingGrid>
                <PercentageSetting
                  label="Wohnung"
                  onChange={(value) => updateSetting('apartmentHandlingMultiplierBasisPoints', value)}
                  value={configuration.settings.apartmentHandlingMultiplierBasisPoints}
                />
                <PercentageSetting
                  label="Haus"
                  onChange={(value) => updateSetting('houseHandlingMultiplierBasisPoints', value)}
                  value={configuration.settings.houseHandlingMultiplierBasisPoints}
                />
                <PercentageSetting
                  label="Geschäftsumzug"
                  onChange={(value) => updateSetting('businessHandlingMultiplierBasisPoints', value)}
                  value={configuration.settings.businessHandlingMultiplierBasisPoints}
                />
              </SettingGrid>
            </SettingGroup>
            <SettingGroup title="Zugänge">
              <SettingGrid>
                <NumberSetting
                  label="Inklusive Tragdistanz"
                  onChange={(value) => updateSetting('includedCarryDistanceM', Math.round(value))}
                  suffix="m"
                  value={configuration.settings.includedCarryDistanceM}
                />
                <NumberSetting
                  label="Tragdistanz-Schritt"
                  onChange={(value) => updateSetting('carryDistanceStepM', Math.round(value))}
                  suffix="m"
                  value={configuration.settings.carryDistanceStepM}
                />
                <PercentageSetting
                  label="Zuschlag pro Tragschritt"
                  onChange={(value) => updateSetting('carryDistanceSurchargeBasisPointsPerStep', value)}
                  value={configuration.settings.carryDistanceSurchargeBasisPointsPerStep}
                />
                <PercentageSetting
                  label="Stockwerk ohne Lift"
                  onChange={(value) => updateSetting('floorSurchargeNoLiftBasisPoints', value)}
                  value={configuration.settings.floorSurchargeNoLiftBasisPoints}
                />
                <PercentageSetting
                  label="Stockwerk kleiner Lift"
                  onChange={(value) => updateSetting('floorSurchargeSmallLiftBasisPoints', value)}
                  value={configuration.settings.floorSurchargeSmallLiftBasisPoints}
                />
                <PercentageSetting
                  label="Stockwerk grosser Lift"
                  onChange={(value) => updateSetting('floorSurchargeLargeLiftBasisPoints', value)}
                  value={configuration.settings.floorSurchargeLargeLiftBasisPoints}
                />
              </SettingGrid>
            </SettingGroup>
            <SettingGroup title="Termin & Saison">
              <SettingGrid>
                <PercentageSetting
                  label="Wochenende"
                  onChange={(value) => updateSetting('weekendSurchargeBasisPoints', value)}
                  value={configuration.settings.weekendSurchargeBasisPoints}
                />
                <NumberSetting
                  label="Kurzfristig unter"
                  onChange={(value) => updateSetting('shortNoticeDays', Math.round(value))}
                  suffix="Tage"
                  value={configuration.settings.shortNoticeDays}
                />
                <PercentageSetting
                  label="Kurzfristzuschlag"
                  onChange={(value) => updateSetting('shortNoticeSurchargeBasisPoints', value)}
                  value={configuration.settings.shortNoticeSurchargeBasisPoints}
                />
                <PercentageSetting
                  label="Hochsaison"
                  onChange={(value) => updateSetting('highSeasonSurchargeBasisPoints', value)}
                  value={configuration.settings.highSeasonSurchargeBasisPoints}
                />
              </SettingGrid>
              <div className="mt-4">
                <p className="text-xs font-semibold text-[#516b65]">Hochsaison-Monate</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {monthLabels.map((label, index) => {
                    const month = index + 1
                    const selected = configuration.settings.highSeasonMonths.includes(month)
                    return (
                      <button
                        className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${selected ? 'bg-[#173c3a] text-white' : 'border border-[#d5ded8] bg-white text-[#5e736e]'}`}
                        key={label}
                        onClick={() =>
                          updateSetting(
                            'highSeasonMonths',
                            selected
                              ? configuration.settings.highSeasonMonths.filter((value) => value !== month)
                              : [...configuration.settings.highSeasonMonths, month].sort((left, right) => left - right),
                          )
                        }
                        type="button"
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </SettingGroup>
            <SettingGroup title="Spezialtransport, MWST & Rundung">
              <SettingGrid>
                <MoneySetting
                  label="Klavierpauschale"
                  onChange={(value) => updateSetting('pianoSurchargeRappen', value)}
                  value={configuration.settings.pianoSurchargeRappen}
                />
                <NumberSetting
                  label="Klavier-Zusatzzeit"
                  onChange={(value) => updateSetting('pianoAddedMinutes', Math.round(value))}
                  suffix="Min."
                  value={configuration.settings.pianoAddedMinutes}
                />
                <MoneySetting
                  label="Tresorpauschale"
                  onChange={(value) => updateSetting('safeSurchargeRappen', value)}
                  value={configuration.settings.safeSurchargeRappen}
                />
                <NumberSetting
                  label="Tresor-Zusatzzeit"
                  onChange={(value) => updateSetting('safeAddedMinutes', Math.round(value))}
                  suffix="Min."
                  value={configuration.settings.safeAddedMinutes}
                />
                <PercentageSetting
                  label="MWST"
                  onChange={(value) => updateSetting('vatBasisPoints', value)}
                  value={configuration.settings.vatBasisPoints}
                />
                <MoneySetting
                  label="Aufrundung auf"
                  onChange={(value) => updateSetting('roundingIncrementRappen', Math.max(1, value))}
                  value={configuration.settings.roundingIncrementRappen}
                />
              </SettingGrid>
            </SettingGroup>
            <SettingGroup title="Datenqualität & Prüfhinweise">
              <SettingGrid>
                <PercentageSetting
                  label="Unsicherheit Schnellschätzung"
                  onChange={(value) => updateSetting('quickVolumeUncertaintyBasisPoints', value)}
                  value={configuration.settings.quickVolumeUncertaintyBasisPoints}
                />
                <PercentageSetting
                  label="Unsicherheit Fotoerfassung"
                  onChange={(value) => updateSetting('photoVolumeUncertaintyBasisPoints', value)}
                  value={configuration.settings.photoVolumeUncertaintyBasisPoints}
                />
                <PercentageSetting
                  label="Unsicherheit manuelles Volumen"
                  onChange={(value) => updateSetting('manualVolumeUncertaintyBasisPoints', value)}
                  value={configuration.settings.manualVolumeUncertaintyBasisPoints}
                />
                <PercentageSetting
                  label="Unsicherheit Google-Route"
                  onChange={(value) => updateSetting('googleRouteUncertaintyBasisPoints', value)}
                  value={configuration.settings.googleRouteUncertaintyBasisPoints}
                />
                <PercentageSetting
                  label="Unsicherheit manuelle Route"
                  onChange={(value) => updateSetting('manualRouteUncertaintyBasisPoints', value)}
                  value={configuration.settings.manualRouteUncertaintyBasisPoints}
                />
                <MoneySetting
                  label="Prüfung ab Preiswirkung"
                  onChange={(value) => updateSetting('reviewImpactThresholdRappen', value)}
                  value={configuration.settings.reviewImpactThresholdRappen}
                />
                <PercentageSetting
                  label="Prüfung ab relativer Wirkung"
                  onChange={(value) => updateSetting('reviewImpactThresholdBasisPoints', value)}
                  value={configuration.settings.reviewImpactThresholdBasisPoints}
                />
              </SettingGrid>
            </SettingGroup>
          </div>
        </details>
      </div>

      <aside className="xl:order-last">
        <div className="sticky top-6 space-y-4">
          <div className="overflow-hidden rounded-2xl bg-[#173c3a] text-white shadow-[0_22px_55px_rgba(23,60,58,0.2)]">
            <div className="border-b border-white/10 p-5">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-white/10">
                  <Sparkles className="size-5 text-[#f2a88e]" />
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/75">
                  Live-Vorschau
                </span>
              </div>
              <p className="mt-5 text-xs text-white/60">Musterumzug · 24 m³ · 28 km</p>
              <p className="mt-1 text-3xl font-bold tracking-[-0.04em]">{formatMoneyRappen(preview.totalRappen)}</p>
              <p className="mt-2 flex items-center gap-2 text-xs text-white/70">
                <Clock3 className="size-3.5" /> {Math.round(preview.estimatedMinutes / 30) / 2} Std. ·{' '}
                {preview.requiredWorkers} Personen
              </p>
            </div>
            <div className="space-y-2 p-5 text-xs">
              {preview.components
                .filter((component) => component.visibleToCustomer)
                .slice(0, 5)
                .map((component) => (
                  <div className="flex justify-between gap-3" key={component.id}>
                    <span className="truncate text-white/65">{component.customerLabel}</span>
                    <span className="shrink-0 font-semibold">{formatMoneyRappen(component.amountRappen)}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#dce3dd] bg-white p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#edf3ee] text-[#426b62]">
                <BadgeCheck className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#173c3a]">Aktiv: Version {pricingState.activeVersion}</p>
                <p className="mt-1 text-xs leading-5 text-[#71807c]">
                  Alte Offerten behalten immer die Preisversion, mit der sie berechnet wurden.
                </p>
              </div>
            </div>

            {error ? (
              <p className="mt-4 rounded-xl bg-[#fff1ec] p-3 text-xs font-medium text-[#9b4328]">{error}</p>
            ) : null}

            <button
              className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#cad6cf] bg-white px-4 text-sm font-bold text-[#315d58] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSaving || !locallyChanged}
              onClick={() => void onSave()}
              type="button"
            >
              {isSaving ? <Clock3 className="size-4 animate-pulse" /> : <Save className="size-4" />}
              Entwurf speichern
            </button>
            <button
              className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--tenant-accent)] px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPublishing || !canPublish}
              onClick={() => void onPublish()}
              type="button"
            >
              {isPublishing ? <Clock3 className="size-4 animate-pulse" /> : <Check className="size-4" />}
              Als neue Version aktivieren
            </button>
            {locallyChanged ? (
              <p className="mt-3 text-center text-[11px] text-[#7a8884]">Zuerst Entwurf speichern</p>
            ) : pricingState.hasUnpublishedChanges ? (
              <p className="mt-3 text-center text-[11px] font-semibold text-[#a85a3f]">
                Gespeicherte Änderungen noch nicht aktiv
              </p>
            ) : (
              <p className="mt-3 text-center text-[11px] text-[#5f7b74]">Alle Änderungen sind aktiv</p>
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}

function ConfiguratorSection({
  children,
  description,
  icon,
  title,
}: {
  children: ReactNode
  description: string
  icon: ReactNode
  title: string
}) {
  return (
    <section className="rounded-2xl border border-[#dce3dd] bg-white p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#edf3ee] text-[#426b62]">
          {icon}
        </span>
        <div>
          <h2 className="font-semibold text-[#173c3a]">{title}</h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-[#71807c]">{description}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

function SettingGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
}

function SettingGroup({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[#71807c]">{title}</h3>
      {children}
    </div>
  )
}

function NumberSetting({
  compact = false,
  label,
  onChange,
  step = 1,
  suffix,
  value,
}: {
  compact?: boolean
  label: string
  onChange: (value: number) => void
  step?: number
  suffix: string
  value: number
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[#516b65]">{label}</span>
      <span className="relative block">
        <input
          className={`${compact ? 'min-h-10' : 'min-h-11'} focus:ring-3 w-full rounded-xl border border-[#ced9d2] bg-[#fbfcfa] px-3 pr-14 text-sm font-semibold text-[#173c3a] outline-none focus:border-[var(--tenant-accent)] focus:ring-[color-mix(in_srgb,var(--tenant-accent)_10%,transparent)]`}
          min="0"
          onChange={(event) => onChange(Number(event.target.value) || 0)}
          step={step}
          type="number"
          value={value}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-[#82908c]">
          {suffix}
        </span>
      </span>
    </label>
  )
}

function MoneySetting({ label, onChange, value }: { label: string; onChange: (value: number) => void; value: number }) {
  return (
    <NumberSetting
      label={label}
      onChange={(next) => onChange(Math.round(next * 100))}
      step={1}
      suffix="CHF"
      value={value / 100}
    />
  )
}

function PercentageSetting({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: number) => void
  value: number
}) {
  return (
    <NumberSetting
      label={label}
      onChange={(next) => onChange(Math.round(next * 100))}
      step={0.1}
      suffix="%"
      value={value / 100}
    />
  )
}
