import { isDefined } from '@zuegelofferte/shared'
import { createAccessControl } from 'better-auth/plugins/access'

const dummyStatements = {
  dummy: ['edit'],
}

const ac = createAccessControl(dummyStatements)

export const adminRoles = {
  platformAdmin: ac.newRole(dummyStatements),
  admin: ac.newRole(dummyStatements),
  editor: ac.newRole(dummyStatements),
} as const

const userRoles = {
  user: ac.newRole(dummyStatements),
} as const

export const roles = {
  ...adminRoles,
  ...userRoles,
} as const

export const allRoles: Role[] = ['platformAdmin', 'admin', 'editor', 'user']

// Most to least privileged. The role levels in `accessLevels` (packages/api)
// must stay consistent with this order — enforced by roles.unit.test.ts.
export const rolesOrdered = ['platformAdmin', 'admin', 'editor', 'user'] as const

export type AdminRole = keyof typeof adminRoles

export type UserRole = keyof typeof userRoles

export type Role = keyof typeof roles

export function hasAdminRole(user?: { role: Role } | null): boolean {
  return isDefined(user) && isAdminRole(user.role)
}

export function isAdminRole(subject: string): subject is AdminRole {
  return Object.keys(adminRoles).includes(subject as AdminRole)
}

export function isRoleAccessible(source: Role, target: Role): boolean {
  return rolesOrdered.indexOf(source) <= rolesOrdered.indexOf(target)
}

export function getAccessibleRoles(source: Role): Role[] {
  return [...rolesOrdered.slice(rolesOrdered.indexOf(source))]
}
