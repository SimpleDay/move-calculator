import { mapSelect } from '@/lib/auth/adapter/mappers'
import { describe, expect, test } from 'vitest'

describe('mapSelect', () => {
  test('returns undefined for undefined input', () => {
    expect(mapSelect(undefined)).toBeUndefined()
  })

  test('returns undefined for empty array', () => {
    expect(mapSelect([])).toBeUndefined()
  })

  test('maps field names to { field: true } entries', () => {
    expect(mapSelect(['name', 'email'])).toEqual({ name: true, email: true })
  })
})
