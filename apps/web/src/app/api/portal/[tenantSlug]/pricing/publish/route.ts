import { publishTenantPricingDraft } from '@/features/tenants/business/tenantService'
import { isDemoPortalEnabled } from '@/features/tenants/server/demoPortalAccess'
import { NextResponse } from 'next/server'

export async function POST(_request: Request, context: RouteContext<'/api/portal/[tenantSlug]/pricing/publish'>) {
  if (!isDemoPortalEnabled()) {
    return NextResponse.json({ message: 'Der Demozugang ist deaktiviert.' }, { status: 401 })
  }
  const { tenantSlug } = await context.params
  const state = await publishTenantPricingDraft(tenantSlug)
  return state
    ? NextResponse.json(state)
    : NextResponse.json({ message: 'Das Zügelunternehmen wurde nicht gefunden.' }, { status: 404 })
}
