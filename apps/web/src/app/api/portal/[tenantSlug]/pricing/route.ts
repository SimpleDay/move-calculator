import { pricingConfigurationSchema } from '@/features/pricing/model/pricingConfiguration'
import { saveTenantPricingDraft } from '@/features/tenants/business/tenantService'
import { isDemoPortalEnabled } from '@/features/tenants/server/demoPortalAccess'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, context: RouteContext<'/api/portal/[tenantSlug]/pricing'>) {
  if (!isDemoPortalEnabled()) {
    return NextResponse.json({ message: 'Der Demozugang ist deaktiviert.' }, { status: 401 })
  }
  const parsed = pricingConfigurationSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? 'Die Preiskonfiguration ist ungültig.' },
      { status: 400 },
    )
  }
  const { tenantSlug } = await context.params
  const state = await saveTenantPricingDraft(tenantSlug, parsed.data)
  return state
    ? NextResponse.json(state)
    : NextResponse.json({ message: 'Das Zügelunternehmen wurde nicht gefunden.' }, { status: 404 })
}
