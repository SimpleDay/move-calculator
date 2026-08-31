import { BetterAuthType, RevokeSessionsOptions } from '@/lib/auth'

export const revokeSessions =
  (betterAuth: BetterAuthType) =>
  async ({ userId }: RevokeSessionsOptions) => {
    const ctx = await betterAuth.$context
    await ctx.internalAdapter.deleteSessions(userId)
  }
