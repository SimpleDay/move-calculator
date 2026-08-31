import { di } from '@/di'
import {
  pricingConfigurationSchema,
  type PricingConfiguration,
  type TenantPricingState,
} from '@/features/pricing/model/pricingConfiguration'
import { pricingProfileSettingsSchema, toPricingProfileSettings } from '@/features/pricing/model/pricingProfile'
import { demoTenant } from '@/features/tenants/model/demoTenant'
import { serviceDefinitionSchema, tenantConfigSchema, type TenantConfig } from '@/features/tenants/model/tenantConfig'
import { createInject } from '@/lib/di/createInject'
import type { RunInTransactionFn, TransactionalOperations } from '@/lib/tx'
import type { PricingProfile, Tenant } from '@/payload-types'
import { z } from 'zod'

const serviceListSchema = z.array(serviceDefinitionSchema).min(1).max(12)

function relationshipId(value: string | { id: string }): string {
  return typeof value === 'string' ? value : value.id
}

async function findTenantBySlug(localApi: TransactionalOperations, slug: string): Promise<Tenant | null> {
  return await localApi.findOne({
    collection: 'tenants',
    depth: 1,
    where: { slug: { equals: slug } },
  })
}

async function loadActiveProfile(localApi: TransactionalOperations, tenant: Tenant): Promise<PricingProfile | null> {
  if (!tenant.activePricingProfile) {
    return null
  }
  if (typeof tenant.activePricingProfile !== 'string') {
    return tenant.activePricingProfile
  }
  return await localApi.findByID({
    collection: 'pricing-profiles',
    id: tenant.activePricingProfile,
    depth: 0,
  })
}

async function createDemoTenant(localApi: TransactionalOperations): Promise<Tenant> {
  const existing = await findTenantBySlug(localApi, demoTenant.slug)
  if (existing) {
    return existing
  }

  const tenant = await localApi.create({
    collection: 'tenants',
    data: {
      slug: demoTenant.slug,
      name: demoTenant.branding.name,
      branding: {
        accentColor: demoTenant.branding.accentColor,
        initials: demoTenant.branding.initials,
        promise: demoTenant.branding.promise,
      },
      phoneRequired: demoTenant.contact.phoneRequired,
      pricingDraft: toPricingProfileSettings(demoTenant.pricing),
      servicesDraft: demoTenant.services,
    },
  })
  const profile = await localApi.create({
    collection: 'pricing-profiles',
    data: {
      tenant: tenant.id,
      label: 'Preisprofil v1',
      version: 1,
      settings: toPricingProfileSettings(demoTenant.pricing),
      services: demoTenant.services,
      publishedAt: new Date().toISOString(),
    },
  })
  return await localApi.update({
    collection: 'tenants',
    id: tenant.id,
    data: { activePricingProfile: profile.id },
    depth: 1,
  })
}

async function ensureTenant(
  localApi: TransactionalOperations,
  runInTransaction: RunInTransactionFn,
  slug: string,
): Promise<Tenant | null> {
  const existing = await findTenantBySlug(localApi, slug)
  if (existing || slug !== demoTenant.slug) {
    return existing
  }
  return await runInTransaction(() => createDemoTenant(localApi))
}

async function toTenantConfig(localApi: TransactionalOperations, tenant: Tenant): Promise<TenantConfig | null> {
  const profile = await loadActiveProfile(localApi, tenant)
  if (!profile) {
    return null
  }
  const settings = pricingProfileSettingsSchema.parse(profile.settings)
  const services = serviceListSchema.parse(profile.services)
  return tenantConfigSchema.parse({
    id: tenant.id,
    slug: tenant.slug,
    branding: {
      accentColor: tenant.branding.accentColor,
      initials: tenant.branding.initials,
      name: tenant.name,
      promise: tenant.branding.promise,
    },
    contact: { phoneRequired: tenant.phoneRequired },
    pricing: {
      id: profile.id,
      version: profile.version,
      ...settings,
    },
    services,
  })
}

async function getDependencies() {
  const inject = await createInject()
  return {
    localApi: inject(di.localApi),
    runInTransaction: inject(di.transactionRunner),
  }
}

export async function getTenantConfigBySlug(slug: string): Promise<TenantConfig | null> {
  const { localApi, runInTransaction } = await getDependencies()
  const tenant = await ensureTenant(localApi, runInTransaction, slug)
  return tenant ? await toTenantConfig(localApi, tenant) : null
}

export async function getTenantPricingState(slug: string): Promise<TenantPricingState | null> {
  const { localApi, runInTransaction } = await getDependencies()
  const tenant = await ensureTenant(localApi, runInTransaction, slug)
  if (!tenant) {
    return null
  }
  const profile = await loadActiveProfile(localApi, tenant)
  if (!profile) {
    return null
  }
  const draft = pricingConfigurationSchema.parse({
    settings: tenant.pricingDraft,
    services: tenant.servicesDraft,
  })
  const published = pricingConfigurationSchema.parse({
    settings: profile.settings,
    services: profile.services,
  })
  return {
    ...draft,
    activeProfileId: profile.id,
    activeVersion: profile.version,
    publishedAt: profile.publishedAt,
    hasUnpublishedChanges: JSON.stringify(draft) !== JSON.stringify(published),
  }
}

export async function saveTenantPricingDraft(
  slug: string,
  input: PricingConfiguration,
): Promise<TenantPricingState | null> {
  const parsed = pricingConfigurationSchema.parse(input)
  const { localApi, runInTransaction } = await getDependencies()
  const tenant = await ensureTenant(localApi, runInTransaction, slug)
  if (!tenant) {
    return null
  }
  await localApi.update({
    collection: 'tenants',
    id: tenant.id,
    data: {
      pricingDraft: parsed.settings,
      servicesDraft: parsed.services,
    },
  })
  return await getTenantPricingState(slug)
}

export async function publishTenantPricingDraft(slug: string): Promise<TenantPricingState | null> {
  const { localApi, runInTransaction } = await getDependencies()
  const tenant = await ensureTenant(localApi, runInTransaction, slug)
  if (!tenant) {
    return null
  }

  await runInTransaction(async () => {
    const configuration = pricingConfigurationSchema.parse({
      settings: tenant.pricingDraft,
      services: tenant.servicesDraft,
    })
    const profiles = await localApi.find({
      collection: 'pricing-profiles',
      depth: 0,
      limit: 1,
      sort: '-version',
      where: { tenant: { equals: tenant.id } },
    })
    const nextVersion = (profiles.docs[0]?.version ?? 0) + 1
    const profile = await localApi.create({
      collection: 'pricing-profiles',
      data: {
        tenant: tenant.id,
        label: `Preisprofil v${nextVersion}`,
        version: nextVersion,
        settings: configuration.settings,
        services: configuration.services,
        publishedAt: new Date().toISOString(),
      },
    })
    await localApi.update({
      collection: 'tenants',
      id: tenant.id,
      data: { activePricingProfile: profile.id },
    })
  })

  return await getTenantPricingState(slug)
}

export async function getTenantIdBySlug(slug: string): Promise<string | null> {
  const { localApi, runInTransaction } = await getDependencies()
  const tenant = await ensureTenant(localApi, runInTransaction, slug)
  return tenant ? relationshipId(tenant.id) : null
}
