import { BetterAuthType, isAdminRole, Role, SignUpUserOptions } from '@/lib/auth'
import { BasePayload } from 'payload'

export const signUpUser = (betterAuth: BetterAuthType, payload: BasePayload) => async (opts: SignUpUserOptions) => {
  await betterAuth.api.createUser({
    body: opts,
  })
  const callbackUrl = getCallbackUrl(opts.role, payload)
  await betterAuth.api.sendVerificationEmail({
    body: {
      email: opts.email,
      callbackURL: callbackUrl,
    },
  })
}

function getCallbackUrl(role: Role, payload: BasePayload): string {
  const isAdmin = isAdminRole(role)
  if (!isAdmin) {
    throw new Error('not implemented yet.')
  }
  return payload.config.routes.admin
}
