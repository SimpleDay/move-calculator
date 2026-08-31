import { getApp } from '@/getApp'
import { os } from '@orpc/server'
import { ORPCContext } from '../server/orpc'

export const transactionalMiddleware = os.$context<ORPCContext>().middleware(async ({ context, next }) => {
  const { runInTransaction } = context.app ?? (await getApp())
  return runInTransaction(async () => {
    return await next()
  })
})
