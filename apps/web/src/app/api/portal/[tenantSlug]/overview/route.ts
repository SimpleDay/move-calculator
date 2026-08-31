import { listTenantQuotes } from '@/features/quotes/business/quoteService'
import { getTenantConfigBySlug, getTenantPricingState } from '@/features/tenants/business/tenantService'
import { isDemoPortalEnabled } from '@/features/tenants/server/demoPortalAccess'
import { NextResponse } from 'next/server'

export async function GET(_request: Request, context: RouteContext<'/api/portal/[tenantSlug]/overview'>) {
  if (!isDemoPortalEnabled()) {
    return NextResponse.json({ message: 'Der Demozugang ist deaktiviert.' }, { status: 401 })
  }
  const { tenantSlug } = await context.params
  const [tenant, pricing] = await Promise.all([getTenantConfigBySlug(tenantSlug), getTenantPricingState(tenantSlug)])
  if (!tenant || !pricing) {
    return NextResponse.json({ message: 'Das Zügelunternehmen wurde nicht gefunden.' }, { status: 404 })
  }
  return NextResponse.json({
    quotes: await listTenantQuotes(tenant.id),
    pricing,
  })
}
