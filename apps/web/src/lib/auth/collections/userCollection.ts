import { collectionGroups } from '@/i18n/adminTranslations'
import { andAccess, isAccessibleRole, isAdmin, isAtLeastRole, noone } from '@/lib/auth/access'
import { accessibleRoleBaseListFilter } from '@/lib/auth/collections/accessibleRoleBaseListFilter'
import { banUserHook } from '@/lib/auth/collections/banUserHook'
import { createBetterAuthStrategy } from '@/lib/auth/createBetterAuthStrategy'
import { localeField } from '@/lib/auth/fields/localeField'
import { roleField } from '@/lib/auth/fields/roleField'
import { label } from '@/lib/payload'
import { CollectionConfig } from 'payload'

// https://www.better-auth.com/docs/concepts/database#user
export const userCollection = {
  slug: 'users',
  labels: {
    plural: label('custom:users:plural'),
    singular: label('custom:users:singular'),
  },
  access: {
    create: noone, // handled using signup action
    delete: noone, // temporarily disabled
    read: andAccess(isAtLeastRole('admin'), isAccessibleRole),
    update: andAccess(isAtLeastRole('admin'), isAccessibleRole),
    admin: isAdmin,
  },
  admin: {
    group: collectionGroups.auth,
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role', 'banned'],
    components: {
      views: {
        list: {
          actions: ['@/lib/auth/components/InviteUserButton.tsx#InviteUserButton'],
        },
      },
    },
    baseListFilter: accessibleRoleBaseListFilter,
  },
  auth: {
    disableLocalStrategy: true,
    strategies: [createBetterAuthStrategy('users')],
  },
  fields: [
    // We add change email and change password here instead of updating the save actions.
    // The account page does not render custom save actions.
    {
      name: 'authActions',
      type: 'ui',
      admin: {
        disableListColumn: true,
        components: {
          Field: '@/lib/auth/components/AdminUserActions.tsx#AdminUserActions',
        },
      },
    },
    {
      name: 'name',
      label: label('custom:fields:name'),
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      admin: {
        readOnly: true, // use change email functionality instead
      },
    },
    {
      name: 'emailVerified',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true, // use change email functionality instead
      },
    },
    // https://www.better-auth.com/docs/plugins/admin#schema
    roleField,
    {
      name: 'banned',
      label: label('custom:banned:inactive'),
      type: 'checkbox',
      admin: {
        description: label('custom:banned:description'),
        components: {
          Cell: '@/lib/auth/components/AdminUserBannedCell.tsx#AdminUserBannedCell',
        },
      },
    },
    {
      name: 'banReason',
      type: 'text',
      admin: {
        hidden: true,
        readOnly: true,
      },
    },
    {
      name: 'banExpires',
      type: 'date',
      admin: {
        hidden: true,
        readOnly: true,
      },
    },
    // additional fields
    localeField,
    {
      name: 'sessions',
      type: 'join',
      collection: 'sessions',
      on: 'userId',
      admin: { hidden: true },
    },
    {
      name: 'accounts',
      type: 'join',
      collection: 'accounts',
      on: 'userId',
      admin: { hidden: true },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [banUserHook],
  },
} as const satisfies CollectionConfig
