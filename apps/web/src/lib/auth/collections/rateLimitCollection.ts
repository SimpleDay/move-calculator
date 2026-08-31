import { collectionGroups } from '@/i18n/adminTranslations'
import { isAtLeastRole, noone } from '@/lib/auth'
import { CollectionConfig } from 'payload'

// https://www.better-auth.com/docs/concepts/rate-limit#schema
export const rateLimitCollection = {
  slug: 'rateLimits',
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
      name: 'key',
      type: 'text',
      required: true,
    },
    {
      name: 'count',
      type: 'number',
      required: true,
    },
    // better auth uses bigint. Not sure if this will work
    {
      name: 'lastRequest',
      type: 'number',
    },
  ],
} as const satisfies CollectionConfig
