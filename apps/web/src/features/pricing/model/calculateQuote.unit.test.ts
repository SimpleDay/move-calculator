import { demoTenant } from '@/features/tenants/model/demoTenant'
import { describe, expect, test } from 'vitest'
import { calculateQuote } from './calculateQuote'
import type { ConfirmedMoveInput } from './types'

const standardMove = {
  moveType: 'apartment',
  moveDate: '2026-09-16',
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
  selectedServiceIds: ['assembly'],
} satisfies ConfirmedMoveInput

describe('calculateQuote', () => {
  test('calculates a reproducible quote with transparent operational estimates', () => {
    const result = calculateQuote({
      calculationDate: '2026-08-30',
      move: standardMove,
      pricingVersion: demoTenant.pricing,
      services: demoTenant.services,
    })

    expect(result).toMatchObject({
      currency: 'CHF',
      pricingVersion: 1,
      requiredWorkers: 3,
      requiredVehicles: 1,
      estimatedMinutes: 450,
      handlingMinutes: 353,
      travelMinutes: 90,
      subtotalRappen: 230_000,
      vatRappen: 18_630,
      totalRappen: 249_000,
    })
    expect(result.components.map((component) => component.id)).toEqual([
      'labor',
      'vehicle',
      'distance',
      'service:assembly',
      'vat',
      'rounding',
    ])
  })

  test('applies minimum price and keeps the adjustment internal', () => {
    const result = calculateQuote({
      calculationDate: '2026-08-30',
      move: {
        ...standardMove,
        moveDate: '2026-10-14',
        distanceKm: 1,
        rooms: 1,
        volumeM3: 1,
        selectedServiceIds: [],
        fromAccess: { floor: 0, lift: 'large', carryDistanceM: 5 },
        toAccess: { floor: 0, lift: 'large', carryDistanceM: 5 },
      },
      pricingVersion: demoTenant.pricing,
      services: demoTenant.services,
    })

    expect(result.subtotalRappen).toBe(demoTenant.pricing.minimumPriceRappen)
    expect(result.components.find((component) => component.id === 'minimumAdjustment')).toMatchObject({
      visibleToCustomer: false,
    })
  })

  test('prices weekend, high season and specialty handling from explicit rules', () => {
    const result = calculateQuote({
      calculationDate: '2027-05-01',
      move: {
        ...standardMove,
        moveDate: '2027-06-05',
        specialtyItems: { piano: true, safe: true },
      },
      pricingVersion: demoTenant.pricing,
      services: demoTenant.services,
    })

    expect(result.components.map((component) => component.id)).toEqual(
      expect.arrayContaining(['specialtyItems', 'weekendSurcharge', 'highSeasonSurcharge']),
    )
    expect(result.totalRappen).toBeGreaterThan(standardMove.volumeM3 * 10_000)
  })

  test('uses tenant-configured team, access and billing rules instead of hidden constants', () => {
    const configured = calculateQuote({
      calculationDate: '2026-08-30',
      move: standardMove,
      pricingVersion: {
        ...demoTenant.pricing,
        baseWorkers: 1,
        mediumTeamWorkers: 2,
        largeTeamWorkers: 3,
        targetMoveDurationMinutes: 1_000,
        billingIntervalMinutes: 60,
        floorSurchargeSmallLiftBasisPoints: 0,
      },
      services: demoTenant.services,
    })

    expect(configured.requiredWorkers).toBe(1)
    expect(configured.estimatedMinutes % 60).toBe(0)
    expect(configured.totalRappen).toBeLessThan(290_000)
  })

  test('uses the measured Google duration, boxes and move type in the operational plan', () => {
    const fixedTeamPricing = {
      ...demoTenant.pricing,
      mediumTeamWorkers: demoTenant.pricing.baseWorkers,
      largeTeamWorkers: demoTenant.pricing.baseWorkers,
      targetMoveDurationMinutes: 1_000,
    }
    const baseline = calculateQuote({
      calculationDate: '2026-08-30',
      move: { ...standardMove, boxes: 0, selectedServiceIds: [] },
      pricingVersion: fixedTeamPricing,
      services: demoTenant.services,
    })
    const complexMove = calculateQuote({
      calculationDate: '2026-08-30',
      move: {
        ...standardMove,
        moveType: 'business',
        routeDurationMinutes: 90,
        selectedServiceIds: [],
      },
      pricingVersion: fixedTeamPricing,
      services: demoTenant.services,
    })

    expect(complexMove.handlingMinutes).toBeGreaterThan(baseline.handlingMinutes)
    expect(complexMove.travelMinutes).toBeGreaterThan(baseline.travelMinutes)
    expect(complexMove.totalRappen).toBeGreaterThan(baseline.totalRappen)
  })

  test('selects a second trip instead of forcing a second vehicle when the plan remains feasible', () => {
    const result = calculateQuote({
      calculationDate: '2026-08-30',
      move: {
        ...standardMove,
        distanceKm: 5,
        routeDurationMinutes: 8,
        volumeM3: 26.1,
        boxes: 20,
        selectedServiceIds: [],
      },
      pricingVersion: { ...demoTenant.pricing, targetMoveDurationMinutes: 600 },
      services: demoTenant.services,
    })

    expect(result).toMatchObject({
      requiredJourneys: 2,
      requiredVehicles: 1,
      tripsPerVehicle: 2,
    })
  })

  test('flags uncertainty when the plausible volume range changes the resource plan', () => {
    const result = calculateQuote({
      calculationDate: '2026-08-30',
      move: { ...standardMove, inventoryMethod: 'quick' },
      pricingVersion: demoTenant.pricing,
      services: demoTenant.services,
    })

    expect(result.accuracy.reviewRecommended).toBe(true)
    expect(result.accuracy.maxTotalRappen).toBeGreaterThan(result.totalRappen)
    expect(result.accuracy.factors).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'resource-plan', needsReview: true })]),
    )
  })

  test('assigns a tighter range to manual inventory than to a quick estimate', () => {
    const manual = calculateQuote({
      calculationDate: '2026-08-30',
      move: standardMove,
      pricingVersion: demoTenant.pricing,
      services: demoTenant.services,
    })
    const quick = calculateQuote({
      calculationDate: '2026-08-30',
      move: { ...standardMove, inventoryMethod: 'quick' },
      pricingVersion: demoTenant.pricing,
      services: demoTenant.services,
    })

    expect(quick.accuracy.spreadRappen).toBeGreaterThan(manual.accuracy.spreadRappen)
  })
})
