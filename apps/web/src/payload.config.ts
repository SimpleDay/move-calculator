import { constants } from '@/constants'
import { pricingProfileCollection } from '@/features/pricing/collections/pricingProfileCollection'
import { quoteCollection } from '@/features/quotes/collections/quoteCollection'
import { quoteRevisionCollection } from '@/features/quotes/collections/quoteRevisionCollection'
import { tenantCollection } from '@/features/tenants/collections/tenantCollection'
import { tenantMembershipCollection } from '@/features/tenants/collections/tenantMembershipCollection'
import { adminTranslations } from '@/i18n/adminTranslations'
import {
  accountCollection,
  defaultAccessPlugin,
  invitationCollection,
  isAdmin,
  rateLimitCollection,
  sessionCollection,
  userCollection,
  verificationCollection,
} from '@/lib/auth'
import { emailAdapter } from '@/lib/email/adapter'
import { forwardErrorLogsToSentry } from '@/lib/sentry/forwardErrorLogsToSentry'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { de } from '@payloadcms/translations/languages/de'
import { en } from '@payloadcms/translations/languages/en'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  logger: {
    options: {
      level: process.env.PAYLOAD_LOG_LEVEL ?? 'info',
      hooks: forwardErrorLogsToSentry,
    },
  },
  localization: {
    locales: ['de', 'en'],
    defaultLocale: 'de',
    fallback: true,
  },
  i18n: {
    supportedLanguages: { en, de },
    fallbackLanguage: 'en',
    translations: adminTranslations,
  },
  admin: {
    user: userCollection.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      logout: {
        Button: {
          path: '@/lib/auth/components/AdminLogoutButton#AdminLogoutButton',
        },
      },
      views: {
        adminInitialSignup: {
          path: constants.auth.adminRoutes.initialSignup,
          Component: '@/lib/auth/components/AdminInitialSignup#AdminInitialSignup',
          exact: true,
        },
        adminLogin: {
          path: constants.auth.adminRoutes.login,
          Component: '@/lib/auth/components/AdminLogin#AdminLogin',
          exact: true,
        },
        adminLogout: {
          path: constants.auth.adminRoutes.logout,
          Component: '@/lib/auth/components/AdminLogoutView#AdminLogoutView',
          exact: true,
        },
        adminInvitation: {
          path: constants.auth.adminRoutes.acceptInvitation,
          Component: '@/lib/auth/components/AdminInvitationView#AdminInvitationView',
          exact: true,
        },
        adminForgotPassword: {
          path: constants.auth.adminRoutes.forgotPassword,
          Component: '@/lib/auth/components/AdminForgotPasswordView#AdminForgotPasswordView',
          exact: true,
        },
        adminResetPassword: {
          path: constants.auth.adminRoutes.resetPassword,
          Component: '@/lib/auth/components/AdminResetPasswordView#AdminResetPasswordView',
          exact: true,
        },
        adminChangePassword: {
          path: constants.auth.adminRoutes.changePassword,
          Component: '@/lib/auth/components/AdminChangePasswordView#AdminChangePasswordView',
          exact: true,
        },
        adminChangeEmail: {
          path: constants.auth.adminRoutes.changeEmail,
          Component: '@/lib/auth/components/AdminChangeEmailView#AdminChangeEmailView',
          exact: true,
        },
      },
    },
    routes: {
      login: constants.auth.adminRoutes.login,
      logout: constants.auth.adminRoutes.logout,
      forgot: constants.auth.adminRoutes.forgotPassword,
    },
  },
  graphQL: {
    disable: true,
  },
  collections: [
    userCollection,
    sessionCollection,
    accountCollection,
    verificationCollection,
    rateLimitCollection,
    invitationCollection,
    tenantCollection,
    tenantMembershipCollection,
    pricingProfileCollection,
    quoteCollection,
    quoteRevisionCollection,
  ],
  secret: process.env.PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    idType: 'uuid',
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    push: shouldPushDatabaseSchema(),
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // this should be last to override collections of other plugins
    defaultAccessPlugin({
      defaults: {
        admin: isAdmin,
        read: isAdmin,
        create: isAdmin,
        update: isAdmin,
        delete: isAdmin,
        readVersions: isAdmin,
        unlock: isAdmin,
      },
    }),
  ],
  email: emailAdapter(),
})

function shouldPushDatabaseSchema() {
  if (process.env.DATABASE_SCHEMA_PUSH) {
    return process.env.DATABASE_SCHEMA_PUSH === 'true'
  }
  return process.env.NODE_ENV === 'development'
}
