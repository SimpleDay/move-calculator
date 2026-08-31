import type { ServiceDefinition, ServiceId } from '@/features/tenants/model/tenantConfig'
import type { PricingProfileSnapshot } from './pricingProfile'

export type { PricingProfileSettings, PricingProfileSnapshot } from './pricingProfile'

export type LiftType = 'large' | 'none' | 'small'

export type InventoryEstimationMethod = 'manual' | 'photo' | 'quick'
export type RouteEstimationSource = 'google' | 'manual'

export type AccessInput = {
  floor: number
  lift: LiftType
  carryDistanceM: number
}

export type ConfirmedMoveInput = {
  moveType: 'apartment' | 'business' | 'house'
  moveDate: string
  distanceKm: number
  routeDurationMinutes: number | null
  routeSource: RouteEstimationSource
  inventoryMethod: InventoryEstimationMethod
  rooms: number
  volumeM3: number
  boxes: number
  fromAccess: AccessInput
  toAccess: AccessInput
  specialtyItems: {
    piano: boolean
    safe: boolean
  }
  selectedServiceIds: ServiceId[]
}

export type PriceComponentId =
  | 'distance'
  | 'highSeasonSurcharge'
  | 'labor'
  | 'minimumAdjustment'
  | 'rounding'
  | 'shortNoticeSurcharge'
  | 'specialtyItems'
  | 'vat'
  | 'vehicle'
  | 'weekendSurcharge'
  | `service:${ServiceId}`

export type PriceComponent = {
  id: PriceComponentId
  amountRappen: number
  customerLabel: string
  explanation: string
  visibleToCustomer: boolean
}

export type QuoteAssumption = {
  id: string
  text: string
}

export type QuoteAccuracyFactorId = 'inventory-volume' | 'resource-plan' | 'route-duration'

export type QuoteAccuracyFactor = {
  id: QuoteAccuracyFactorId
  title: string
  description: string
  impactRappen: number
  needsReview: boolean
}

export type QuoteAccuracy = {
  level: 'high' | 'low' | 'medium'
  minTotalRappen: number
  maxTotalRappen: number
  spreadRappen: number
  reviewRecommended: boolean
  factors: QuoteAccuracyFactor[]
}

export type OperationalPlan = {
  accessMultiplierBasisPoints: number
  moveTypeMultiplierBasisPoints: number
  handlingMinutes: number
  travelMinutes: number
  estimatedMinutes: number
  requiredWorkers: number
  requiredVehicles: number
  requiredJourneys: number
  tripsPerVehicle: number
  billableDistanceKm: number
}

export type QuoteCalculation = {
  pricingVersionId: string
  pricingVersion: number
  currency: 'CHF'
  subtotalRappen: number
  vatRappen: number
  totalRappen: number
  estimatedMinutes: number
  handlingMinutes: number
  travelMinutes: number
  requiredWorkers: number
  requiredVehicles: number
  requiredJourneys: number
  tripsPerVehicle: number
  components: PriceComponent[]
  assumptions: QuoteAssumption[]
  accuracy: QuoteAccuracy
}

export type CalculateQuoteInput = {
  calculationDate: string
  move: ConfirmedMoveInput
  pricingVersion: PricingProfileSnapshot
  services: ServiceDefinition[]
}
