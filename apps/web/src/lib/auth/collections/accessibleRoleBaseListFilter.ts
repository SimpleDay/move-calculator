import { getAccessibleRoles } from '@/lib/auth'
import { PayloadRequest } from 'payload'

type Options = {
  req: Partial<PayloadRequest>
}

export const accessibleRoleBaseListFilter = ({ req: { user } }: Options) => {
  const role = user?.role
  if (!role) return null
  return {
    role: {
      in: getAccessibleRoles(role),
    },
  }
}
