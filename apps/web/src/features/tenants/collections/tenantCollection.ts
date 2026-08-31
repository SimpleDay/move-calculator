import { isAdmin, noone } from '@/lib/auth'
import type { CollectionConfig } from 'payload'

export const tenantCollection = {
  slug: 'tenants',
  labels: {
    plural: 'Zügelunternehmen',
    singular: 'Zügelunternehmen',
  },
  admin: {
    group: 'Zügelofferte',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
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
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'branding',
      type: 'group',
      fields: [
        { name: 'accentColor', type: 'text', required: true },
        { name: 'initials', type: 'text', required: true },
        { name: 'promise', type: 'text', required: true },
      ],
    },
    {
      name: 'phoneRequired',
      type: 'checkbox',
      required: true,
      defaultValue: true,
    },
    {
      name: 'pricingDraft',
      type: 'json',
      required: true,
      admin: {
        description: 'Typisierte Entwurfskonfiguration. Änderungen werden über das Preisportal vorgenommen.',
        readOnly: true,
      },
    },
    {
      name: 'servicesDraft',
      type: 'json',
      required: true,
      admin: {
        description: 'Konfigurierbare Zusatzleistungen und Preise.',
        readOnly: true,
      },
    },
    {
      name: 'activePricingProfile',
      type: 'relationship',
      relationTo: 'pricing-profiles',
      admin: { readOnly: true },
    },
  ],
  timestamps: true,
} as const satisfies CollectionConfig
