import { describe, expect, test } from 'vitest'
import { createEmptyQuoteDraft } from './quoteDraft'
import { isStepComplete, quoteFlowReducer } from './quoteFlow'

describe('quoteFlowReducer', () => {
  test('asks for a lift only when the selected floor needs one', () => {
    let draft = createEmptyQuoteDraft('tenant-1')
    draft = quoteFlowReducer(draft, {
      type: 'setAccess',
      location: 'from',
      value: { floor: 2 },
    })
    draft = quoteFlowReducer(draft, {
      type: 'setAccess',
      location: 'to',
      value: { floor: 0 },
    })

    expect(isStepComplete(draft, 'access', true)).toBe(false)

    draft = quoteFlowReducer(draft, {
      type: 'setAccess',
      location: 'from',
      value: { lift: 'small' },
    })

    expect(isStepComplete(draft, 'access', true)).toBe(true)
  })

  test('does not complete the contact gate without consent or a valid phone', () => {
    let draft = createEmptyQuoteDraft('tenant-1')
    draft = quoteFlowReducer(draft, {
      type: 'setContact',
      value: {
        firstName: 'Mara',
        lastName: 'Muster',
        email: 'mara@example.ch',
        phone: '12',
      },
    })

    expect(isStepComplete(draft, 'contact', true)).toBe(false)

    draft = quoteFlowReducer(draft, {
      type: 'setContact',
      value: { phone: '+41 79 123 45 67', contactConsent: true },
    })

    expect(isStepComplete(draft, 'contact', true)).toBe(true)
  })

  test('reveals the result only when the contact gate is completed', () => {
    const draft = quoteFlowReducer(createEmptyQuoteDraft('tenant-1'), {
      type: 'completeContactGate',
      quoteId: 'quote-1',
      accessToken: 'test-access-token-1234567890',
    })

    expect(draft).toMatchObject({
      currentStep: 'result',
      quoteId: 'quote-1',
      accessToken: 'test-access-token-1234567890',
      revision: 1,
      status: 'calculated',
    })
  })
})
