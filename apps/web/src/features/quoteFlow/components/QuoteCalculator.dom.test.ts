import { calculateQuote, formatMoneyRappen } from '@/features/pricing/model'
import { createEmptyQuoteDraft, saveQuoteDraft } from '@/features/quoteFlow/model'
import { demoTenant } from '@/features/tenants/model/demoTenant'
import { toPublicTenantConfig } from '@/features/tenants/model/tenantConfig'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { QuoteCalculator } from './QuoteCalculator'

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test('keeps the price hidden until the valid contact gate is submitted', async () => {
  const draft = {
    ...createEmptyQuoteDraft(demoTenant.id),
    currentStep: 'contact' as const,
    moveType: 'apartment' as const,
    fromAddress: 'Spitalgasse 12, Bern',
    toAddress: 'Seestrasse 84, Thun',
    moveDate: '2026-10-14',
    distanceKm: 28,
    fromAccess: { floor: 2, lift: 'small' as const, carryDistanceM: 20 },
    toAccess: { floor: 1, lift: 'large' as const, carryDistanceM: 10 },
    inventoryMethod: 'quick' as const,
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
  saveQuoteDraft(window.localStorage, draft)
  const calculation = calculateQuote({
    calculationDate: '2026-08-30',
    move: {
      moveType: 'apartment',
      moveDate: draft.moveDate,
      distanceKm: draft.distanceKm,
      routeDurationMinutes: draft.routeDurationMinutes,
      routeSource: draft.routeSource,
      inventoryMethod: draft.inventoryMethod,
      rooms: draft.rooms,
      volumeM3: draft.volumeM3,
      boxes: draft.boxes,
      fromAccess: { floor: 2, lift: 'small', carryDistanceM: 20 },
      toAccess: { floor: 1, lift: 'large', carryDistanceM: 10 },
      specialtyItems: draft.specialtyItems,
      selectedServiceIds: [],
    },
    pricingVersion: demoTenant.pricing,
    services: demoTenant.services,
  })
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      quoteId: 'quote-dom-test',
      accessToken: 'test-access-token-1234567890',
      revision: 1,
      calculation,
    }),
  })
  vi.stubGlobal('fetch', fetchMock)

  render(
    createElement(QuoteCalculator, {
      locale: 'de',
      mapsEmbedApiKey: null,
      tenant: toPublicTenantConfig(demoTenant),
    }),
  )

  await screen.findByRole('heading', { name: 'Wohin dürfen wir Ihre Offerte senden?' })
  const formattedPrice = formatMoneyRappen(calculation.totalRappen)
  expect(screen.queryByTestId('quote-total')).toBeNull()

  fireEvent.click(screen.getByRole('button', { name: 'Meine unverbindliche Offerte anzeigen' }))

  await screen.findByRole('heading', { name: 'Bereit zum Prüfen' })
  expect(screen.getByTestId('quote-total').textContent).toBe(formattedPrice)
  expect(screen.getByTestId('quote-accuracy').textContent).toContain('Kurze Prüfung empfohlen')
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
  const requestBody = JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string)
  expect(requestBody.draft.contact.email).toBe('mara@example.ch')
})
