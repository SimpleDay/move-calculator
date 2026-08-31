import { describe, expect, it } from 'vitest'
import { AccessLevel, hasAccess } from './access'

const anonymous = null
const user = { role: 'user' }
const editor = { role: 'editor' }
const admin = { role: 'admin' }
const platformAdmin = { role: 'platformAdmin' }
const roleless = { role: null }

describe('hasAccess', () => {
  const matrix: [AccessLevel, boolean, boolean, boolean, boolean, boolean][] = [
    // level, anonymous, user, editor, admin, platformAdmin
    ['anonymous', true, true, true, true, true],
    ['authorized', false, true, true, true, true],
    ['editor', false, false, true, true, true],
    ['admin', false, false, false, true, true],
    ['platformAdmin', false, false, false, false, true],
  ]

  it.each(matrix)('level %s', (level, forAnonymous, forUser, forEditor, forAdmin, forPlatformAdmin) => {
    expect(hasAccess(anonymous, level)).toBe(forAnonymous)
    expect(hasAccess(user, level)).toBe(forUser)
    expect(hasAccess(editor, level)).toBe(forEditor)
    expect(hasAccess(admin, level)).toBe(forAdmin)
    expect(hasAccess(platformAdmin, level)).toBe(forPlatformAdmin)
  })

  it('defaults to authorized', () => {
    expect(hasAccess(anonymous)).toBe(false)
    expect(hasAccess(user)).toBe(true)
  })

  it('treats a session user without role as authorized but not privileged', () => {
    expect(hasAccess(roleless, 'authorized')).toBe(true)
    expect(hasAccess(roleless, 'editor')).toBe(false)
  })

  it('denies unknown roles for privileged levels', () => {
    expect(hasAccess({ role: 'somethingElse' }, 'editor')).toBe(false)
  })
})
