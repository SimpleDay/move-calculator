import { App, getApp } from '@/getApp'
import { os } from '@orpc/server'

export const payloadMiddleware = os.$context<{ app?: App }>().middleware(async ({ context, next }) => {
  // `context.app` is the seam for tests to inject a pre-built app.
  const app = context.app ?? (await getApp())
  return next({
    context: {
      app,
    },
  })
})
