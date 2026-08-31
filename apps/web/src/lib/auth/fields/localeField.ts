import { label } from '@/lib/payload'
import { SelectField } from 'payload'

export const localeField: SelectField = {
  name: 'locale',
  type: 'select',
  label: label('general:language'),
  required: true,
  defaultValue: 'en',
  options: [
    {
      label: label('custom:locale:en'),
      value: 'en',
    },
    {
      label: label('custom:locale:de'),
      value: 'de',
    },
  ],
  admin: {
    // this field is synced from the payload cookie for admin users
    hidden: true,
    readOnly: true,
  },
}
