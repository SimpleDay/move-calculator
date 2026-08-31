import { accessLevels } from '@zuegelofferte/api'
import { describe, expect, test } from 'vitest'
import { adminRoles, allRoles, getAccessibleRoles, isAdminRole, roles, rolesOrdered } from './roles'

describe('isAdminRole', () => {
  test.for(Object.keys(adminRoles))('returns true given %s', (role) => {
    const result = isAdminRole(role)
    expect(result).toBe(true)
  })

  test('returns false given not-admin', () => {
    const result = isAdminRole('not-admin')
    expect(result).toBe(false)
  })
})

describe('isRoleAccessible', () => {
  test('returns true when the role is accessible', () => {
    const parentRole = 'platformAdmin'
    const childRole = 'user'

    const result = getAccessibleRoles(parentRole).includes(childRole)

    expect(result).toBe(true)
  })

  test('returns false when the role is not accessible', () => {
    const parentRole = 'user'
    const inaccessibleRole = 'platformAdmin'

    const result = getAccessibleRoles(parentRole).includes(inaccessibleRole)

    expect(result).toBe(false)
  })
})

describe('getAccessibleRoles', () => {
  test('returns all roles given platformAdmin', () => {
    const result = getAccessibleRoles('platformAdmin')
    const allRoles = [...Object.keys(roles)]
    expect(result).toEqual(expect.arrayContaining(allRoles))
  })

  test('returns only user roles given user', () => {
    const result = getAccessibleRoles('user')
    expect(result).toEqual(['user'])
  })
})

describe('allRoles', () => {
  test('contains all roles', () => {
    expect(allRoles).toEqual(expect.arrayContaining(Object.keys(roles)))
  })
})

describe('accessLevels (packages/api)', () => {
  // accessLevels duplicates the role ranking because packages/api must not
  // depend on apps/web. This test is the tripwire for the two lists drifting.
  test('role levels match rolesOrdered in names and order', () => {
    const roleLevelsAscending = accessLevels.filter((level) => level !== 'anonymous' && level !== 'authorized')
    // `user` is intentionally absent from accessLevels: a plain user passes
    // 'authorized' via the session check, never via role rank.
    const rolesAscendingWithoutUser = [...rolesOrdered].reverse().filter((role) => role !== 'user')
    expect(roleLevelsAscending).toEqual(rolesAscendingWithoutUser)
  })
})
