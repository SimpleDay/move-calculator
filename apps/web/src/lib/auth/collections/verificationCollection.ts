import { collectionGroups } from '@/i18n/adminTranslations'
import { isAtLeastRole, noone } from '@/lib/auth'
import { CollectionConfig } from 'payload'

// https://www.better-auth.com/docs/concepts/database#verification
export const verificationCollection = {
  slug: 'verifications',
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
      name: 'identifier',
      type: 'text',
      required: true,
    },
    {
      name: 'value',
      type: 'text',
      required: true,
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
    },
  ],
  timestamps: true,
} as const satisfies CollectionConfig
