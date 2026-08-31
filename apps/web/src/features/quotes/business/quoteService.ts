import { di } from '@/di'
import { calculateQuote, quoteCalculationSchema, type QuoteCalculation } from '@/features/pricing/model'
import { quoteDraftSchema, toConfirmedMoveInput, type QuoteDraft } from '@/features/quoteFlow/model'
import type { CustomerQuoteState, QuoteRecord } from '@/features/quotes/model/quoteRecord'
import type { TenantConfig } from '@/features/tenants/model/tenantConfig'
import { createInject } from '@/lib/di/createInject'
import type { TransactionalOperations } from '@/lib/tx'
import type { Quote, QuoteRevision } from '@/payload-types'
import { createHash, randomBytes } from 'node:crypto'

type PersistedCalculation = {
  quoteId: string
  accessToken: string
  revision: number
  calculation: QuoteCalculation
}

function relationshipId(value: string | { id: string }): string {
  return typeof value === 'string' ? value : value.id
}

function hashAccessToken(accessToken: string): string {
  return createHash('sha256').update(accessToken).digest('hex')
}

async function getDependencies() {
  const inject = await createInject()
  return {
    localApi: inject(di.localApi),
    runInTransaction: inject(di.transactionRunner),
  }
}

async function findCustomerQuote(
  localApi: TransactionalOperations,
  tenantId: string,
  quoteId: string,
  accessToken: string,
): Promise<Quote | null> {
  return await localApi.findOne({
    collection: 'quotes',
    depth: 1,
    where: {
      and: [
        { id: { equals: quoteId } },
        { tenant: { equals: tenantId } },
        { accessTokenHash: { equals: hashAccessToken(accessToken) } },
      ],
    },
  })
}

async function loadRevision(
  localApi: TransactionalOperations,
  value: string | QuoteRevision | null | undefined,
): Promise<QuoteRevision | null> {
  if (!value) {
    return null
  }
  if (typeof value !== 'string') {
    return value
  }
  return await localApi.findByID({ collection: 'quote-revisions', id: value, depth: 0 })
}

function canonicalRevisionDraft(draft: QuoteDraft, quoteId: string, revision: number): QuoteDraft {
  return {
    ...draft,
    quoteId,
    accessToken: null,
    currentStep: 'result',
    revision,
    status: 'calculated',
  }
}

export async function calculateAndPersistQuote(tenant: TenantConfig, draft: QuoteDraft): Promise<PersistedCalculation> {
  const calculation = calculateQuote({
    calculationDate: new Date().toISOString().slice(0, 10),
    move: toConfirmedMoveInput(draft),
    pricingVersion: tenant.pricing,
    services: tenant.services,
  })
  const { localApi, runInTransaction } = await getDependencies()
  return await runInTransaction(async () => {
    const existingQuote =
      draft.quoteId && draft.accessToken
        ? await findCustomerQuote(localApi, tenant.id, draft.quoteId, draft.accessToken)
        : null
    if (draft.quoteId && draft.accessToken && !existingQuote) {
      throw new Error('QUOTE_ACCESS_DENIED')
    }

    const accessToken = existingQuote ? draft.accessToken! : randomBytes(32).toString('base64url')
    const quote =
      existingQuote ??
      (await localApi.create({
        collection: 'quotes',
        data: {
          tenant: tenant.id,
          status: 'draft',
          accessTokenHash: hashAccessToken(accessToken),
          customerName: `${draft.contact.firstName.trim()} ${draft.contact.lastName.trim()}`,
          contact: draft.contact,
          moveSnapshot: { ...draft, accessToken: null },
        },
      }))

    const revisions = await localApi.find({
      collection: 'quote-revisions',
      depth: 0,
      limit: 1,
      sort: '-revision',
      where: {
        and: [{ tenant: { equals: tenant.id } }, { quote: { equals: quote.id } }],
      },
    })
    const revision = (revisions.docs[0]?.revision ?? 0) + 1
    const canonicalDraft = canonicalRevisionDraft(draft, quote.id, revision)
    const revisionDocument = await localApi.create({
      collection: 'quote-revisions',
      data: {
        tenant: tenant.id,
        quote: quote.id,
        revision,
        reason: existingQuote ? 'customerChange' : 'initial',
        pricingProfile: tenant.pricing.id,
        inputSnapshot: canonicalDraft,
        calculationSnapshot: calculation,
      },
    })
    await localApi.update({
      collection: 'quotes',
      id: quote.id,
      data: {
        status: 'calculated',
        customerName: `${draft.contact.firstName.trim()} ${draft.contact.lastName.trim()}`,
        contact: draft.contact,
        moveSnapshot: canonicalDraft,
        currentRevision: revisionDocument.id,
        confirmedRevision: null,
        confirmationRequestedAt: null,
        companyConfirmedAt: null,
      },
    })

    return { quoteId: quote.id, accessToken, revision, calculation }
  })
}

export async function getCustomerQuoteState(
  tenantId: string,
  quoteId: string,
  accessToken: string,
): Promise<CustomerQuoteState | null> {
  const { localApi } = await getDependencies()
  const quote = await findCustomerQuote(localApi, tenantId, quoteId, accessToken)
  const revision = await loadRevision(localApi, quote?.currentRevision)
  if (!quote || !revision) {
    return null
  }
  return {
    quoteId: quote.id,
    revision: revision.revision,
    status: quote.status,
    calculation: quoteCalculationSchema.parse(revision.calculationSnapshot) as QuoteCalculation,
  }
}

export async function requestQuoteConfirmation(
  tenantId: string,
  quoteId: string,
  accessToken: string,
  expectedRevision: number,
): Promise<CustomerQuoteState | null> {
  const { localApi, runInTransaction } = await getDependencies()
  return await runInTransaction(async () => {
    const quote = await findCustomerQuote(localApi, tenantId, quoteId, accessToken)
    const revision = await loadRevision(localApi, quote?.currentRevision)
    if (!quote || !revision || revision.revision !== expectedRevision) {
      return null
    }
    await localApi.update({
      collection: 'quotes',
      id: quote.id,
      data: {
        status: 'confirmationRequested',
        confirmationRequestedAt: new Date().toISOString(),
      },
    })
    return {
      quoteId: quote.id,
      revision: revision.revision,
      status: 'confirmationRequested',
      calculation: quoteCalculationSchema.parse(revision.calculationSnapshot) as QuoteCalculation,
    }
  })
}

export async function listTenantQuotes(tenantId: string): Promise<QuoteRecord[]> {
  const { localApi } = await getDependencies()
  const result = await localApi.find({
    collection: 'quotes',
    depth: 1,
    limit: 100,
    sort: '-updatedAt',
    where: { tenant: { equals: tenantId } },
  })

  const records: QuoteRecord[] = []
  for (const quote of result.docs) {
    const revision = await loadRevision(localApi, quote.currentRevision)
    if (!revision) {
      continue
    }
    const parsedDraft = quoteDraftSchema.safeParse(revision.inputSnapshot)
    const parsedCalculation = quoteCalculationSchema.safeParse(revision.calculationSnapshot)
    if (!parsedDraft.success || !parsedCalculation.success) {
      continue
    }
    records.push({
      id: quote.id,
      tenantId: relationshipId(quote.tenant),
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
      draft: { ...parsedDraft.data, status: quote.status },
      calculation: parsedCalculation.data as QuoteCalculation,
    })
  }
  return records
}

export async function confirmTenantQuote(tenantId: string, quoteId: string): Promise<boolean> {
  const { localApi, runInTransaction } = await getDependencies()
  return await runInTransaction(async () => {
    const quote = await localApi.findOne({
      collection: 'quotes',
      depth: 0,
      where: {
        and: [
          { id: { equals: quoteId } },
          { tenant: { equals: tenantId } },
          { status: { equals: 'confirmationRequested' } },
        ],
      },
    })
    if (!quote?.currentRevision) {
      return false
    }
    await localApi.update({
      collection: 'quotes',
      id: quote.id,
      data: {
        status: 'companyConfirmed',
        confirmedRevision: relationshipId(quote.currentRevision),
        companyConfirmedAt: new Date().toISOString(),
      },
    })
    return true
  })
}
