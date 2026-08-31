import { isInvitationValid } from '@/lib/auth/business/isInvitationValid'
import { TransactionalOperations } from '@/lib/tx'

export const getValidInvitation = (txOperations: TransactionalOperations) => async (token: string) => {
  const { docs } = await txOperations.find({
    collection: 'user-invitations',
    pagination: false,
    limit: 1,
    where: {
      token: {
        equals: token,
      },
    },
  })
  const invitation = docs.length > 0 ? docs[0] : undefined
  if (!invitation || !isInvitationValid(invitation)) {
    return undefined
  }
  return invitation
}
