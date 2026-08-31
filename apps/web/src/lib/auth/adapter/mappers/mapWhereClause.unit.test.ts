import { mapWhereClause } from '@/lib/auth/adapter/mappers'
import { describe, expect, test } from 'vitest'

describe('operator mapping', () => {
  test.each([
    { operator: 'eq' as const, value: 'alice', expected: { equals: 'alice' } },
    { operator: undefined, value: 'alice', expected: { equals: 'alice' } },
    { operator: 'ne' as const, value: 'bob', expected: { not_equals: 'bob' } },
    { operator: 'gt' as const, value: 10, expected: { greater_than: 10 } },
    { operator: 'gte' as const, value: 10, expected: { greater_than_equal: 10 } },
    { operator: 'lt' as const, value: 5, expected: { less_than: 5 } },
    { operator: 'lte' as const, value: 5, expected: { less_than_equal: 5 } },
    { operator: 'contains' as const, value: 'test', expected: { contains: 'test' } },
    { operator: 'in' as const, value: ['a', 'b'], expected: { in: ['a', 'b'] } },
    { operator: 'not_in' as const, value: ['a', 'b'], expected: { not_in: ['a', 'b'] } },
    { operator: 'starts_with' as const, value: 'pre', expected: { like: 'pre%' } },
    { operator: 'ends_with' as const, value: 'suf', expected: { like: '%suf' } },
  ])('maps $operator to payload where field', ({ operator, value, expected }) => {
    const result = mapWhereClause([{ field: 'f', operator, value }])
    expect(result).toEqual({ f: expected })
  })

  test('throws on unsupported operator', () => {
    // @ts-expect-error testing unsupported operator
    expect(() => mapWhereClause([{ field: 'f', operator: 'nope', value: 'x' }])).toThrow('unsupported operator: nope')
  })
})

describe('where clause structure', () => {
  test('returns undefined for empty array', () => {
    expect(mapWhereClause([])).toBeUndefined()
    expect(mapWhereClause()).toBeUndefined()
  })

  test('returns flat object for single clause', () => {
    const result = mapWhereClause([{ field: 'email', operator: 'eq', value: 'a@b.com' }])
    expect(result).toEqual({ email: { equals: 'a@b.com' } })
  })

  test('groups multiple clauses into AND by default', () => {
    const result = mapWhereClause([
      { field: 'name', value: 'Alice' },
      { field: 'role', value: 'admin' },
    ])
    expect(result).toEqual({
      AND: [{ name: { equals: 'Alice' } }, { role: { equals: 'admin' } }],
    })
  })

  test('groups OR clauses separately', () => {
    const result = mapWhereClause([
      { field: 'role', value: 'admin', connector: 'OR' },
      { field: 'role', value: 'editor', connector: 'OR' },
    ])
    expect(result).toEqual({
      OR: [{ role: { equals: 'admin' } }, { role: { equals: 'editor' } }],
    })
  })

  test('handles mixed AND and OR connectors', () => {
    const result = mapWhereClause([
      { field: 'active', operator: 'eq' as const, value: true, connector: 'AND' },
      { field: 'role', operator: 'eq' as const, value: 'admin', connector: 'OR' },
      { field: 'role', operator: 'eq' as const, value: 'editor', connector: 'OR' },
    ])
    expect(result).toEqual({
      AND: [{ active: { equals: true } }],
      OR: [{ role: { equals: 'admin' } }, { role: { equals: 'editor' } }],
    })
  })
})
