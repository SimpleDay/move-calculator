import { describe, expect, test } from 'vitest'
import { quoteCalculationSchema } from './quoteCalculation'

describe('quoteCalculationSchema', () => {
  test('keeps persisted quotes from before accuracy assessments readable', () => {
    const calculation = quoteCalculationSchema.parse({
      pricingVersionId: 'pricing-v1',
      pricingVersion: 1,
      currency: 'CHF',
      subtotalRappen: 100_000,
      vatRappen: 8_100,
      totalRappen: 109_000,
      estimatedMinutes: 240,
      requiredWorkers: 2,
      requiredVehicles: 1,
      components: [],
      assumptions: [],
    })

    expect(calculation).toMatchObject({
      handlingMinutes: 240,
      travelMinutes: 0,
      requiredJourneys: 1,
      tripsPerVehicle: 1,
      accuracy: {
        level: 'medium',
        minTotalRappen: 109_000,
        maxTotalRappen: 109_000,
        reviewRecommended: false,
      },
    })
  })
})
