import { AcceptInvitationOptions, BetterAuthType } from '@/lib/auth'
import { TransactionalOperations } from '@/lib/tx'

export const acceptInvitation =
  (localApi: TransactionalOperations, betterAuth: BetterAuthType) =>
  async ({ invitation, name, password }: AcceptInvitationOptions) => {
    await localApi.delete({
      collection: 'user-invitations',
      id: invitation.id,
    })
    // this does not create an email verification email, which we want
    const { user } = await betterAuth.api.createUser({
      body: {
        name,
        password,
        email: invitation.email,
        role: invitation.role,
      },
    })
    await localApi.update({
      collection: 'users',
      id: user.id,
      data: {
        emailVerified: true,
      },
    })
    await betterAuth.api.signInEmail({
      body: {
        email: invitation.email,
        password,
      },
    })
  }
