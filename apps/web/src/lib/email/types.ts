import { Locale } from 'next-intl'

export type EmailRecipient = {
  email: string
  name?: string
}

export type BaseEmailOptions = {
  recipient: EmailRecipient
  locale: Locale
}

export type VerificationEmailOptions = BaseEmailOptions & {
  url: string
}

export type ResetPasswordEmailOptions = BaseEmailOptions & {
  url: string
}

export type InvitationEmailOptions = BaseEmailOptions & {
  url: string
}

export type PasswordChangedEmailOptions = BaseEmailOptions

export type EmailChangeStartedEmailOptions = BaseEmailOptions

export type UserBannedEmailOptions = BaseEmailOptions

export type EmailService = {
  sendInvitationEmail: (opts: InvitationEmailOptions) => Promise<void>
  sendVerificationEmail: (opts: VerificationEmailOptions) => Promise<void>
  sendResetPasswordEmail: (opts: ResetPasswordEmailOptions) => Promise<void>
  sendPasswordChangedEmail: (opts: PasswordChangedEmailOptions) => Promise<void>
  sendEmailChangeStartedEmail: (opts: EmailChangeStartedEmailOptions) => Promise<void>
  sendUserBannedEmail: (opts: UserBannedEmailOptions) => Promise<void>
}
