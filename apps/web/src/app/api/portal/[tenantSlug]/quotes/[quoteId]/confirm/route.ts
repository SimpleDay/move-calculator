import { confirmTenantQuote } from '@/features/quotes/business/quoteService'
import { getTenantConfigBySlug } from '@/features/tenants/business/tenantService'
import { isDemoPortalEnabled } from '@/features/tenants/server/demoPortalAccess'
import { NextResponse } from 'next/server'

export async function POST(
  _request: Request,
  context: RouteContext<'/api/portal/[tenantSlug]/quotes/[quoteId]/confirm'>,
) {
  if (!isDemoPortalEnabled()) {
    return NextResponse.json({ message: 'Der Demozugang ist deaktiviert.' }, { status: 401 })
  }
  const { tenantSlug, quoteId } = await context.params
  const tenant = await getTenantConfigBySlug(tenantSlug)
  if (!tenant) {
    return NextResponse.json({ message: 'Das Zügelunternehmen wurde nicht gefunden.' }, { status: 404 })
  }
  const confirmed = await confirmTenantQuote(tenant.id, quoteId)
  return confirmed
    ? NextResponse.json({ confirmed: true })
    : NextResponse.json({ message: 'Die Offerte ist nicht mehr zur Bestätigung bereit.' }, { status: 409 })
}
