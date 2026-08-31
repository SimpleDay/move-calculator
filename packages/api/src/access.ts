// Ordered least to most privileged. Role levels must stay consistent with
// `rolesOrdered` in apps/web/src/lib/auth/access/roles.ts.
export const accessLevels = ['anonymous', 'authorized', 'editor', 'admin', 'platformAdmin'] as const

export type AccessLevel = (typeof accessLevels)[number]

// Structural subset of the Payload `User` so this stays usable on the client.
type AccessUser = { role?: string | null } | null | undefined

export function hasAccess(user: AccessUser, level: AccessLevel = 'authorized'): boolean {
  if (level === 'anonymous') {
    return true
  }
  if (!user) {
    return false
  }
  if (level === 'authorized') {
    return true
  }
  const userLevel = accessLevels.indexOf(user.role as AccessLevel)
  return userLevel >= accessLevels.indexOf(level)
}
