import { mapLimitAndOffset } from '@/lib/auth/adapter/mappers'
import { describe, expect, test } from 'vitest'

describe('mapLimitAndOffset', () => {
  test('defaults to page 1 with limit 100', () => {
    expect(mapLimitAndOffset()).toEqual({ page: 1, limit: 100 })
  })

  test('calculates page from offset', () => {
    expect(mapLimitAndOffset(10, 0)).toEqual({ page: 1, limit: 10 })
    expect(mapLimitAndOffset(10, 10)).toEqual({ page: 2, limit: 10 })
    expect(mapLimitAndOffset(10, 20)).toEqual({ page: 3, limit: 10 })
  })

  test('uses custom limit', () => {
    expect(mapLimitAndOffset(25, 0)).toEqual({ page: 1, limit: 25 })
  })

  test('throws when offset is not a multiple of limit', () => {
    expect(() => mapLimitAndOffset(10, 5)).toThrow('offset <5> must be a multiple of limit <10>')
  })
})
