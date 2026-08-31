import { BetterAuthType } from '@/lib/auth'
import { TransactionalOperations } from '@/lib/tx'
import { User } from '@/payload-types'

export const getUserFromSession = (betterAuth: BetterAuthType, localApi: TransactionalOperations) => {
  return async (headers: Headers): Promise<User | undefined> => {
    const betterAuthSession = await betterAuth.api.getSession({ headers })
    const userId = betterAuthSession?.session?.userId
    if (!userId) {
      return undefined
    }
    return localApi.findByID({
      collection: 'users',
      id: userId,
    })
  }
}
