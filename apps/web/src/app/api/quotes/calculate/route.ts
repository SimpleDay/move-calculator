import { customerInputSteps, isStepComplete, quoteDraftSchema, toConfirmedMoveInput } from '@/features/quoteFlow/model'
import { calculateAndPersistQuote } from '@/features/quotes/business/quoteService'
import { getTenantConfigBySlug } from '@/features/tenants/business/tenantService'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const requestSchema = z.object({
  tenantSlug: z.string().min(1).max(100),
  draft: quoteDraftSchema,
})

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: 'Die Angaben sind unvollständig oder ungültig.' }, { status: 400 })
  }

  const tenant = await getTenantConfigBySlug(parsed.data.tenantSlug)
  if (!tenant || parsed.data.draft.tenantId !== tenant.id) {
    return NextResponse.json({ message: 'Das Zügelunternehmen wurde nicht gefunden.' }, { status: 404 })
  }

  const allStepsComplete = customerInputSteps.every((step) =>
    isStepComplete(parsed.data.draft, step, tenant.contact.phoneRequired),
  )
  if (!allStepsComplete) {
    return NextResponse.json({ message: 'Bitte vervollständigen Sie alle Angaben.' }, { status: 400 })
  }

  // Validate the conversion before opening the persistence transaction.
  toConfirmedMoveInput(parsed.data.draft)
  try {
    return NextResponse.json(await calculateAndPersistQuote(tenant, parsed.data.draft))
  } catch (error) {
    if (error instanceof Error && error.message === 'QUOTE_ACCESS_DENIED') {
      return NextResponse.json({ message: 'Die gespeicherte Offerte konnte nicht geöffnet werden.' }, { status: 403 })
    }
    throw error
  }
}
