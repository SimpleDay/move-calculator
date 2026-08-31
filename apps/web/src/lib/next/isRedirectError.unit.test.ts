import { isRedirectError } from '@/lib/next/isRedirectError'
import { redirect } from 'next/navigation'
import { expect, test } from 'vitest'

test('returns true for redirect errors', () => {
  try {
    redirect('/')
    expect.unreachable('redirect should throw an error')
  } catch (error) {
    expect(isRedirectError(error)).toBeTruthy()
  }
})

test('returns false for non-redirect errors', () => {
  expect(isRedirectError(new Error('Some other error'))).toBeFalsy()
})
