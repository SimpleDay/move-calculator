import { deriveOperationalPlan } from './deriveOperationalPlan'
import { priceOperationalPlan, type QuotePrice } from './priceOperationalPlan'
import type {
  CalculateQuoteInput,
  ConfirmedMoveInput,
  QuoteAccuracy,
  QuoteAccuracyFactor,
  QuoteCalculation,
} from './types'

const BASIS_POINTS = 10_000

function calculateQuotePrice(input: CalculateQuoteInput): QuotePrice {
  return priceOperationalPlan(input, deriveOperationalPlan(input))
}

function scaleMove(
  move: ConfirmedMoveInput,
  { routeBasisPoints = BASIS_POINTS, volumeBasisPoints = BASIS_POINTS } = {},
): ConfirmedMoveInput {
  return {
    ...move,
    volumeM3: Math.max(0.1, (move.volumeM3 * volumeBasisPoints) / BASIS_POINTS),
    distanceKm: Math.max(0.1, (move.distanceKm * routeBasisPoints) / BASIS_POINTS),
    routeDurationMinutes:
      move.routeDurationMinutes === null
        ? null
        : Math.max(1, Math.round((move.routeDurationMinutes * routeBasisPoints) / BASIS_POINTS)),
  }
}

function getVolumeUncertaintyBasisPoints(input: CalculateQuoteInput): number {
  if (input.move.inventoryMethod === 'quick') {
    return input.pricingVersion.quickVolumeUncertaintyBasisPoints
  }
  if (input.move.inventoryMethod === 'photo') {
    return input.pricingVersion.photoVolumeUncertaintyBasisPoints
  }
  return input.pricingVersion.manualVolumeUncertaintyBasisPoints
}

function getRouteUncertaintyBasisPoints(input: CalculateQuoteInput): number {
  return input.move.routeSource === 'google'
    ? input.pricingVersion.googleRouteUncertaintyBasisPoints
    : input.pricingVersion.manualRouteUncertaintyBasisPoints
}

function getImpact(base: QuotePrice, low: QuotePrice, high: QuotePrice): number {
  return Math.max(Math.abs(base.totalRappen - low.totalRappen), Math.abs(high.totalRappen - base.totalRappen))
}

function hasResourceChange(base: QuotePrice, candidates: QuotePrice[]): boolean {
  return candidates.some(
    (candidate) =>
      candidate.requiredWorkers !== base.requiredWorkers ||
      candidate.requiredVehicles !== base.requiredVehicles ||
      candidate.tripsPerVehicle !== base.tripsPerVehicle,
  )
}

function assessQuoteAccuracy(input: CalculateQuoteInput, base: QuotePrice): QuoteAccuracy {
  const volumeUncertainty = getVolumeUncertaintyBasisPoints(input)
  const routeUncertainty = getRouteUncertaintyBasisPoints(input)
  const volumeLow = calculateQuotePrice({
    ...input,
    move: scaleMove(input.move, { volumeBasisPoints: BASIS_POINTS - volumeUncertainty }),
  })
  const volumeHigh = calculateQuotePrice({
    ...input,
    move: scaleMove(input.move, { volumeBasisPoints: BASIS_POINTS + volumeUncertainty }),
  })
  const routeLow = calculateQuotePrice({
    ...input,
    move: scaleMove(input.move, { routeBasisPoints: BASIS_POINTS - routeUncertainty }),
  })
  const routeHigh = calculateQuotePrice({
    ...input,
    move: scaleMove(input.move, { routeBasisPoints: BASIS_POINTS + routeUncertainty }),
  })
  const combinedLow = calculateQuotePrice({
    ...input,
    move: scaleMove(input.move, {
      routeBasisPoints: BASIS_POINTS - routeUncertainty,
      volumeBasisPoints: BASIS_POINTS - volumeUncertainty,
    }),
  })
  const combinedHigh = calculateQuotePrice({
    ...input,
    move: scaleMove(input.move, {
      routeBasisPoints: BASIS_POINTS + routeUncertainty,
      volumeBasisPoints: BASIS_POINTS + volumeUncertainty,
    }),
  })
  const allScenarios = [base, volumeLow, volumeHigh, routeLow, routeHigh, combinedLow, combinedHigh]
  const minTotalRappen = Math.min(...allScenarios.map((scenario) => scenario.totalRappen))
  const maxTotalRappen = Math.max(...allScenarios.map((scenario) => scenario.totalRappen))
  const spreadRappen = maxTotalRappen - minTotalRappen
  const reviewThresholdRappen = Math.max(
    input.pricingVersion.reviewImpactThresholdRappen,
    Math.round((base.totalRappen * input.pricingVersion.reviewImpactThresholdBasisPoints) / BASIS_POINTS),
  )
  const volumeImpactRappen = getImpact(base, volumeLow, volumeHigh)
  const routeImpactRappen = getImpact(base, routeLow, routeHigh)
  const resourceChange = hasResourceChange(base, allScenarios)
  const factors: QuoteAccuracyFactor[] = [
    {
      id: 'inventory-volume',
      title: input.move.inventoryMethod === 'quick' ? 'Volumen grob geschätzt' : 'Inventarvolumen',
      description:
        input.move.inventoryMethod === 'quick'
          ? 'Eine raumweise Fotoaufnahme würde den grössten Unsicherheitsfaktor reduzieren.'
          : input.move.inventoryMethod === 'photo'
            ? 'Verdeckte Inhalte und nicht fotografierte Räume können das Volumen noch verändern.'
            : 'Die Berechnung reagiert auf Abweichungen vom manuell angegebenen Volumen.',
      impactRappen: volumeImpactRappen,
      needsReview: volumeImpactRappen >= reviewThresholdRappen,
    },
    {
      id: 'route-duration',
      title: input.move.routeSource === 'google' ? 'Google-Fahrzeit berücksichtigt' : 'Fahrzeit geschätzt',
      description:
        input.move.routeSource === 'google'
          ? 'Die echte Routenzeit reduziert die Unsicherheit gegenüber einer reinen Kilometerrechnung.'
          : 'Eine validierte Google-Route würde Distanz und Fahrzeit genauer bestimmen.',
      impactRappen: routeImpactRappen,
      needsReview: routeImpactRappen >= reviewThresholdRappen,
    },
  ]
  if (resourceChange) {
    factors.push({
      id: 'resource-plan',
      title: 'Team- oder Fahrzeugwahl kann wechseln',
      description: 'Die aktuelle Datenspanne berührt eine operative Grenze. Diese Offerte sollte kurz geprüft werden.',
      impactRappen: spreadRappen,
      needsReview: true,
    })
  }
  factors.sort(
    (left, right) => Number(right.needsReview) - Number(left.needsReview) || right.impactRappen - left.impactRappen,
  )

  const relativeSpreadBasisPoints =
    base.totalRappen === 0 ? 0 : Math.round((spreadRappen * BASIS_POINTS) / base.totalRappen)
  const reviewRecommended = factors.some((factor) => factor.needsReview)
  const level =
    relativeSpreadBasisPoints <= 1_000 && !resourceChange
      ? 'high'
      : relativeSpreadBasisPoints <= 2_000
        ? 'medium'
        : 'low'

  return {
    level,
    minTotalRappen,
    maxTotalRappen,
    spreadRappen,
    reviewRecommended,
    factors,
  }
}

export function calculateQuote(input: CalculateQuoteInput): QuoteCalculation {
  const price = calculateQuotePrice(input)
  return {
    ...price,
    accuracy: assessQuoteAccuracy(input, price),
  }
}
