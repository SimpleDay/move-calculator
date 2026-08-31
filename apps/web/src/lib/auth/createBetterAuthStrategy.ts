import { di } from '@/di'
import { getApp } from '@/getApp'
import { AuthStrategy, TypedUser } from 'payload'

type UserCollection = TypedUser['collection']

const strategyName = 'better-auth'

export function createBetterAuthStrategy(userSlug: UserCollection): AuthStrategy {
  return {
    name: strategyName,
    authenticate: async ({ headers }) => {
      const { inject } = await getApp()
      const authService = inject(di.authService)

      const user = await authService.getUserFromSession(headers)
      if (!user) {
        return { user: null }
      }
      return {
        user: {
          ...user,
          collection: userSlug,
          _strategy: strategyName,
        },
      }
    },
  }
}
