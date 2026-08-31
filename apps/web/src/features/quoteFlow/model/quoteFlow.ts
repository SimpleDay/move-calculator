import type { ServiceId } from '@/features/tenants/model/tenantConfig'
import {
  createEmptyQuoteDraft,
  type AccessDraft,
  type ContactDraft,
  type InventoryMethod,
  type QuoteDraft,
  type QuoteStepId,
} from './quoteDraft'

export const customerInputSteps = ['move', 'access', 'inventory', 'services', 'review', 'contact'] as const

export type QuoteFlowAction =
  | {
      type: 'setMoveDetails'
      value: Partial<
        Pick<QuoteDraft, 'dateFlexible' | 'distanceKm' | 'fromAddress' | 'moveDate' | 'moveType' | 'toAddress'> &
          Pick<QuoteDraft, 'fromPlaceId' | 'routeDurationMinutes' | 'routeSource' | 'toPlaceId'>
      >
    }
  | { type: 'setAccess'; location: 'from' | 'to'; value: Partial<AccessDraft> }
  | {
      type: 'setInventory'
      value: Partial<Pick<QuoteDraft, 'boxes' | 'inventoryMethod' | 'rooms' | 'volumeM3'>>
    }
  | { type: 'setInventoryMethod'; value: InventoryMethod }
  | { type: 'setSpecialtyItem'; item: 'piano' | 'safe'; selected: boolean }
  | { type: 'toggleService'; serviceId: ServiceId }
  | { type: 'markServicesReviewed' }
  | { type: 'setCustomerAttestation'; value: boolean }
  | { type: 'setContact'; value: Partial<ContactDraft> }
  | { type: 'goToStep'; step: QuoteStepId }
  | { type: 'completeContactGate'; quoteId: string; accessToken: string }
  | { type: 'requestConfirmation' }
  | { type: 'setStatus'; status: QuoteDraft['status'] }
  | { type: 'replaceDraft'; draft: QuoteDraft }
  | { type: 'reset'; tenantId: string }

export function quoteFlowReducer(draft: QuoteDraft, action: QuoteFlowAction): QuoteDraft {
  switch (action.type) {
    case 'setMoveDetails':
      return { ...draft, ...action.value }
    case 'setAccess': {
      const key = action.location === 'from' ? 'fromAccess' : 'toAccess'
      const nextAccess = { ...draft[key], ...action.value }
      if (nextAccess.floor !== null && nextAccess.floor <= 0) {
        nextAccess.lift = null
      }
      return { ...draft, [key]: nextAccess }
    }
    case 'setInventory':
      return { ...draft, ...action.value }
    case 'setInventoryMethod':
      return { ...draft, inventoryMethod: action.value }
    case 'setSpecialtyItem':
      return {
        ...draft,
        specialtyItems: { ...draft.specialtyItems, [action.item]: action.selected },
      }
    case 'toggleService':
      return {
        ...draft,
        selectedServiceIds: draft.selectedServiceIds.includes(action.serviceId)
          ? draft.selectedServiceIds.filter((id) => id !== action.serviceId)
          : [...draft.selectedServiceIds, action.serviceId],
        servicesReviewed: true,
        revision: draft.status === 'draft' ? draft.revision : draft.revision + 1,
      }
    case 'markServicesReviewed':
      return { ...draft, servicesReviewed: true }
    case 'setCustomerAttestation':
      return { ...draft, customerAttestation: action.value }
    case 'setContact':
      return { ...draft, contact: { ...draft.contact, ...action.value } }
    case 'goToStep':
      return { ...draft, currentStep: action.step }
    case 'completeContactGate':
      return {
        ...draft,
        quoteId: action.quoteId,
        accessToken: action.accessToken,
        revision: Math.max(1, draft.revision),
        status: 'calculated',
        currentStep: 'result',
      }
    case 'requestConfirmation':
      return { ...draft, status: 'confirmationRequested' }
    case 'setStatus':
      return { ...draft, status: action.status }
    case 'replaceDraft':
      return action.draft
    case 'reset':
      return createEmptyQuoteDraft(action.tenantId)
  }
}

export function isContactComplete(draft: QuoteDraft, phoneRequired: boolean): boolean {
  const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.contact.email.trim())
  const hasPhone = !phoneRequired || draft.contact.phone.replace(/\D/g, '').length >= 7

  return (
    draft.contact.firstName.trim().length >= 2 &&
    draft.contact.lastName.trim().length >= 2 &&
    hasValidEmail &&
    hasPhone &&
    draft.contact.contactConsent
  )
}

export function isStepComplete(draft: QuoteDraft, step: QuoteStepId, phoneRequired: boolean): boolean {
  switch (step) {
    case 'move':
      return (
        draft.moveType !== null &&
        draft.fromAddress.trim().length >= 3 &&
        draft.toAddress.trim().length >= 3 &&
        /^\d{4}-\d{2}-\d{2}$/.test(draft.moveDate) &&
        draft.distanceKm > 0
      )
    case 'access': {
      const accessIsComplete = (access: AccessDraft) =>
        access.floor !== null && (access.floor <= 0 || access.lift !== null) && access.carryDistanceM >= 0
      return accessIsComplete(draft.fromAccess) && accessIsComplete(draft.toAccess)
    }
    case 'inventory':
      return draft.inventoryMethod !== null && draft.volumeM3 > 0 && draft.rooms > 0
    case 'services':
      return draft.servicesReviewed
    case 'review':
      return draft.customerAttestation
    case 'contact':
      return isContactComplete(draft, phoneRequired)
    case 'result':
      return draft.status !== 'draft' && draft.quoteId !== null
  }
}

export function getNextStep(step: QuoteStepId): QuoteStepId {
  const currentIndex = customerInputSteps.indexOf(step as (typeof customerInputSteps)[number])
  return customerInputSteps[currentIndex + 1] ?? 'result'
}

export function getPreviousStep(step: QuoteStepId): QuoteStepId {
  const currentIndex = customerInputSteps.indexOf(step as (typeof customerInputSteps)[number])
  return customerInputSteps[Math.max(0, currentIndex - 1)] ?? 'move'
}
