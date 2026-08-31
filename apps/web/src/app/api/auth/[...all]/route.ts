import { di } from '@/di'
import { getApp } from '@/getApp'
import { toNextJsHandler } from 'better-auth/next-js'

const handler = async (request: Request): Promise<Response> => {
  const { runInTransaction, inject } = await getApp()
  const auth = inject(di.betterAuth)
  return runInTransaction(async () => {
    return await auth.handler(request)
  })
}

export const { GET, POST } = toNextJsHandler(handler)
