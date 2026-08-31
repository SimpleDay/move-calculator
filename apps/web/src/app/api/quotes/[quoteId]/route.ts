import { getCustomerQuoteState } from '@/features/quotes/business/quoteService'
import { getTenantConfigBySlug } from '@/features/tenants/business/tenantService'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const querySchema = z.object({
  tenantSlug: z.string().min(1).max(100),
  accessToken: z.string().min(20).max(200),
})

export async function GET(request: Request, context: RouteContext<'/api/quotes/[quoteId]'>) {
  const { quoteId } = await context.params
  const url = new URL(request.url)
  const parsed = querySchema.safeParse({
    tenantSlug: url.searchParams.get('tenantSlug'),
    accessToken: url.searchParams.get('accessToken'),
  })
  if (!parsed.success) {
    return NextResponse.json({ message: 'Die Offerte konnte nicht geladen werden.' }, { status: 400 })
  }
  const tenant = await getTenantConfigBySlug(parsed.data.tenantSlug)
  if (!tenant) {
    return NextResponse.json({ message: 'Das Zügelunternehmen wurde nicht gefunden.' }, { status: 404 })
  }
  const state = await getCustomerQuoteState(tenant.id, quoteId, parsed.data.accessToken)
  return state
    ? NextResponse.json(state)
    : NextResponse.json({ message: 'Die Offerte wurde nicht gefunden.' }, { status: 404 })
}
