import type { QuoteCalculation } from '@/features/pricing/model'
import type { QuoteDraft } from '@/features/quoteFlow/model'
import type { CustomerQuoteState } from '@/features/quotes/model/quoteRecord'

type CalculateQuoteResponse = {
  quoteId: string
  accessToken: string
  revision: number
  calculation: QuoteCalculation
}

async function parseResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null
    throw new QuoteCalculationRequestError(body?.message ?? fallbackMessage)
  }
  return (await response.json()) as T
}

export class QuoteCalculationRequestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'QuoteCalculationRequestError'
  }
}

export async function requestQuoteCalculation(tenantSlug: string, draft: QuoteDraft): Promise<CalculateQuoteResponse> {
  const response = await fetch('/api/quotes/calculate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ tenantSlug, draft }),
  })

  return await parseResponse<CalculateQuoteResponse>(response, 'Die Offerte konnte nicht berechnet werden.')
}

export async function fetchCustomerQuote(
  tenantSlug: string,
  quoteId: string,
  accessToken: string,
): Promise<CustomerQuoteState> {
  const query = new URLSearchParams({ tenantSlug, accessToken })
  const response = await fetch(`/api/quotes/${encodeURIComponent(quoteId)}?${query}`)
  return await parseResponse<CustomerQuoteState>(response, 'Die Offerte konnte nicht geladen werden.')
}

export async function submitQuoteConfirmation(
  tenantSlug: string,
  quoteId: string,
  accessToken: string,
  revision: number,
): Promise<CustomerQuoteState> {
  const response = await fetch(`/api/quotes/${encodeURIComponent(quoteId)}/confirmation`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ tenantSlug, accessToken, revision }),
  })
  return await parseResponse<CustomerQuoteState>(response, 'Die Bestätigung konnte nicht angefragt werden.')
}
