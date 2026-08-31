import { pricingProfileSnapshotSchema, type PricingProfileSnapshot } from '@/features/pricing/model/pricingProfile'
import { z } from 'zod'

export const serviceIds = ['assembly', 'cleaning', 'disposal', 'packing'] as const
export type ServiceId = (typeof serviceIds)[number]

export const serviceDefinitionSchema = z.object({
  id: z.enum(serviceIds),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  priceType: z.enum(['fixed', 'perM3', 'perRoom']),
  unitPriceRappen: z.number().int().min(0).max(100_000_000),
  addedMinutes: z.number().int().min(0).max(10_000),
})

export type ServiceDefinition = z.infer<typeof serviceDefinitionSchema>

export type TenantBranding = {
  accentColor: string
  initials: string
  name: string
  promise: string
}

export type TenantConfig = {
  id: string
  slug: string
  branding: TenantBranding
  contact: {
    phoneRequired: boolean
  }
  pricing: PricingProfileSnapshot
  services: ServiceDefinition[]
}

export const tenantConfigSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1).max(100),
  branding: z.object({
    accentColor: z.string().regex(/^#[0-9a-f]{6}$/i),
    initials: z.string().min(1).max(4),
    name: z.string().min(1).max(120),
    promise: z.string().min(1).max(200),
  }),
  contact: z.object({
    phoneRequired: z.boolean(),
  }),
  pricing: pricingProfileSnapshotSchema,
  services: z.array(serviceDefinitionSchema).max(serviceIds.length),
})

export type PublicTenantConfig = {
  id: string
  slug: string
  branding: TenantBranding
  contact: TenantConfig['contact']
  services: Pick<ServiceDefinition, 'description' | 'id' | 'name'>[]
}

export function toPublicTenantConfig(tenant: TenantConfig): PublicTenantConfig {
  return {
    id: tenant.id,
    slug: tenant.slug,
    branding: tenant.branding,
    contact: tenant.contact,
    services: tenant.services.map(({ id, name, description }) => ({ id, name, description })),
  }
}
