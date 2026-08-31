import { isAdmin, noone } from '@/lib/auth'
import type { CollectionConfig } from 'payload'

export const quoteRevisionCollection = {
  slug: 'quote-revisions',
  labels: {
    plural: 'Offertrevisionen',
    singular: 'Offertrevision',
  },
  admin: {
    group: 'Zügelofferte',
    defaultColumns: ['quote', 'revision', 'reason', 'createdAt'],
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
      name: 'quote',
      type: 'relationship',
      relationTo: 'quotes',
      required: true,
      index: true,
    },
    {
      name: 'revision',
      type: 'number',
      required: true,
      min: 1,
      index: true,
    },
    {
      name: 'reason',
      type: 'select',
      required: true,
      options: [
        { label: 'Erstberechnung', value: 'initial' },
        { label: 'Kundenänderung', value: 'customerChange' },
        { label: 'Unternehmensänderung', value: 'companyChange' },
      ],
    },
    {
      name: 'pricingProfile',
      type: 'relationship',
      relationTo: 'pricing-profiles',
      required: true,
      index: true,
    },
    {
      name: 'inputSnapshot',
      type: 'json',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'calculationSnapshot',
      type: 'json',
      required: true,
      admin: { readOnly: true },
    },
  ],
  timestamps: true,
} as const satisfies CollectionConfig
