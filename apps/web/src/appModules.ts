import { authModule } from '@/lib/auth/authModule'
import { emailModule } from '@/lib/email/emailModule'
import { payloadModule } from '@/lib/payload/payloadModule'
import { sentryModule } from '@/lib/sentry/sentryModule'
import { txModule } from '@/lib/tx/txModule'

export const appModules = [authModule, txModule, emailModule, sentryModule, payloadModule]
