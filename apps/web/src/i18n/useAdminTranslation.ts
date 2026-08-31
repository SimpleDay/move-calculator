import { AdminTranslationKeys, AdminTranslations } from '@/i18n/adminTranslations'
import { useTranslation as usePayloadTranslation } from '@payloadcms/ui'

export const useAdminTranslation = usePayloadTranslation<AdminTranslations, AdminTranslationKeys>
