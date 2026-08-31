import { router } from '@/features/api/server/router'
import { getApp } from '@/getApp'
import { onError, ORPCError } from '@orpc/server'
import { RPCHandler } from '@orpc/server/fetch'
import { NextRequest } from 'next/server'

async function logError(error: unknown, request: { url: string | URL; method: string }): Promise<void> {
  const { payload } = await getApp()
  const log = { err: error, request: { url: request.url.toString(), method: request.method } }
  // Expected client errors (401, 403, validation, …) must not end up in Sentry.
  if (error instanceof ORPCError && error.status < 500) {
    payload.logger.debug(log, '[oRPC] request rejected')
  } else {
    payload.logger.error(log, '[oRPC] request failed')
  }
}

const handler = new RPCHandler(router, {
  interceptors: [
    onError(async (error, { request }) => {
      await logError(error, request)
    }),
  ],
})

async function handleRequest(request: NextRequest) {
  try {
    const { response } = await handler.handle(request, {
      prefix: '/api/v1',
      context: { request },
    })

    return response ?? new Response('Not found', { status: 404 })
  } catch (error) {
    await logError(error, request)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const HEAD = handleRequest
export const GET = handleRequest
export const POST = handleRequest
export const PUT = handleRequest
export const PATCH = handleRequest
export const DELETE = handleRequest
