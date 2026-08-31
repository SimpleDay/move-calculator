import { requestQuoteConfirmation } from '@/features/quotes/business/quoteService'
import { getTenantConfigBySlug } from '@/features/tenants/business/tenantService'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const requestSchema = z.object({
  tenantSlug: z.string().min(1).max(100),
  accessToken: z.string().min(20).max(200),
  revision: z.number().int().min(1),
})

export async function POST(request: Request, context: RouteContext<'/api/quotes/[quoteId]/confirmation'>) {
  const { quoteId } = await context.params
  const parsed = requestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ message: 'Die Bestätigungsanfrage ist ungültig.' }, { status: 400 })
  }
  const tenant = await getTenantConfigBySlug(parsed.data.tenantSlug)
  if (!tenant) {
    return NextResponse.json({ message: 'Das Zügelunternehmen wurde nicht gefunden.' }, { status: 404 })
  }
  const state = await requestQuoteConfirmation(tenant.id, quoteId, parsed.data.accessToken, parsed.data.revision)
  return state
    ? NextResponse.json(state)
    : NextResponse.json({ message: 'Die Offerte wurde inzwischen geändert. Bitte laden Sie sie neu.' }, { status: 409 })
}
