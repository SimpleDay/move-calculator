import type { QuoteCalculation } from '@/features/pricing/model'
import type { QuoteDraft } from '@/features/quoteFlow/model'

export type QuoteRecord = {
  id: string
  tenantId: string
  createdAt: string
  updatedAt: string
  draft: QuoteDraft
  calculation: QuoteCalculation
}

export type CustomerQuoteState = {
  quoteId: string
  revision: number
  status: QuoteDraft['status']
  calculation: QuoteCalculation
}
