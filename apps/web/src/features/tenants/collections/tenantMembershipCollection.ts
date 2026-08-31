import { isAdmin, noone } from '@/lib/auth'
import type { CollectionConfig } from 'payload'

export const tenantMembershipCollection = {
  slug: 'tenant-memberships',
  labels: {
    plural: 'Unternehmenszugänge',
    singular: 'Unternehmenszugang',
  },
  admin: {
    group: 'Zügelofferte',
    defaultColumns: ['tenant', 'user', 'role'],
  },
  access: {
    admin: isAdmin,
    create: noone,
    delete: noone,
    read: isAdmin,
    update: noone,
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'estimator',
      options: [
        { label: 'Inhaber:in', value: 'owner' },
        { label: 'Administration', value: 'admin' },
        { label: 'Offerten', value: 'estimator' },
      ],
    },
  ],
  timestamps: true,
} as const satisfies CollectionConfig
