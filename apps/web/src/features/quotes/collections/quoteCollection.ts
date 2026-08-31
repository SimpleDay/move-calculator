import { quoteStatuses } from '@/features/quoteFlow/model'
import { isAdmin, noone } from '@/lib/auth'
import type { CollectionConfig } from 'payload'

export const quoteCollection = {
  slug: 'quotes',
  labels: {
    plural: 'Offerten',
    singular: 'Offerte',
  },
  admin: {
    group: 'Zügelofferte',
    defaultColumns: ['customerName', 'status', 'tenant', 'updatedAt'],
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
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: quoteStatuses.map((status) => ({ label: status, value: status })),
    },
    {
      name: 'accessTokenHash',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      hidden: true,
    },
    {
      name: 'customerName',
      type: 'text',
      required: true,
    },
    {
      name: 'contact',
      type: 'json',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'moveSnapshot',
      type: 'json',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'currentRevision',
      type: 'relationship',
      relationTo: 'quote-revisions',
      admin: { readOnly: true },
    },
    {
      name: 'confirmedRevision',
      type: 'relationship',
      relationTo: 'quote-revisions',
      admin: { readOnly: true },
    },
    {
      name: 'confirmationRequestedAt',
      type: 'date',
      admin: { readOnly: true },
    },
    {
      name: 'companyConfirmedAt',
      type: 'date',
      admin: { readOnly: true },
    },
  ],
  timestamps: true,
} as const satisfies CollectionConfig
