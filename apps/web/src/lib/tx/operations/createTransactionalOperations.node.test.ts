import { getApp } from '@/getApp'
import { RunInTransactionFn, TransactionalOperations } from '@/lib/tx'
import type { RequiredDataFromCollectionSlug } from 'payload'
import { beforeAll, describe, expect, test } from 'vitest'

describe('createTransactionalOperations', () => {
  let ops: TransactionalOperations
  let runInTransaction: RunInTransactionFn

  beforeAll(async () => {
    const app = await getApp()
    ops = app
    runInTransaction = app.runInTransaction
  })

  test('uses no transaction', async () => {
    await createUserInvitation()
    const { totalDocs } = await ops.count({ collection: 'user-invitations' })
    expect(totalDocs).toEqual(1)
  })

  test('runs in transaction', async () => {
    try {
      await runInTransaction(async () => {
        await createUserInvitation()
        const { totalDocs } = await ops.count({ collection: 'user-invitations' })
        expect(totalDocs).toEqual(1)
        throw new Error('test')
      })
    } catch (_e) {
      // expected
    }
    const { totalDocs } = await ops.count({ collection: 'user-invitations' })
    expect(totalDocs).toEqual(0)
  })

  async function createUserInvitation(data: Partial<RequiredDataFromCollectionSlug<'user-invitations'>> = {}) {
    await ops.create({
      collection: 'user-invitations',
      data: {
        email: 'test@email.com',
        name: 'Kenneth',
        token: crypto.randomUUID(),
        expiresAt: new Date().toISOString(),
        role: 'admin',
        ...data,
      },
    })
  }
})
