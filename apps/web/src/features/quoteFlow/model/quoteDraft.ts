import type { ConfirmedMoveInput, LiftType } from '@/features/pricing/model'
import type { ServiceId } from '@/features/tenants/model/tenantConfig'
import { z } from 'zod'

export const quoteStepIds = ['move', 'access', 'inventory', 'services', 'review', 'contact', 'result'] as const
export type QuoteStepId = (typeof quoteStepIds)[number]

export const quoteStatuses = [
  'draft',
  'calculated',
  'confirmationRequested',
  'companyConfirmed',
  'companyChanged',
] as const
export type QuoteStatus = (typeof quoteStatuses)[number]

export type AccessDraft = {
  floor: number | null
  lift: LiftType | null
  carryDistanceM: number
}

export type ContactDraft = {
  firstName: string
  lastName: string
  email: string
  phone: string
  contactConsent: boolean
}

export type InventoryMethod = 'manual' | 'photo' | 'quick'

export type QuoteDraft = {
  schemaVersion: 2
  tenantId: string
  currentStep: QuoteStepId
  quoteId: string | null
  accessToken: string | null
  revision: number
  status: QuoteStatus
  moveType: 'apartment' | 'business' | 'house' | null
  fromAddress: string
  toAddress: string
  fromPlaceId: string | null
  toPlaceId: string | null
  moveDate: string
  dateFlexible: boolean
  distanceKm: number
  routeDurationMinutes: number | null
  routeSource: 'google' | 'manual'
  fromAccess: AccessDraft
  toAccess: AccessDraft
  inventoryMethod: InventoryMethod | null
  volumeM3: number
  rooms: number
  boxes: number
  specialtyItems: {
    piano: boolean
    safe: boolean
  }
  selectedServiceIds: ServiceId[]
  servicesReviewed: boolean
  customerAttestation: boolean
  contact: ContactDraft
}

const accessDraftSchema = z.object({
  floor: z.number().int().min(-2).max(40).nullable(),
  lift: z.enum(['large', 'none', 'small']).nullable(),
  carryDistanceM: z.number().int().min(0).max(500),
})

const contactDraftSchema = z.object({
  firstName: z.string().max(100),
  lastName: z.string().max(100),
  email: z.string().max(320),
  phone: z.string().max(50),
  contactConsent: z.boolean(),
})

export const quoteDraftSchema = z.object({
  schemaVersion: z.literal(2),
  tenantId: z.string().min(1).max(100),
  currentStep: z.enum(quoteStepIds),
  quoteId: z.string().min(1).max(100).nullable(),
  accessToken: z.string().min(20).max(200).nullable(),
  revision: z.number().int().min(0).max(10_000),
  status: z.enum(quoteStatuses),
  moveType: z.enum(['apartment', 'business', 'house']).nullable(),
  fromAddress: z.string().max(300),
  toAddress: z.string().max(300),
  fromPlaceId: z.string().min(1).max(300).nullable(),
  toPlaceId: z.string().min(1).max(300).nullable(),
  moveDate: z.string().max(10),
  dateFlexible: z.boolean(),
  distanceKm: z.number().min(0).max(2_000),
  routeDurationMinutes: z.number().int().min(0).max(20_000).nullable(),
  routeSource: z.enum(['google', 'manual']),
  fromAccess: accessDraftSchema,
  toAccess: accessDraftSchema,
  inventoryMethod: z.enum(['manual', 'photo', 'quick']).nullable(),
  volumeM3: z.number().min(0).max(1_000),
  rooms: z.number().min(0).max(100),
  boxes: z.number().int().min(0).max(10_000),
  specialtyItems: z.object({
    piano: z.boolean(),
    safe: z.boolean(),
  }),
  selectedServiceIds: z.array(z.enum(['assembly', 'cleaning', 'disposal', 'packing'])),
  servicesReviewed: z.boolean(),
  customerAttestation: z.boolean(),
  contact: contactDraftSchema,
})

export function createEmptyQuoteDraft(tenantId: string): QuoteDraft {
  const emptyAccess: AccessDraft = {
    floor: null,
    lift: null,
    carryDistanceM: 10,
  }

  return {
    schemaVersion: 2,
    tenantId,
    currentStep: 'move',
    quoteId: null,
    accessToken: null,
    revision: 0,
    status: 'draft',
    moveType: null,
    fromAddress: '',
    toAddress: '',
    fromPlaceId: null,
    toPlaceId: null,
    moveDate: '',
    dateFlexible: false,
    distanceKm: 0,
    routeDurationMinutes: null,
    routeSource: 'manual',
    fromAccess: { ...emptyAccess },
    toAccess: { ...emptyAccess },
    inventoryMethod: null,
    volumeM3: 0,
    rooms: 0,
    boxes: 0,
    specialtyItems: {
      piano: false,
      safe: false,
    },
    selectedServiceIds: [],
    servicesReviewed: false,
    customerAttestation: false,
    contact: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      contactConsent: false,
    },
  }
}

export function toConfirmedMoveInput(draft: QuoteDraft): ConfirmedMoveInput {
  if (!draft.moveType || draft.fromAccess.floor === null || draft.toAccess.floor === null) {
    throw new Error('Quote draft is not complete enough to calculate.')
  }

  return {
    moveType: draft.moveType,
    moveDate: draft.moveDate,
    distanceKm: draft.distanceKm,
    routeDurationMinutes: draft.routeDurationMinutes,
    routeSource: draft.routeSource,
    inventoryMethod: draft.inventoryMethod ?? 'manual',
    rooms: draft.rooms,
    volumeM3: draft.volumeM3,
    boxes: draft.boxes,
    fromAccess: {
      floor: draft.fromAccess.floor,
      lift: draft.fromAccess.floor <= 0 ? 'large' : (draft.fromAccess.lift ?? 'none'),
      carryDistanceM: draft.fromAccess.carryDistanceM,
    },
    toAccess: {
      floor: draft.toAccess.floor,
      lift: draft.toAccess.floor <= 0 ? 'large' : (draft.toAccess.lift ?? 'none'),
      carryDistanceM: draft.toAccess.carryDistanceM,
    },
    specialtyItems: draft.specialtyItems,
    selectedServiceIds: draft.selectedServiceIds,
  }
}
