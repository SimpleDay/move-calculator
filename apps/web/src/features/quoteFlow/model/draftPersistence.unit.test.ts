import { describe, expect, test } from 'vitest'
import { getDraftStorageKey, loadQuoteDraft, saveQuoteDraft } from './draftPersistence'
import { createEmptyQuoteDraft } from './quoteDraft'

function createMemoryStorage(): Storage {
  const values = new Map<string, string>()
  return {
    get length() {
      return values.size
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  }
}

describe('quote draft persistence', () => {
  test('round-trips a versioned tenant-scoped draft', () => {
    const storage = createMemoryStorage()
    const draft = { ...createEmptyQuoteDraft('tenant-1'), fromAddress: 'Bern' }

    saveQuoteDraft(storage, draft, new Date('2026-08-30T12:00:00.000Z'))

    expect(loadQuoteDraft(storage, 'tenant-1')).toEqual(draft)
    expect(loadQuoteDraft(storage, 'tenant-2')).toBeNull()
  })

  test('removes malformed persisted data instead of breaking the flow', () => {
    const storage = createMemoryStorage()
    storage.setItem(getDraftStorageKey('tenant-1'), '{broken')

    expect(loadQuoteDraft(storage, 'tenant-1')).toBeNull()
    expect(storage.getItem(getDraftStorageKey('tenant-1'))).toBeNull()
  })
})
