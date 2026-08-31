import { collectionGroups } from '@/i18n/adminTranslations'
import { isAtLeastRole, noone } from '@/lib/auth'
import { label } from '@/lib/payload'
import { CollectionConfig } from 'payload'

// https://www.better-auth.com/docs/concepts/database#account
export const accountCollection = {
  slug: 'accounts',
  labels: {
    plural: label('custom:accounts:plural'),
    singular: label('custom:accounts:singular'),
  },
  access: {
    create: noone,
    read: isAtLeastRole('platformAdmin'),
    update: noone,
    delete: noone,
  },
  admin: {
    group: collectionGroups.auth,
    useAsTitle: 'userId',
    defaultColumns: ['userId', 'providerId'],
  },
  fields: [
    {
      name: 'userId',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'accountId',
      type: 'text',
      required: true,
    },
    {
      name: 'providerId',
      type: 'text',
      required: true,
    },
    {
      name: 'accessToken',
      type: 'text',
    },
    {
      name: 'refreshToken',
      type: 'text',
    },
    {
      name: 'accessTokenExpiresAt',
      type: 'date',
    },
    {
      name: 'refreshTokenExpiresAt',
      type: 'date',
    },
    {
      name: 'scope',
      type: 'text',
    },
    {
      name: 'idToken',
      type: 'text',
    },
    {
      name: 'password',
      type: 'text',
    },
  ],
  timestamps: true,
} as const satisfies CollectionConfig
