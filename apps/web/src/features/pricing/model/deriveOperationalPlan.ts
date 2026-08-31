import type { CalculateQuoteInput, OperationalPlan } from './types'

const BASIS_POINTS = 10_000
const MINUTES_PER_HOUR = 60

type ResourceOption = OperationalPlan & {
  directCostRappen: number
}

function roundMinutesToInterval(minutes: number, intervalMinutes: number): number {
  return Math.ceil(minutes / intervalMinutes) * intervalMinutes
}

function getAccessMultiplierBasisPoints(
  access: CalculateQuoteInput['move']['fromAccess'],
  pricing: CalculateQuoteInput['pricingVersion'],
): number {
  const floorImpact =
    access.floor <= 0
      ? 0
      : access.lift === 'none'
        ? access.floor * pricing.floorSurchargeNoLiftBasisPoints
        : access.lift === 'small'
          ? access.floor * pricing.floorSurchargeSmallLiftBasisPoints
          : access.floor * pricing.floorSurchargeLargeLiftBasisPoints
  const carryingImpact =
    Math.max(0, Math.ceil((access.carryDistanceM - pricing.includedCarryDistanceM) / pricing.carryDistanceStepM)) *
    pricing.carryDistanceSurchargeBasisPointsPerStep

  return BASIS_POINTS + floorImpact + carryingImpact
}

function getMoveTypeMultiplierBasisPoints(
  moveType: CalculateQuoteInput['move']['moveType'],
  pricing: CalculateQuoteInput['pricingVersion'],
): number {
  if (moveType === 'business') {
    return pricing.businessHandlingMultiplierBasisPoints
  }
  if (moveType === 'house') {
    return pricing.houseHandlingMultiplierBasisPoints
  }
  return pricing.apartmentHandlingMultiplierBasisPoints
}

function getEffectiveWorkers(
  workers: number,
  baseWorkers: number,
  additionalWorkerEfficiencyBasisPoints: number,
): number {
  return baseWorkers + (Math.max(0, workers - baseWorkers) * additionalWorkerEfficiencyBasisPoints) / BASIS_POINTS
}

function compareFeasibleOptions(left: ResourceOption, right: ResourceOption): number {
  return (
    left.directCostRappen - right.directCostRappen ||
    left.estimatedMinutes - right.estimatedMinutes ||
    left.requiredWorkers - right.requiredWorkers ||
    left.requiredVehicles - right.requiredVehicles
  )
}

function compareFallbackOptions(left: ResourceOption, right: ResourceOption): number {
  return compareFeasibleOptions(left, right) || left.estimatedMinutes - right.estimatedMinutes
}

export function deriveOperationalPlan({ move, pricingVersion, services }: CalculateQuoteInput): OperationalPlan {
  const accessMultiplierBasisPoints = Math.round(
    (getAccessMultiplierBasisPoints(move.fromAccess, pricingVersion) +
      getAccessMultiplierBasisPoints(move.toAccess, pricingVersion)) /
      2,
  )
  const moveTypeMultiplierBasisPoints = getMoveTypeMultiplierBasisPoints(move.moveType, pricingVersion)
  const selectedServices = services.filter((service) => move.selectedServiceIds.includes(service.id))
  const serviceMinutes = selectedServices.reduce((sum, service) => sum + service.addedMinutes, 0)
  const specialtyMinutes =
    (move.specialtyItems.piano ? pricingVersion.pianoAddedMinutes : 0) +
    (move.specialtyItems.safe ? pricingVersion.safeAddedMinutes : 0)
  const inventoryHandlingMinutes =
    (move.volumeM3 * pricingVersion.volumeMinutesPerM3 + move.boxes * pricingVersion.boxHandlingMinutesPerBox) *
    (accessMultiplierBasisPoints / BASIS_POINTS) *
    (moveTypeMultiplierBasisPoints / BASIS_POINTS)
  const scalableHandlingMinutesAtBaseTeam = inventoryHandlingMinutes + serviceMinutes + specialtyMinutes

  const billableDistancePerJourneyKm = Math.ceil(
    (move.distanceKm * pricingVersion.routeDistanceMultiplierBasisPoints) / BASIS_POINTS +
      pricingVersion.depotAllowanceKm,
  )
  const routeMinutesPerJourney =
    move.routeSource === 'google' && move.routeDurationMinutes !== null
      ? Math.ceil(
          (move.routeDurationMinutes * pricingVersion.routeDistanceMultiplierBasisPoints) / BASIS_POINTS +
            pricingVersion.depotAllowanceKm * pricingVersion.travelMinutesPerKm,
        )
      : billableDistancePerJourneyKm * pricingVersion.travelMinutesPerKm
  const requiredJourneys = Math.max(1, Math.ceil(move.volumeM3 / pricingVersion.vehicleCapacityM3))
  const minimumVehicles = Math.max(1, Math.ceil(requiredJourneys / pricingVersion.maxTripsPerVehicle))
  const workerOptions = [
    ...new Set([pricingVersion.baseWorkers, pricingVersion.mediumTeamWorkers, pricingVersion.largeTeamWorkers]),
  ].sort((left, right) => left - right)
  const resourceOptions: ResourceOption[] = []

  for (let requiredVehicles = minimumVehicles; requiredVehicles <= requiredJourneys; requiredVehicles += 1) {
    const tripsPerVehicle = Math.ceil(requiredJourneys / requiredVehicles)
    if (tripsPerVehicle > pricingVersion.maxTripsPerVehicle) {
      continue
    }

    for (const requiredWorkers of workerOptions) {
      const effectiveWorkers = getEffectiveWorkers(
        requiredWorkers,
        pricingVersion.baseWorkers,
        pricingVersion.additionalWorkerEfficiencyBasisPoints,
      )
      const handlingMinutes = Math.ceil(
        pricingVersion.baseHandlingMinutes +
          scalableHandlingMinutesAtBaseTeam * (pricingVersion.baseWorkers / effectiveWorkers),
      )
      const travelMinutes = Math.ceil(
        routeMinutesPerJourney * tripsPerVehicle + pricingVersion.additionalTripMinutes * (tripsPerVehicle - 1),
      )
      const estimatedMinutes = roundMinutesToInterval(
        handlingMinutes + travelMinutes,
        pricingVersion.billingIntervalMinutes,
      )
      const billableDistanceKm = billableDistancePerJourneyKm * requiredJourneys
      const directCostRappen = Math.round(
        (estimatedMinutes / MINUTES_PER_HOUR) * requiredWorkers * pricingVersion.workerHourlyRateRappen +
          (estimatedMinutes / MINUTES_PER_HOUR) * requiredVehicles * pricingVersion.vehicleHourlyRateRappen +
          billableDistanceKm * pricingVersion.distanceRateRappen,
      )

      resourceOptions.push({
        accessMultiplierBasisPoints,
        moveTypeMultiplierBasisPoints,
        handlingMinutes,
        travelMinutes,
        estimatedMinutes,
        requiredWorkers,
        requiredVehicles,
        requiredJourneys,
        tripsPerVehicle,
        billableDistanceKm,
        directCostRappen,
      })
    }
  }

  const feasibleOptions = resourceOptions.filter(
    (option) => option.estimatedMinutes <= pricingVersion.targetMoveDurationMinutes,
  )
  const selectedOption =
    feasibleOptions.sort(compareFeasibleOptions)[0] ??
    resourceOptions.sort(
      (left, right) => left.estimatedMinutes - right.estimatedMinutes || compareFallbackOptions(left, right),
    )[0]

  if (!selectedOption) {
    throw new Error('No feasible operational plan could be derived.')
  }

  const { directCostRappen: _directCostRappen, ...plan } = selectedOption
  return plan
}
