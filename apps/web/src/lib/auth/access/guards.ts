import { AdminRole, isAdminRole, isRoleAccessible, Role } from '@/lib/auth/access/roles'
import { isDefined } from '@zuegelofferte/shared'
import type { Access, AccessArgs, PayloadRequest } from 'payload'

type HasPayloadRequest = { req: PayloadRequest }

export const anyone = () => true

export const noone = () => false

export const isAtLeastRole = (thresholdRole: AdminRole) => (args: HasPayloadRequest) => {
  const role = args.req.user?.role
  return isDefined(role) && isRoleAccessible(role, thresholdRole)
}

export const isAdmin = ({ req: { user } }: HasPayloadRequest) => {
  const role = user?.role ?? ''
  return isAdminRole(role)
}

export function andAccess<TData>(...guards: Access<TData>[]) {
  return (args: AccessArgs<TData>) => {
    return guards.every((guard) => guard(args))
  }
}

export const isAccessibleRole = (args: AccessArgs<{ role: Role }>) => {
  const {
    req: { user },
    data,
  } = args
  const targetRole = data?.role
  return !targetRole || isRoleAccessible(user?.role as AdminRole, targetRole)
}

export const isAdminOrPublished: Access = (arg: HasPayloadRequest) => {
  return (
    isAdmin(arg) || {
      _status: {
        equals: 'published',
      },
    }
  )
}
