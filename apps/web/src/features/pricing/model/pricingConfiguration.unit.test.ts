import { demoTenant } from '@/features/tenants/model/demoTenant'
import { describe, expect, test } from 'vitest'
import { pricingConfigurationSchema } from './pricingConfiguration'
import { toPricingProfileSettings } from './pricingProfile'

describe('pricingConfigurationSchema', () => {
  test('rejects contradictory team sizes and duplicate services', () => {
    const result = pricingConfigurationSchema.safeParse({
      settings: {
        ...toPricingProfileSettings(demoTenant.pricing),
        mediumTeamWorkers: demoTenant.pricing.baseWorkers - 1,
      },
      services: [demoTenant.services[0], demoTenant.services[0]],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toEqual(
        expect.arrayContaining([
          'Die Teamgrösse darf mit zunehmendem Volumen nicht kleiner werden.',
          'Jede Zusatzleistung darf nur einmal vorkommen.',
        ]),
      )
    }
  })
})
