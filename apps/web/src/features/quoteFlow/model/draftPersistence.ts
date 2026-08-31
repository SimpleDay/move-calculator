import { z } from 'zod'
import { type QuoteDraft, quoteDraftSchema } from './quoteDraft'

const STORAGE_PREFIX = 'zuegelofferte:quote-draft:v1:'

type DraftStorage = Pick<Storage, 'getItem' | 'removeItem' | 'setItem'>

const draftEnvelopeSchema = z.object({
  schemaVersion: z.literal(2),
  savedAt: z.string(),
  draft: quoteDraftSchema,
})

const legacyDraftEnvelopeSchema = z.object({
  schemaVersion: z.literal(1),
  savedAt: z.string(),
  draft: z.record(z.string(), z.unknown()),
})

export function getDraftStorageKey(tenantId: string): string {
  return `${STORAGE_PREFIX}${tenantId}`
}

export function saveQuoteDraft(storage: DraftStorage, draft: QuoteDraft, savedAt = new Date()): void {
  storage.setItem(
    getDraftStorageKey(draft.tenantId),
    JSON.stringify({
      schemaVersion: 2,
      savedAt: savedAt.toISOString(),
      draft,
    }),
  )
}

export function loadQuoteDraft(storage: DraftStorage, tenantId: string): QuoteDraft | null {
  const serialized = storage.getItem(getDraftStorageKey(tenantId))
  if (!serialized) {
    return null
  }

  try {
    const raw = JSON.parse(serialized)
    const parsed = draftEnvelopeSchema.safeParse(raw)
    if (parsed.success && parsed.data.draft.tenantId === tenantId) {
      return parsed.data.draft
    }

    const legacy = legacyDraftEnvelopeSchema.safeParse(raw)
    const migrated = legacy.success
      ? quoteDraftSchema.safeParse({
          ...legacy.data.draft,
          schemaVersion: 2,
          accessToken: null,
          fromPlaceId: null,
          toPlaceId: null,
          routeDurationMinutes: null,
          routeSource: 'manual',
        })
      : null
    if (!migrated?.success || migrated.data.tenantId !== tenantId) {
      storage.removeItem(getDraftStorageKey(tenantId))
      return null
    }
    return migrated.data
  } catch {
    storage.removeItem(getDraftStorageKey(tenantId))
    return null
  }
}

export function clearQuoteDraft(storage: DraftStorage, tenantId: string): void {
  storage.removeItem(getDraftStorageKey(tenantId))
}
