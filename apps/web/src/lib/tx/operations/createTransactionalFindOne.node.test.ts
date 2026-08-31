import { getApp } from '@/getApp'
import { TransactionalOperations } from '@/lib/tx'
import type { RequiredDataFromCollectionSlug } from 'payload'
import { beforeAll, describe, expect, test } from 'vitest'

describe('createTransactionalFindOne', () => {
  let ops: TransactionalOperations

  beforeAll(async () => {
    ops = await getApp()
  })

  test('throws if more than one document match', async () => {
    await Promise.all([createUserInvitation({ name: 'Test' }), createUserInvitation({ name: 'Test' })])
    await expect(
      ops.findOne({
        collection: 'user-invitations',
        where: {
          name: {
            equals: 'Test',
          },
        },
      }),
    ).rejects.toThrow('Too many documents')
  })

  test('returns single document', async () => {
    await createUserInvitation({ name: 'Test' })
    const result = await ops.findOne({
      collection: 'user-invitations',
      where: {
        name: {
          equals: 'Test',
        },
      },
    })
    expect(result?.name).toEqual('Test')
  })

  test('returns null if no document match', async () => {
    const result = await ops.findOne({
      collection: 'user-invitations',
      where: {
        name: {
          equals: 'Test',
        },
      },
    })
    expect(result).toBeNull()
  })

  async function createUserInvitation(data: Partial<RequiredDataFromCollectionSlug<'user-invitations'>> = {}) {
    await ops.create({
      collection: 'user-invitations',
      data: {
        email: `${crypto.randomUUID()}@email.com`,
        name: 'Kenneth',
        token: crypto.randomUUID(),
        expiresAt: new Date().toISOString(),
        role: 'admin',
        ...data,
      },
    })
  }
})
