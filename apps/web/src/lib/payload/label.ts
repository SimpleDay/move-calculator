import type { AdminTranslationKeys } from '@/i18n/adminTranslations'
import type { LabelFunction } from 'payload'

export function label(key: AdminTranslationKeys): LabelFunction {
  return ({ t }) => t(key as never)
}
