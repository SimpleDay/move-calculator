import { serviceDefinitionSchema } from '@/features/tenants/model/tenantConfig'
import { z } from 'zod'
import { pricingProfileSettingsSchema } from './pricingProfile'

export const pricingConfigurationSchema = z
  .object({
    settings: pricingProfileSettingsSchema,
    services: z.array(serviceDefinitionSchema).min(1).max(12),
  })
  .superRefine(({ settings, services }, context) => {
    if (settings.mediumTeamWorkers < settings.baseWorkers || settings.largeTeamWorkers < settings.mediumTeamWorkers) {
      context.addIssue({
        code: 'custom',
        message: 'Die Teamgrösse darf mit zunehmendem Volumen nicht kleiner werden.',
        path: ['settings', 'largeTeamWorkers'],
      })
    }
    if (settings.targetMoveDurationMinutes < settings.billingIntervalMinutes) {
      context.addIssue({
        code: 'custom',
        message: 'Die maximale Einsatzdauer muss mindestens ein Abrechnungsintervall umfassen.',
        path: ['settings', 'targetMoveDurationMinutes'],
      })
    }
    if (new Set(services.map((service) => service.id)).size !== services.length) {
      context.addIssue({
        code: 'custom',
        message: 'Jede Zusatzleistung darf nur einmal vorkommen.',
        path: ['services'],
      })
    }
  })

export type PricingConfiguration = z.infer<typeof pricingConfigurationSchema>

export type TenantPricingState = PricingConfiguration & {
  activeProfileId: string
  activeVersion: number
  hasUnpublishedChanges: boolean
  publishedAt: string
}
