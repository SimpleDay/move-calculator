import { UserInvitation } from '@/payload-types'
import { isAfter } from 'date-fns'

export function isInvitationValid(invitation: UserInvitation): boolean {
  return !isAfter(new Date(), invitation.expiresAt)
}
