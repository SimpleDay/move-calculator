import { z } from 'zod'

const rappenSchema = z.number().int().min(0).max(100_000_000)
const basisPointsSchema = z.number().int().min(0).max(100_000)

export const pricingProfileSettingsSchema = z.object({
  currency: z.literal('CHF'),
  minimumPriceRappen: rappenSchema,
  workerHourlyRateRappen: rappenSchema,
  vehicleHourlyRateRappen: rappenSchema,
  distanceRateRappen: rappenSchema,
  depotAllowanceKm: z.number().int().min(0).max(1_000),
  routeDistanceMultiplierBasisPoints: basisPointsSchema,
  baseHandlingMinutes: z.number().int().min(0).max(10_000),
  volumeMinutesPerM3: z.number().min(0).max(1_000),
  boxHandlingMinutesPerBox: z.number().min(0).max(100).default(0.8),
  apartmentHandlingMultiplierBasisPoints: basisPointsSchema.default(10_000),
  houseHandlingMultiplierBasisPoints: basisPointsSchema.default(10_800),
  businessHandlingMultiplierBasisPoints: basisPointsSchema.default(11_500),
  travelMinutesPerKm: z.number().min(0).max(100),
  billingIntervalMinutes: z.number().int().min(1).max(120),
  targetMoveDurationMinutes: z.number().int().min(60).max(1_440).default(480),
  additionalWorkerEfficiencyBasisPoints: z.number().int().min(1_000).max(10_000).default(8_500),
  vehicleCapacityM3: z.number().min(1).max(1_000),
  maxTripsPerVehicle: z.number().int().min(1).max(10).default(2),
  additionalTripMinutes: z.number().int().min(0).max(1_000).default(30),
  baseWorkers: z.number().int().min(1).max(20),
  mediumTeamWorkers: z.number().int().min(1).max(20),
  largeTeamWorkers: z.number().int().min(1).max(20),
  includedCarryDistanceM: z.number().int().min(0).max(1_000),
  carryDistanceStepM: z.number().int().min(1).max(1_000),
  carryDistanceSurchargeBasisPointsPerStep: basisPointsSchema,
  floorSurchargeNoLiftBasisPoints: basisPointsSchema,
  floorSurchargeSmallLiftBasisPoints: basisPointsSchema,
  floorSurchargeLargeLiftBasisPoints: basisPointsSchema,
  weekendSurchargeBasisPoints: basisPointsSchema,
  shortNoticeDays: z.number().int().min(0).max(365),
  shortNoticeSurchargeBasisPoints: basisPointsSchema,
  highSeasonMonths: z.array(z.number().int().min(1).max(12)).max(12),
  highSeasonSurchargeBasisPoints: basisPointsSchema,
  pianoSurchargeRappen: rappenSchema,
  pianoAddedMinutes: z.number().int().min(0).max(10_000),
  safeSurchargeRappen: rappenSchema,
  safeAddedMinutes: z.number().int().min(0).max(10_000),
  quickVolumeUncertaintyBasisPoints: z.number().int().min(0).max(5_000).default(2_500),
  photoVolumeUncertaintyBasisPoints: z.number().int().min(0).max(5_000).default(1_500),
  manualVolumeUncertaintyBasisPoints: z.number().int().min(0).max(5_000).default(1_000),
  googleRouteUncertaintyBasisPoints: z.number().int().min(0).max(5_000).default(500),
  manualRouteUncertaintyBasisPoints: z.number().int().min(0).max(5_000).default(1_500),
  reviewImpactThresholdRappen: rappenSchema.default(15_000),
  reviewImpactThresholdBasisPoints: z.number().int().min(0).max(10_000).default(800),
  vatBasisPoints: basisPointsSchema,
  roundingIncrementRappen: z.number().int().min(1).max(1_000_000),
})

export const pricingProfileSnapshotSchema = pricingProfileSettingsSchema.extend({
  id: z.string().min(1).max(100),
  version: z.number().int().min(1).max(100_000),
})

export type PricingProfileSettings = z.infer<typeof pricingProfileSettingsSchema>
export type PricingProfileSnapshot = z.infer<typeof pricingProfileSnapshotSchema>

export function toPricingProfileSettings(snapshot: PricingProfileSnapshot): PricingProfileSettings {
  const { id: _id, version: _version, ...settings } = snapshot
  return settings
}
