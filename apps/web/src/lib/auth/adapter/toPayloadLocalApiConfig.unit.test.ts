import { toPayloadLocalApiConfig } from '@/lib/auth/adapter/toPayloadLocalApiConfig'
import type { JoinConfig } from 'better-auth'
import type { BasePayload } from 'payload'
import { describe, expect, test } from 'vitest'

const mockPayload = {
  collections: {
    users: {
      config: {
        fields: [
          { name: 'name', type: 'text' },
          { name: 'email', type: 'email' },
          { name: 'sessions', type: 'join', collection: 'sessions', on: 'userId' },
          { name: 'accounts', type: 'join', collection: 'accounts', on: 'userId' },
        ],
      },
    },
    sessions: {
      config: {
        fields: [
          { name: 'userId', type: 'relationship', relationTo: 'users' },
          { name: 'token', type: 'text' },
        ],
      },
    },
    accounts: {
      config: {
        fields: [
          { name: 'userId', type: 'relationship', relationTo: 'users' },
          { name: 'providerId', type: 'text' },
        ],
      },
    },
  },
} as unknown as BasePayload

describe('toPayloadLocalApiConfig', () => {
  describe('forward 1:1 (relationship populate)', () => {
    test('translates to depth: 1 and a mapper that pulls populated value to alias and flattens FK to id', () => {
      const joinConfig: JoinConfig = {
        user: { on: { from: 'userId', to: 'id' }, relation: 'one-to-one' },
      }

      const { depth, joins, mapJoinsToBetterAuth } = toPayloadLocalApiConfig({
        payload: mockPayload,
        baseModel: 'session',
        joinConfig,
      })

      expect(depth).toBe(1)
      expect(joins).toBe(false)

      const populatedUser = { id: 'user-1', name: 'Alice', email: 'alice@test.com' }
      const [mapped] = mapJoinsToBetterAuth([{ id: 'session-1', userId: populatedUser, token: 'abc' }])

      expect(mapped.user).toEqual(populatedUser)
      expect(mapped.userId).toBe('user-1')
    })

    test('sets alias to null when the relationship FK is null', () => {
      const joinConfig: JoinConfig = {
        user: { on: { from: 'userId', to: 'id' }, relation: 'one-to-one' },
      }

      const { mapJoinsToBetterAuth } = toPayloadLocalApiConfig({
        payload: mockPayload,
        baseModel: 'session',
        joinConfig,
      })

      const [mapped] = mapJoinsToBetterAuth([{ id: 'session-1', userId: null, token: 'abc' }])

      expect(mapped.user).toBeNull()
      expect(mapped.userId).toBeNull()
    })
  })

  describe('reverse 1:n (join field)', () => {
    test('translates to joins query keyed by the join field name with default limit 100', () => {
      const joinConfig: JoinConfig = {
        session: { on: { from: 'id', to: 'userId' } },
      }

      const { depth, joins, mapJoinsToBetterAuth } = toPayloadLocalApiConfig({
        payload: mockPayload,
        baseModel: 'user',
        joinConfig,
      })

      expect(depth).toBe(1)
      expect(joins).toEqual({ sessions: { limit: 100 } })

      const sessions = [
        { id: 'session-1', userId: 'user-1' },
        { id: 'session-2', userId: 'user-1' },
      ]
      const [mapped] = mapJoinsToBetterAuth([
        {
          id: 'user-1',
          name: 'Alice',
          sessions: { docs: sessions, hasNextPage: false, totalDocs: 2 },
        },
      ])

      expect(mapped.session).toEqual(sessions)
      expect(mapped.sessions).toBeUndefined()
    })

    test('forwards a custom limit', () => {
      const joinConfig: JoinConfig = {
        session: { on: { from: 'id', to: 'userId' }, relation: 'one-to-many', limit: 50 },
      }

      const { joins } = toPayloadLocalApiConfig({ payload: mockPayload, baseModel: 'user', joinConfig })

      expect(joins).toEqual({ sessions: { limit: 50 } })
    })

    test('sets alias to empty array when the join field returned no docs', () => {
      const joinConfig: JoinConfig = {
        session: { on: { from: 'id', to: 'userId' }, relation: 'one-to-many' },
      }

      const { mapJoinsToBetterAuth } = toPayloadLocalApiConfig({
        payload: mockPayload,
        baseModel: 'user',
        joinConfig,
      })

      const [mapped] = mapJoinsToBetterAuth([{ id: 'user-1' }])

      expect(mapped.session).toEqual([])
    })

    test('returns docs[0] (or null) and forces limit: 1 for relation: "one-to-one"', () => {
      const joinConfig: JoinConfig = {
        account: { on: { from: 'id', to: 'userId' }, relation: 'one-to-one', limit: 50 },
      }

      const { joins, mapJoinsToBetterAuth } = toPayloadLocalApiConfig({
        payload: mockPayload,
        baseModel: 'user',
        joinConfig,
      })

      expect(joins).toEqual({ accounts: { limit: 1 } })

      const account = { id: 'account-1', userId: 'user-1', providerId: 'credential' }
      const [mapped] = mapJoinsToBetterAuth([
        {
          id: 'user-1',
          accounts: { docs: [account], hasNextPage: false, totalDocs: 1 },
        },
      ])

      expect(mapped.account).toEqual(account)
      expect(mapped.accounts).toBeUndefined()

      const [emptyMapped] = mapJoinsToBetterAuth([{ id: 'user-2', accounts: { docs: [] } }])
      expect(emptyMapped.account).toBeNull()
    })
  })

  describe('multiple joins', () => {
    test('combines forward and reverse joins into a single config', () => {
      const joinConfig: JoinConfig = {
        user: { on: { from: 'userId', to: 'id' }, relation: 'one-to-one' },
      }

      const { depth, joins } = toPayloadLocalApiConfig({ payload: mockPayload, baseModel: 'session', joinConfig })

      expect(depth).toBe(1)
      expect(joins).toBe(false)
    })
  })

  describe('validation', () => {
    test('throws when on.from is "id" but no matching join field exists on the base collection', () => {
      const joinConfig: JoinConfig = {
        verification: { on: { from: 'id', to: 'userId' }, relation: 'one-to-many' },
      }

      expect(() => toPayloadLocalApiConfig({ payload: mockPayload, baseModel: 'user', joinConfig })).toThrow(
        /requires a "join" field on the "users" Payload collection with collection: "verifications" and on: "userId"/,
      )
    })

    test('throws when on.from references a non-relationship field on the base collection', () => {
      const joinConfig: JoinConfig = {
        session: { on: { from: 'name', to: 'id' }, relation: 'one-to-one' },
      }

      expect(() => toPayloadLocalApiConfig({ payload: mockPayload, baseModel: 'user', joinConfig })).toThrow(
        /requires a "relationship" field "name" on the "users" Payload collection with relationTo: "sessions"/,
      )
    })

    test('throws when on.from is a relationship field but on.to is not "id" (lateral join through shared FK)', () => {
      const joinConfig: JoinConfig = {
        account: { on: { from: 'userId', to: 'userId' }, relation: 'one-to-one' },
      }

      expect(() => toPayloadLocalApiConfig({ payload: mockPayload, baseModel: 'session', joinConfig })).toThrow(
        /requires on\.to === "id" but received "userId"/,
      )
    })
  })

  describe('empty join config', () => {
    test('returns depth 0 and a no-op mapper when join config is undefined', () => {
      const { depth, joins, mapJoinsToBetterAuth } = toPayloadLocalApiConfig({
        payload: mockPayload,
        baseModel: 'user',
      })

      expect(depth).toBe(0)
      expect(joins).toBe(false)

      const [mapped] = mapJoinsToBetterAuth([{ id: 'user-1' }])
      expect(mapped).toEqual({ id: 'user-1' })
    })
  })

  // These tests document the round-trip for each join shape Better Auth actually
  // requests in production, by showing three explicit stages:
  //   1. The JoinConfig Better Auth passes to the adapter.
  //   2. The Payload query options toPayloadLocalApiConfig generates.
  //   3. The raw Payload result (what we feed into mapJoinsToBetterAuth).
  //   4. The cleaned-up record Better Auth ultimately consumes.
  describe('Better Auth scenarios', () => {
    test('session sign-in: forward 1:1 join from session to user', () => {
      // 1. Better Auth wants the user attached to a session.
      const joinConfig: JoinConfig = {
        user: { on: { from: 'userId', to: 'id' }, relation: 'one-to-one' },
      }

      // 2. toPayloadLocalApiConfig translates it to a populate via depth: 1.
      const { depth, joins, mapJoinsToBetterAuth } = toPayloadLocalApiConfig({
        payload: mockPayload,
        baseModel: 'session',
        joinConfig,
      })
      expect(depth).toBe(1)
      expect(joins).toBe(false)

      // 3. Payload returns the session with `userId` populated to the full user
      //    object (because depth: 1). No alias key yet.
      const rawFromPayload: Record<string, unknown> = {
        id: 'session-1',
        token: 'abc',
        userId: { id: 'user-1', name: 'Alice', email: 'alice@test.com' },
      }

      const [mapped] = mapJoinsToBetterAuth([rawFromPayload])

      // 4. After cleanup: scalar FK is restored, alias holds the populated doc,
      //    matching what Better Auth expects (`session.userId === id`,
      //    `session.user === { ... }`).
      expect(mapped).toEqual({
        id: 'session-1',
        token: 'abc',
        userId: 'user-1',
        user: { id: 'user-1', name: 'Alice', email: 'alice@test.com' },
      })
    })

    test('list user sessions: reverse 1:n join from user to sessions', () => {
      // 1. Better Auth wants every session belonging to a user.
      const joinConfig: JoinConfig = {
        session: { on: { from: 'id', to: 'userId' }, relation: 'one-to-many', limit: 50 },
      }

      // 2. toPayloadLocalApiConfig translates it into Payload's joins query parameter,
      //    keyed by the join field name on `users` (`sessions`).
      const { depth, joins, mapJoinsToBetterAuth } = toPayloadLocalApiConfig({
        payload: mockPayload,
        baseModel: 'user',
        joinConfig,
      })
      expect(depth).toBe(1)
      expect(joins).toEqual({ sessions: { limit: 50 } })

      // 3. Payload's join field returns docs wrapped in `{ docs, hasNextPage,
      //    totalDocs }` under the join field name (`sessions`, plural).
      const rawFromPayload: Record<string, unknown> = {
        id: 'user-1',
        name: 'Alice',
        sessions: {
          docs: [
            { id: 'session-1', userId: 'user-1', token: 'abc' },
            { id: 'session-2', userId: 'user-1', token: 'def' },
          ],
          hasNextPage: false,
          totalDocs: 2,
        },
      }

      const [mapped] = mapJoinsToBetterAuth([rawFromPayload])

      // 4. After cleanup: alias (`session`, the singular Better Auth model name)
      //    holds the docs array directly; the original `sessions` key is gone so
      //    the result doesn't carry both shapes.
      expect(mapped).toEqual({
        id: 'user-1',
        name: 'Alice',
        session: [
          { id: 'session-1', userId: 'user-1', token: 'abc' },
          { id: 'session-2', userId: 'user-1', token: 'def' },
        ],
      })
    })

    test('credential lookup: reverse 1:1 join from user to credential account', () => {
      // 1. Better Auth wants the singleton credential account for a user.
      const joinConfig: JoinConfig = {
        account: { on: { from: 'id', to: 'userId' }, relation: 'one-to-one' },
      }

      // 2. toPayloadLocalApiConfig forces `limit: 1` because only one doc is needed.
      const { depth, joins, mapJoinsToBetterAuth } = toPayloadLocalApiConfig({
        payload: mockPayload,
        baseModel: 'user',
        joinConfig,
      })
      expect(depth).toBe(1)
      expect(joins).toEqual({ accounts: { limit: 1 } })

      // 3. Payload returns the same `{ docs, ... }` shape as 1:n, with up to one entry.
      const rawFromPayload: Record<string, unknown> = {
        id: 'user-1',
        name: 'Alice',
        accounts: {
          docs: [
            {
              id: 'account-1',
              userId: 'user-1',
              providerId: 'credential',
              password: 'hashed',
            },
          ],
          hasNextPage: false,
          totalDocs: 1,
        },
      }

      const [mapped] = mapJoinsToBetterAuth([rawFromPayload])

      // 4. After cleanup: alias holds the single object (not an array), and the
      //    raw `accounts` key is removed. Better Auth code that does
      //    `user.account.password` reads it directly.
      expect(mapped).toEqual({
        id: 'user-1',
        name: 'Alice',
        account: {
          id: 'account-1',
          userId: 'user-1',
          providerId: 'credential',
          password: 'hashed',
        },
      })
    })

    test('credential lookup with no matching account: reverse 1:1 returns null', () => {
      // Same shape as above, but the user has no credential account.
      const joinConfig: JoinConfig = {
        account: { on: { from: 'id', to: 'userId' }, relation: 'one-to-one' },
      }
      const { mapJoinsToBetterAuth } = toPayloadLocalApiConfig({
        payload: mockPayload,
        baseModel: 'user',
        joinConfig,
      })

      const rawFromPayload: Record<string, unknown> = {
        id: 'user-2',
        name: 'NoAuth',
        accounts: { docs: [], hasNextPage: false, totalDocs: 0 },
      }

      const [mapped] = mapJoinsToBetterAuth([rawFromPayload])

      // alias is `null` (not `[]`, not `undefined`) — the contract Better Auth's
      // `findUserByEmail` etc. branch on.
      expect(mapped).toEqual({
        id: 'user-2',
        name: 'NoAuth',
        account: null,
      })
    })

    test('combined forward + reverse: load a session with its user *and* the user with sessions in a downstream call', () => {
      // This isn't a single Payload query — it's two adapter calls. Documenting
      // the shapes side-by-side so the contract is visible.

      // (a) Session sign-in path: load session with the user attached.
      {
        const joinConfig: JoinConfig = {
          user: { on: { from: 'userId', to: 'id' }, relation: 'one-to-one' },
        }
        const { mapJoinsToBetterAuth } = toPayloadLocalApiConfig({
          payload: mockPayload,
          baseModel: 'session',
          joinConfig,
        })

        const [mapped] = mapJoinsToBetterAuth([
          {
            id: 'session-1',
            token: 'abc',
            userId: { id: 'user-1', name: 'Alice' },
          },
        ])
        expect(mapped).toEqual({
          id: 'session-1',
          token: 'abc',
          userId: 'user-1',
          user: { id: 'user-1', name: 'Alice' },
        })
      }

      // (b) Admin path: load the user and *all* of their active sessions.
      {
        const joinConfig: JoinConfig = {
          session: { on: { from: 'id', to: 'userId' }, relation: 'one-to-many' },
        }
        const { mapJoinsToBetterAuth } = toPayloadLocalApiConfig({
          payload: mockPayload,
          baseModel: 'user',
          joinConfig,
        })

        const [mapped] = mapJoinsToBetterAuth([
          {
            id: 'user-1',
            name: 'Alice',
            sessions: {
              docs: [{ id: 'session-1', userId: 'user-1' }],
              hasNextPage: false,
              totalDocs: 1,
            },
          },
        ])
        expect(mapped).toEqual({
          id: 'user-1',
          name: 'Alice',
          session: [{ id: 'session-1', userId: 'user-1' }],
        })
      }
    })
  })
})
