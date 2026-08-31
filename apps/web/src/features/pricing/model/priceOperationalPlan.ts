import type { CalculateQuoteInput, OperationalPlan, PriceComponent, QuoteCalculation } from './types'

const BASIS_POINTS = 10_000
const MINUTES_PER_HOUR = 60

export type QuotePrice = Omit<QuoteCalculation, 'accuracy'>

function roundRappen(value: number): number {
  return Math.round(value)
}

function calculateServiceAmount(
  priceType: 'fixed' | 'perM3' | 'perRoom',
  unitPriceRappen: number,
  volumeM3: number,
  rooms: number,
): number {
  if (priceType === 'perM3') {
    return roundRappen(unitPriceRappen * volumeM3)
  }
  if (priceType === 'perRoom') {
    return roundRappen(unitPriceRappen * rooms)
  }
  return unitPriceRappen
}

function parseDate(date: string): Date {
  return new Date(`${date}T12:00:00.000Z`)
}

function differenceInCalendarDays(later: Date, earlier: Date): number {
  return Math.floor((later.getTime() - earlier.getTime()) / 86_400_000)
}

function addPercentageComponent(
  components: PriceComponent[],
  id: PriceComponent['id'],
  label: string,
  explanation: string,
  baseRappen: number,
  surchargeBasisPoints: number,
): number {
  const amountRappen = roundRappen((baseRappen * surchargeBasisPoints) / BASIS_POINTS)
  if (amountRappen > 0) {
    components.push({
      id,
      amountRappen,
      customerLabel: label,
      explanation,
      visibleToCustomer: true,
    })
  }
  return amountRappen
}

export function priceOperationalPlan(
  { calculationDate, move, pricingVersion, services }: CalculateQuoteInput,
  plan: OperationalPlan,
): QuotePrice {
  const components: PriceComponent[] = []
  const laborRappen = roundRappen(
    (plan.estimatedMinutes / MINUTES_PER_HOUR) * plan.requiredWorkers * pricingVersion.workerHourlyRateRappen,
  )
  components.push({
    id: 'labor',
    amountRappen: laborRappen,
    customerLabel: `Zügelteam (${plan.requiredWorkers} Personen)`,
    explanation: `${plan.estimatedMinutes / MINUTES_PER_HOUR} verrechnete Stunden inklusive Fahrt und Zugang.`,
    visibleToCustomer: true,
  })

  const vehicleRappen = roundRappen(
    (plan.estimatedMinutes / MINUTES_PER_HOUR) * plan.requiredVehicles * pricingVersion.vehicleHourlyRateRappen,
  )
  const tripExplanation =
    plan.tripsPerVehicle > 1
      ? `Geplant sind ${plan.requiredJourneys} Fahrten mit maximal ${plan.tripsPerVehicle} Fahrten pro Fahrzeug.`
      : `Kapazität von ${pricingVersion.vehicleCapacityM3} m³ pro Fahrzeug.`
  components.push({
    id: 'vehicle',
    amountRappen: vehicleRappen,
    customerLabel: plan.requiredVehicles === 1 ? 'Zügelfahrzeug' : `${plan.requiredVehicles} Zügelfahrzeuge`,
    explanation: tripExplanation,
    visibleToCustomer: true,
  })

  const distanceRappen = plan.billableDistanceKm * pricingVersion.distanceRateRappen
  components.push({
    id: 'distance',
    amountRappen: distanceRappen,
    customerLabel: 'Anfahrt & Strecke',
    explanation: `${plan.billableDistanceKm} kalkulierte Flottenkilometer inklusive Depotanteil.`,
    visibleToCustomer: true,
  })

  const selectedServices = services.filter((service) => move.selectedServiceIds.includes(service.id))
  for (const service of selectedServices) {
    components.push({
      id: `service:${service.id}`,
      amountRappen: calculateServiceAmount(service.priceType, service.unitPriceRappen, move.volumeM3, move.rooms),
      customerLabel: service.name,
      explanation: service.description,
      visibleToCustomer: true,
    })
  }

  const specialtyItemsRappen =
    (move.specialtyItems.piano ? pricingVersion.pianoSurchargeRappen : 0) +
    (move.specialtyItems.safe ? pricingVersion.safeSurchargeRappen : 0)
  if (specialtyItemsRappen > 0) {
    const labels = [move.specialtyItems.piano ? 'Klavier' : '', move.specialtyItems.safe ? 'Tresor' : ''].filter(
      Boolean,
    )
    components.push({
      id: 'specialtyItems',
      amountRappen: specialtyItemsRappen,
      customerLabel: 'Spezialtransport',
      explanation: `Zusätzliche Sicherung und Handhabung: ${labels.join(' und ')}.`,
      visibleToCustomer: true,
    })
  }

  let subtotalRappen = components.reduce((sum, component) => sum + component.amountRappen, 0)
  const moveDate = parseDate(move.moveDate)
  const calculatedAt = parseDate(calculationDate)
  const dayOfWeek = moveDate.getUTCDay()

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    subtotalRappen += addPercentageComponent(
      components,
      'weekendSurcharge',
      'Wochenendzuschlag',
      'Der gewählte Umzugstermin liegt an einem Wochenende.',
      subtotalRappen,
      pricingVersion.weekendSurchargeBasisPoints,
    )
  }

  const daysUntilMove = differenceInCalendarDays(moveDate, calculatedAt)
  if (daysUntilMove >= 0 && daysUntilMove < pricingVersion.shortNoticeDays) {
    subtotalRappen += addPercentageComponent(
      components,
      'shortNoticeSurcharge',
      'Kurzfristige Planung',
      `Der Termin liegt weniger als ${pricingVersion.shortNoticeDays} Tage entfernt.`,
      subtotalRappen,
      pricingVersion.shortNoticeSurchargeBasisPoints,
    )
  }

  if (pricingVersion.highSeasonMonths.includes(moveDate.getUTCMonth() + 1)) {
    subtotalRappen += addPercentageComponent(
      components,
      'highSeasonSurcharge',
      'Saisonzuschlag',
      'Der Termin liegt in einer stark ausgelasteten Umzugssaison.',
      subtotalRappen,
      pricingVersion.highSeasonSurchargeBasisPoints,
    )
  }

  if (subtotalRappen < pricingVersion.minimumPriceRappen) {
    const minimumAdjustmentRappen = pricingVersion.minimumPriceRappen - subtotalRappen
    components.push({
      id: 'minimumAdjustment',
      amountRappen: minimumAdjustmentRappen,
      customerLabel: 'Mindestauftragswert',
      explanation: 'Deckt Disposition, Fahrzeugbereitstellung und Grundaufwand.',
      visibleToCustomer: false,
    })
    subtotalRappen = pricingVersion.minimumPriceRappen
  }

  const vatRappen = roundRappen((subtotalRappen * pricingVersion.vatBasisPoints) / BASIS_POINTS)
  components.push({
    id: 'vat',
    amountRappen: vatRappen,
    customerLabel: 'MWST',
    explanation: `${pricingVersion.vatBasisPoints / 100}% Mehrwertsteuer.`,
    visibleToCustomer: true,
  })

  const totalBeforeRounding = subtotalRappen + vatRappen
  const totalRappen =
    Math.ceil(totalBeforeRounding / pricingVersion.roundingIncrementRappen) * pricingVersion.roundingIncrementRappen
  const roundingRappen = totalRappen - totalBeforeRounding
  if (roundingRappen !== 0) {
    components.push({
      id: 'rounding',
      amountRappen: roundingRappen,
      customerLabel: 'Rundung',
      explanation: `Auf CHF ${pricingVersion.roundingIncrementRappen / 100} gerundet.`,
      visibleToCustomer: false,
    })
  }

  const assumptions = [
    {
      id: 'inventory-complete',
      text: 'Das angegebene Volumen, die Kartons und Spezialgegenstände sind vollständig.',
    },
    {
      id: 'access-available',
      text: 'Die beschriebenen Zugänge sind am Umzugstag frei und nutzbar.',
    },
    {
      id: 'parking',
      text: 'Das Fahrzeug kann innerhalb der angegebenen Tragdistanz parkieren.',
    },
  ]
  if (plan.tripsPerVehicle > 1) {
    assumptions.push({
      id: 'multiple-trips',
      text: `${plan.requiredJourneys} Fahrzeugfahrten sind eingeplant; ein zusätzliches Fahrzeug ist nicht automatisch nötig.`,
    })
  }

  return {
    pricingVersionId: pricingVersion.id,
    pricingVersion: pricingVersion.version,
    currency: pricingVersion.currency,
    subtotalRappen,
    vatRappen,
    totalRappen,
    estimatedMinutes: plan.estimatedMinutes,
    handlingMinutes: plan.handlingMinutes,
    travelMinutes: plan.travelMinutes,
    requiredWorkers: plan.requiredWorkers,
    requiredVehicles: plan.requiredVehicles,
    requiredJourneys: plan.requiredJourneys,
    tripsPerVehicle: plan.tripsPerVehicle,
    components,
    assumptions,
  }
}
