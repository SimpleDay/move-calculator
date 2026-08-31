import { I18nClient, NestedKeysStripped } from '@payloadcms/translations'
import { enTranslations } from '@payloadcms/translations/languages/en'
import { Locale } from 'next-intl'

export const adminTranslations = {
  en: (await import('@/messages/admin/en.json')).default,
  de: (await import('@/messages/admin/de.json')).default,
}

export const collectionGroups: Record<string, Record<Locale, string>> = {
  auth: {
    en: 'Account Management',
    de: 'Account-Verwaltung',
  },
}

export type AdminTranslations = typeof adminTranslations.en & typeof enTranslations

export type AdminTranslationKeys = NestedKeysStripped<AdminTranslations>

export const getAdminTranslation = (client: I18nClient): I18nClient<AdminTranslations, AdminTranslationKeys> => {
  return client as I18nClient<AdminTranslations, AdminTranslationKeys>
}
