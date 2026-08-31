import { mapSortBy } from '@/lib/auth/adapter/mappers'
import { describe, expect, test } from 'vitest'

describe('mapSortBy', () => {
  test('returns undefined when no sortBy is given', () => {
    expect(mapSortBy()).toBeUndefined()
  })

  test('returns field name for ascending sort', () => {
    expect(mapSortBy({ field: 'createdAt', direction: 'asc' })).toBe('createdAt')
  })

  test('prefixes with - for descending sort', () => {
    expect(mapSortBy({ field: 'createdAt', direction: 'desc' })).toBe('-createdAt')
  })
})
