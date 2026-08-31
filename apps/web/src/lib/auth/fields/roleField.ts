import { allRoles, isRoleAccessible, Role } from '@/lib/auth'
import { capitalizeFirstLetter } from '@better-auth/core/utils/string'
import { Option, SelectField } from 'payload'

export function toRoleOptions(roles: Role[]) {
  return roles.map((role) => ({
    label: capitalizeFirstLetter(role),
    value: role,
  }))
}

export const roleField = {
  name: 'role',
  type: 'select',
  options: toRoleOptions(allRoles),
  filterOptions: ({ options, req: { user } }) => {
    return options.filter((option) => !user || isRoleAccessible(user.role, toValue(option) as Role))
  },
  required: true,
} as const satisfies SelectField

function toValue(option: Option) {
  return typeof option === 'string' ? option : option.value
}
