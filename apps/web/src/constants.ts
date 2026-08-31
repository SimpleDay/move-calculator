import { ifDefined } from '@zuegelofferte/shared'
import 'server-cli-only'
import { z } from 'zod'

export const constants = {
  projectName: 'zuegelofferte',
  auth: {
    adminRoutes: {
      login: '/auth/login',
      logout: '/auth/logout',
      initialSignup: '/auth/initial-signup',
      verifyEmail: '/auth/verify-email',
      acceptInvitation: '/auth/accept-invitation',
      forgotPassword: '/auth/forgot-password',
      resetPassword: '/auth/reset-password',
      changeEmail: '/auth/change-email',
      changePassword: '/auth/change-password',
    },
    invitations: {
      maxAgeInDays: 7,
    },
  },
  email: {
    defaultFromAddress: ifDefined(process.env.EMAIL_FROM_ADDRESS, z.email().parse) ?? 'no-reply@mail.devedis.dev',
    defaultFromName: 'Zuegelofferte',
  },
} as const
