import { Role } from '@/lib/auth/access'
import { User, UserInvitation } from '@/payload-types'
import { Locale } from 'next-intl'

export type AcceptInvitationOptions = {
  invitation: UserInvitation
  name: string
  password: string
  locale: Locale
}

export type SignUpUserOptions = {
  email: string
  name: string
  password: string
  role: Role
  locale: Locale
}

export type SendInvitationEmailOptions = {
  invitationId: string
  locale: Locale
}

export type RevokeSessionsOptions = {
  userId: string
}

export type AuthService = {
  sendInvitationEmail(options: SendInvitationEmailOptions): Promise<void>
  getUserFromSession(headers: Headers): Promise<User | undefined>
  getValidInvitation(token: string): Promise<UserInvitation | undefined>
  acceptInvitation(opts: AcceptInvitationOptions): Promise<void>
  signUpUser(opts: SignUpUserOptions): Promise<void>
  hasUsers(): Promise<boolean>
  revokeSessions(opts: RevokeSessionsOptions): Promise<void>
}
