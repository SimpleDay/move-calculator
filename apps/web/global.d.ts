import { routing } from '@/i18n/routing'
import messages from '@/messages/app/de.json'

declare module 'next-intl' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface AppConfig {
    Locale: (typeof routing.locales)[number]
    Messages: typeof messages
  }
}
