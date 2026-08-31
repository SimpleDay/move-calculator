import type { PricingConfiguration, TenantPricingState } from '@/features/pricing/model/pricingConfiguration'
import type { QuoteRecord } from '@/features/quotes/model/quoteRecord'

export type PortalOverview = {
  quotes: QuoteRecord[]
  pricing: TenantPricingState
}

export class PortalRequestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PortalRequestError'
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as { message?: string } | null
    throw new PortalRequestError(error?.message ?? 'Das Unternehmensportal konnte nicht geladen werden.')
  }
  return (await response.json()) as T
}

export async function fetchPortalOverview(tenantSlug: string): Promise<PortalOverview> {
  return await parseResponse<PortalOverview>(
    await fetch(`/api/portal/${encodeURIComponent(tenantSlug)}/overview`, { cache: 'no-store' }),
  )
}

export async function savePortalPricing(
  tenantSlug: string,
  configuration: PricingConfiguration,
): Promise<TenantPricingState> {
  return await parseResponse<TenantPricingState>(
    await fetch(`/api/portal/${encodeURIComponent(tenantSlug)}/pricing`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(configuration),
    }),
  )
}

export async function publishPortalPricing(tenantSlug: string): Promise<TenantPricingState> {
  return await parseResponse<TenantPricingState>(
    await fetch(`/api/portal/${encodeURIComponent(tenantSlug)}/pricing/publish`, { method: 'POST' }),
  )
}

export async function confirmPortalQuote(tenantSlug: string, quoteId: string): Promise<void> {
  await parseResponse<{ confirmed: true }>(
    await fetch(`/api/portal/${encodeURIComponent(tenantSlug)}/quotes/${encodeURIComponent(quoteId)}/confirm`, {
      method: 'POST',
    }),
  )
}
