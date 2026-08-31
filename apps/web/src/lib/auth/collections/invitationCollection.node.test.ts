import { getApp } from '@/getApp'
import { Role } from '@/lib/auth'
import { User } from '@/payload-types'
import { beforeAll, describe, expect, test } from 'vitest'

describe('invitationCollection', () => {
  let app: Awaited<ReturnType<typeof getApp>>

  beforeAll(async () => {
    app = await getApp()
  })

  test('creates invitation', async () => {
    await app.runInTransaction(async () => {
      const user = userWithRole('admin')
      const invitation = await app.create({
        collection: 'user-invitations',
        user,
        data: {
          email: 'some@email.com',
          role: 'user',
          name: 'Some User',
          token: 'token',
          expiresAt: new Date().toISOString(),
        },
      })
      expect(invitation).toBeTruthy()
    })
  })

  test('fails creating invitation with higher role than myself', async () => {
    const user = userWithRole('admin')
    const invitationPromise = app.create({
      collection: 'user-invitations',
      user,
      data: {
        email: 'some@email.com',
        role: 'platformAdmin',
        name: 'Some User',
        token: 'token',
        expiresAt: new Date().toISOString(),
      },
    })
    await expect(invitationPromise).rejects.toThrow()
  })

  test('fails updating invitation with higher role than myself', async () => {
    const user = userWithRole('admin')
    const invitation = await app.create({
      collection: 'user-invitations',
      user,
      data: {
        email: 'some@email.com',
        role: 'user',
        name: 'Some User',
        token: 'token',
        expiresAt: new Date().toISOString(),
      },
    })

    const updatePromise = app.update({
      collection: 'user-invitations',
      user,
      data: {
        role: 'platformAdmin',
      },
      id: invitation.id,
    })
    await expect(updatePromise).rejects.toThrow()
  })
})

function userWithRole(role: Role): User {
  return {
    role,
    email: 'hello@world.com',
    name: 'Name',
    id: crypto.randomUUID(),
    locale: 'en',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    collection: 'users',
  }
}
