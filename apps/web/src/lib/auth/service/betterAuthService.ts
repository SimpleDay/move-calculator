import { AuthService, BetterAuthType } from '@/lib/auth'
import { acceptInvitation } from '@/lib/auth/service/acceptInvitation'
import { getUserFromSession } from '@/lib/auth/service/getUserFromSession'
import { getValidInvitation } from '@/lib/auth/service/getValidInvitation'
import { hasUsers } from '@/lib/auth/service/hasUsers'
import { revokeSessions } from '@/lib/auth/service/revokeSessions'
import { sendInvitationEmail } from '@/lib/auth/service/sendInvitationEmail'
import { signUpUser } from '@/lib/auth/service/signUpUser'
import { EmailService } from '@/lib/email'
import { TransactionalOperations } from '@/lib/tx'
import { BasePayload } from 'payload'

export function betterAuthService(
  betterAuth: BetterAuthType,
  payload: BasePayload,
  localApi: TransactionalOperations,
  emailService: EmailService,
): AuthService {
  return {
    sendInvitationEmail: sendInvitationEmail(payload, localApi, emailService),
    getUserFromSession: getUserFromSession(betterAuth, localApi),
    getValidInvitation: getValidInvitation(localApi),
    acceptInvitation: acceptInvitation(localApi, betterAuth),
    signUpUser: signUpUser(betterAuth, payload),
    hasUsers: hasUsers(localApi),
    revokeSessions: revokeSessions(betterAuth),
  }
}
