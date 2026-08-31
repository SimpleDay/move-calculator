import { AdminTranslationKeys } from '@/i18n/adminTranslations'

export function mapErrorCodeToAdminTranslationKey(errorCode: string): AdminTranslationKeys {
  switch (errorCode) {
    case 'INVALID_PASSWORD':
      return 'custom:error:passwordIncorrect'
    case 'BANNED_USER':
      return 'custom:error:bannedUser'
    case 'INVALID_EMAIL_OR_PASSWORD':
      return 'error:emailOrPasswordIncorrect'
    case 'noValidInvitation':
      return 'custom:error:noValidInvitation'
    default:
      return 'error:unknown'
  }
}
