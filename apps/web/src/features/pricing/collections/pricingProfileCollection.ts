import { isAdmin, noone } from '@/lib/auth'
import type { CollectionConfig } from 'payload'

export const pricingProfileCollection = {
  slug: 'pricing-profiles',
  labels: {
    plural: 'Veröffentlichte Preisprofile',
    singular: 'Veröffentlichtes Preisprofil',
  },
  admin: {
    group: 'Zügelofferte',
    useAsTitle: 'label',
    defaultColumns: ['label', 'tenant', 'version', 'publishedAt'],
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
      name: 'label',
      type: 'text',
      required: true,
    },
    {
      name: 'version',
      type: 'number',
      required: true,
      min: 1,
      index: true,
    },
    {
      name: 'settings',
      type: 'json',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'services',
      type: 'json',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      index: true,
      admin: { readOnly: true },
    },
  ],
  timestamps: true,
} as const satisfies CollectionConfig
