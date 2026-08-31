import { mapModelNameToCollectionSlug } from '@/lib/auth/adapter/mappers'
import { describe, expect, test } from 'vitest'

describe('mapModelNameToCollectionSlug', () => {
  test.each([
    { model: 'user', slug: 'users' },
    { model: 'account', slug: 'accounts' },
    { model: 'session', slug: 'sessions' },
    { model: 'verification', slug: 'verifications' },
    { model: 'rateLimit', slug: 'rateLimits' },
  ])('maps $model to $slug', ({ model, slug }) => {
    expect(mapModelNameToCollectionSlug(model)).toBe(slug)
  })

  test('throws for unknown model name', () => {
    expect(() => mapModelNameToCollectionSlug('unknown')).toThrow(
      'Model name "unknown" does not map to a collection slug',
    )
  })
})
