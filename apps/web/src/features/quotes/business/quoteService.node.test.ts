import { di } from '@/di'
import { createEmptyQuoteDraft, type QuoteDraft } from '@/features/quoteFlow/model'
import {
  calculateAndPersistQuote,
  confirmTenantQuote,
  getCustomerQuoteState,
  requestQuoteConfirmation,
} from '@/features/quotes/business/quoteService'
import { getTenantConfigBySlug } from '@/features/tenants/business/tenantService'
import { createInject } from '@/lib/di/createInject'
import { describe, expect, test } from 'vitest'

function completeDraft(tenantId: string): QuoteDraft {
  return {
    ...createEmptyQuoteDraft(tenantId),
    currentStep: 'contact',
    moveType: 'apartment',
    fromAddress: 'Spitalgasse 12, 3011 Bern',
    toAddress: 'Seestrasse 84, 3600 Thun',
    moveDate: '2026-10-14',
    distanceKm: 28,
    fromAccess: { floor: 2, lift: 'small', carryDistanceM: 20 },
    toAccess: { floor: 1, lift: 'large', carryDistanceM: 10 },
    inventoryMethod: 'quick',
    volumeM3: 24,
    rooms: 3.5,
    boxes: 35,
    servicesReviewed: true,
    customerAttestation: true,
    contact: {
      firstName: 'Mara',
      lastName: 'Muster',
      email: 'mara@example.ch',
      phone: '+41 79 123 45 67',
      contactConsent: true,
    },
  }
}

describe('quote persistence', () => {
  test('stores immutable revisions and confirms only the current tenant-scoped revision', async () => {
    const tenant = await getTenantConfigBySlug('alpenblick')
    expect(tenant).not.toBeNull()
    const initial = await calculateAndPersistQuote(tenant!, completeDraft(tenant!.id))
    const changedDraft: QuoteDraft = {
      ...completeDraft(tenant!.id),
      quoteId: initial.quoteId,
      accessToken: initial.accessToken,
      revision: initial.revision,
      selectedServiceIds: ['packing'],
    }
    const changed = await calculateAndPersistQuote(tenant!, changedDraft)

    expect(changed.quoteId).toBe(initial.quoteId)
    expect(changed.revision).toBe(2)
    expect(changed.calculation.totalRappen).toBeGreaterThan(initial.calculation.totalRappen)

    const inject = await createInject()
    const localApi = inject(di.localApi)
    const revisions = await localApi.find({
      collection: 'quote-revisions',
      pagination: false,
      where: { quote: { equals: initial.quoteId } },
    })
    const quote = await localApi.findByID({ collection: 'quotes', id: initial.quoteId, showHiddenFields: true })
    expect(revisions.docs.map((revision) => revision.revision).sort()).toEqual([1, 2])
    expect(quote.accessTokenHash).not.toBe(initial.accessToken)

    await expect(requestQuoteConfirmation(tenant!.id, initial.quoteId, initial.accessToken, 1)).resolves.toBeNull()
    const requested = await requestQuoteConfirmation(tenant!.id, initial.quoteId, initial.accessToken, changed.revision)
    expect(requested?.status).toBe('confirmationRequested')
    await expect(confirmTenantQuote(tenant!.id, initial.quoteId)).resolves.toBe(true)
    await expect(getCustomerQuoteState(tenant!.id, initial.quoteId, initial.accessToken)).resolves.toMatchObject({
      status: 'companyConfirmed',
      revision: 2,
    })
  })
})
