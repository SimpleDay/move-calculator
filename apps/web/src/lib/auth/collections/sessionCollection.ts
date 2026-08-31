import { collectionGroups } from '@/i18n/adminTranslations'
import { isAtLeastRole, noone } from '@/lib/auth'
import { CollectionConfig } from 'payload'

// https://www.better-auth.com/docs/concepts/database#session
export const sessionCollection = {
  slug: 'sessions',
  access: {
    create: noone,
    read: isAtLeastRole('platformAdmin'),
    update: noone,
    delete: noone,
  },
  admin: {
    group: collectionGroups.auth,
  },
  fields: [
    {
      name: 'userId',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'token',
      type: 'text',
      required: true,
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
    },
    {
      name: 'ipAddress',
      type: 'text',
    },
    {
      name: 'userAgent',
      type: 'text',
    },
    // https://www.better-auth.com/docs/plugins/admin#schema
    {
      name: 'impersonatedBy',
      type: 'text',
    },
  ],
  timestamps: true,
} as const satisfies CollectionConfig
