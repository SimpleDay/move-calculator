import { di } from '@/di'
import { User } from '@/payload-types'
import { AccessLevel } from '@zuegelofferte/api'
import { describe, expect, it, vi } from 'vitest'
import { accessMiddleware } from './accessMiddleware'

const mockGetUserFromSession = vi.fn<() => Promise<User | undefined>>()

const fakeApp = {
  inject: (symbol: symbol) => {
    if (symbol === (di.authService as symbol)) {
      return { getUserFromSession: mockGetUserFromSession }
    }
    throw new Error(`Unexpected injection: ${String(symbol)}`)
  },
} as never

async function runMiddleware(access?: AccessLevel) {
  const next = vi.fn().mockResolvedValue({ output: undefined, context: {} })

  const options = {
    context: { app: fakeApp, request: new Request('http://localhost') },
    procedure: { '~orpc': { meta: { access } } },
    path: [],
    signal: undefined,
    lastEventId: undefined,
    next,
    errors: {},
  } as never

  const result = await accessMiddleware(options, undefined, vi.fn())
  return { result, next }
}

function userWithRole(role: User['role']): User {
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

describe('accessMiddleware', () => {
  it('rejects unauthenticated requests with UNAUTHORIZED by default', async () => {
    mockGetUserFromSession.mockResolvedValue(undefined)
    await expect(runMiddleware()).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
  })

  it('allows unauthenticated requests for anonymous procedures', async () => {
    mockGetUserFromSession.mockResolvedValue(undefined)
    const { next } = await runMiddleware('anonymous')
    expect(next).toHaveBeenCalledOnce()
  })

  it('allows any session user by default and passes the user into the context', async () => {
    const user = userWithRole('user')
    mockGetUserFromSession.mockResolvedValue(user)
    const { next } = await runMiddleware()
    expect(next).toHaveBeenCalledWith({ context: { user } })
  })

  it('rejects a session user below the required role with FORBIDDEN', async () => {
    mockGetUserFromSession.mockResolvedValue(userWithRole('user'))
    await expect(runMiddleware('admin')).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  it('allows a session user meeting the required role', async () => {
    mockGetUserFromSession.mockResolvedValue(userWithRole('admin'))
    const { next } = await runMiddleware('admin')
    expect(next).toHaveBeenCalledOnce()
  })

  it('allows a session user above the required role', async () => {
    mockGetUserFromSession.mockResolvedValue(userWithRole('platformAdmin'))
    const { next } = await runMiddleware('editor')
    expect(next).toHaveBeenCalledOnce()
  })
})
