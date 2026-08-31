import { di } from '@/di'
import { getApp } from '@/getApp'
import { ORPCError, os } from '@orpc/server'
import { ContractMeta, hasAccess } from '@zuegelofferte/api'
import { ORPCContext } from '../server/orpc'

export const accessMiddleware = os
  .$meta<ContractMeta>({})
  .$context<ORPCContext>()
  .middleware(async ({ context, procedure, next }) => {
    const app = context.app ?? (await getApp())
    const authService = app.inject(di.authService)
    const user = await authService.getUserFromSession(context.request?.headers ?? new Headers())

    if (!hasAccess(user, procedure['~orpc'].meta.access)) {
      throw new ORPCError(user ? 'FORBIDDEN' : 'UNAUTHORIZED')
    }

    return next({
      context: {
        // Only nullish for procedures with `access: 'anonymous'` — for every
        // other level hasAccess has already rejected the request.
        user: user!,
      },
    })
  })
