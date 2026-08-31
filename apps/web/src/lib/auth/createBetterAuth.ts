import { adminRoles, roles } from '@/lib/auth/access/roles'
import { createAdapter } from '@/lib/auth/adapter'
import { EmailService } from '@/lib/email'
import { getServerSideDomain } from '@/lib/getServerSideDomain'
import { TransactionalOperations } from '@/lib/tx'
import { betterAuth, BetterAuthOptions, User } from 'better-auth'
import { createAuthMiddleware } from 'better-auth/api'
import { nextCookies } from 'better-auth/next-js'
import { admin } from 'better-auth/plugins'
import { Locale } from 'next-intl'
import { BasePayload } from 'payload'

type UserWithLocale = User & { locale: Locale }

export const createBetterAuthOptions = (
  payload: BasePayload,
  txOperations: TransactionalOperations,
  emailService: EmailService,
) =>
  ({
    baseURL: getServerSideDomain(),
    database: createAdapter(payload, txOperations),
    hooks: {
      after: createAuthMiddleware(async (ctx) => {
        if (ctx.path.endsWith('/change-password') && ctx.context.session?.user) {
          const user = ctx.context.session.user
          await emailService.sendPasswordChangedEmail({
            recipient: {
              name: user.name,
              email: user.email,
            },
            locale: user.locale,
          })
        }
      }),
    },
    rateLimit: {
      enabled: true,
      storage: 'database',
    },
    user: {
      additionalFields: {
        locale: {
          required: true,
          returned: true,
          input: true,
          type: ['en', 'de'] as const,
        },
      },
      changeEmail: {
        enabled: true,
        sendChangeEmailConfirmation: async ({ user: userUntyped, newEmail, url }) => {
          const user = userUntyped as UserWithLocale
          await emailService.sendEmailChangeStartedEmail({
            recipient: user,
            locale: user.locale,
          })
          await emailService.sendVerificationEmail({
            recipient: { name: user.name, email: newEmail },
            locale: user.locale,
            url,
          })
        },
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user: userUntyped, url }) => {
        const user = userUntyped as UserWithLocale
        await emailService.sendResetPasswordEmail({ recipient: user, url, locale: user.locale })
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      sendVerificationEmail: async ({ user: userUntyped, url }) => {
        const user = userUntyped as UserWithLocale
        await emailService.sendVerificationEmail({ recipient: user, url, locale: user.locale })
      },
      autoSignInAfterVerification: true,
    },
    session: {
      expiresIn: 28 * 24 * 60 * 60, // 28 days in seconds
      cookieCache: {
        enabled: true,
        maxAge: 300, // 5 minutes
      },
    },
    experimental: {
      joins: true,
    },
    // plugins need to be mirrored in `createBetterAuthClient` if available
    plugins: [
      nextCookies(),
      admin({
        roles,
        adminRoles: [...Object.keys(adminRoles)],
        defaultRole: 'user',
      }),
    ],
  }) satisfies BetterAuthOptions

export type BetterAuthType = ReturnType<typeof betterAuth<ReturnType<typeof createBetterAuthOptions>>>

export const createBetterAuth = (
  payload: BasePayload,
  localApi: TransactionalOperations,
  emailService: EmailService,
): BetterAuthType => betterAuth(createBetterAuthOptions(payload, localApi, emailService))
