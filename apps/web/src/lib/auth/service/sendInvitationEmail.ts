import { constants } from '@/constants'
import { SendInvitationEmailOptions } from '@/lib/auth'
import { EmailRecipient, EmailService } from '@/lib/email'
import { getServerSideDomain } from '@/lib/getServerSideDomain'
import { TransactionalOperations } from '@/lib/tx'
import { BasePayload } from 'payload'

export const sendInvitationEmail =
  (payload: BasePayload, localApi: TransactionalOperations, emailService: EmailService) =>
  async ({ invitationId, locale }: SendInvitationEmailOptions) => {
    const fullDoc = await localApi.findByID({
      collection: 'user-invitations',
      id: invitationId,
    })
    const recipient: EmailRecipient = {
      email: fullDoc.email,
      name: fullDoc.name,
    }
    const url = `${getServerSideDomain()}${payload.config.routes.admin}${constants.auth.adminRoutes.acceptInvitation}?token=${fullDoc.token}`
    // we do not have a locale for the user yet, so we fallback
    await emailService.sendInvitationEmail({ recipient, url, locale })
  }
