import { di } from '@/di'
import { getApp } from '@/getApp'
import { BetterAuthType, createBetterAuthOptions } from '@/lib/auth/createBetterAuth'
import { RunInTransactionFn, TransactionalOperations } from '@/lib/tx'
import { betterAuth } from 'better-auth'
import type { BasePayload } from 'payload'
import { beforeAll, describe, expect, test, vi } from 'vitest'

describe.each([
  { name: 'joins enabled', joins: true },
  { name: 'joins disabled', joins: false },
])('createBetterAuth ($name)', ({ joins }) => {
  let auth: BetterAuthType
  let payload: BasePayload
  let localApi: TransactionalOperations
  let runInTransaction: RunInTransactionFn

  beforeAll(async () => {
    const { inject } = await getApp()
    payload = inject(di.payload)
    localApi = inject(di.localApi)
    runInTransaction = inject(di.transactionRunner)
    const emailService = inject(di.emailService)
    const options = createBetterAuthOptions(payload, localApi, emailService)
    auth = betterAuth({ ...options, experimental: { joins } }) as BetterAuthType
  })

  test('signs up user', async () => {
    const result = await auth.api.signUpEmail({
      body: {
        name: 'Testuser',
        email: 'hello@world.com',
        password: 'password123',
        locale: 'de',
      },
    })
    expect(result.user.name).toEqual('Testuser')
  })

  test('signs up with role fails', async () => {
    const promise = auth.api.signUpEmail({
      body: {
        name: 'Testuser',
        email: 'hello@world.com',
        password: 'password123',
        role: 'admin',
        locale: 'en',
      } as never,
    })
    await expect(promise).rejects.toThrow()
  })

  test('signs in with credentials after signup', async () => {
    const { user } = await auth.api.signUpEmail({
      body: {
        name: 'Testuser',
        email: 'hello@world.com',
        password: 'password123',
        locale: 'de',
      },
    })
    await localApi.update({
      collection: 'users',
      id: user.id,
      data: { emailVerified: true },
    })

    const findSpy = vi.spyOn(payload, 'find')
    const result = await auth.api.signInEmail({
      body: { email: 'hello@world.com', password: 'password123' },
    })

    expect(result.user.email).toEqual('hello@world.com')
    expect(result.token).toBeTruthy()

    const userCalls = findSpy.mock.calls.filter(([a]) => a.collection === 'users')

    if (joins) {
      expect(userCalls.some(([a]) => !!a.joins && 'accounts' in a.joins)).toBe(true)
    } else {
      expect(userCalls.every(([a]) => !a.joins)).toBe(true)
    }

    findSpy.mockRestore()
  })

  test('runs in transaction', async () => {
    await runInTransaction(async () => {
      await auth.api.signUpEmail({
        body: {
          name: 'Testuser',
          email: 'hello@world.com',
          password: 'password123',
          locale: 'en',
        } as never,
      })
      const user = await localApi.findOne({
        collection: 'users',
        where: {
          email: {
            equals: 'hello@world.com',
          },
        },
      })
      expect(user?.role).toEqual('user')
      const userOutsideTransaction = await localApi.findOne({
        collection: 'users',
        where: {
          email: {
            equals: 'hello@world.com',
          },
        },
        req: { transactionID: null as never },
      })
      expect(userOutsideTransaction).toBeFalsy()
    })
  })
})
