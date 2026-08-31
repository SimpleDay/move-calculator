import { describe, expect, test } from 'vitest'
import { getServerSideDomain } from './getServerSideDomain'

describe('getServerSideDomain', () => {
  test('should return VERCEL_PROJECT_PRODUCTION_URL if VERCEL_ENV is production and it is set', () => {
    const result = getServerSideDomain({
      VERCEL_TARGET_ENV: 'production',
      VERCEL_PROJECT_PRODUCTION_URL: 'example.com',
    })
    expect(result).toBe('https://example.com')
  })

  test('should return NEXT_PUBLIC_SERVER_URL if it is set and VERCEL_TARGET_ENV is not production', () => {
    const result = getServerSideDomain({
      VERCEL_TARGET_ENV: 'staging',
      NEXT_PUBLIC_SERVER_URL: 'https://staging.example.com',
      VERCEL_PROJECT_PRODUCTION_URL: 'example.com',
    })
    expect(result).toBe('https://staging.example.com')
  })

  test('should return VERCEL_BRANCH_URL only for preview and not main', () => {
    const result = getServerSideDomain({
      VERCEL_BRANCH_URL: 'branch.example.com',
      VERCEL_TARGET_ENV: 'preview',
      VERCEL_GIT_COMMIT_REF: 'feature/example',
    })
    expect(result).toBe('https://branch.example.com')
  })

  test('should throw an error if no NEXT_PUBLIC_SERVER_URL', () => {
    expect(() =>
      getServerSideDomain({
        VERCEL_TARGET_ENV: 'preview',
        VERCEL_GIT_COMMIT_REF: 'main',
        VERCEL_BRANCH_URL: 'branch.example.com',
      }),
    ).toThrow()
  })
})
