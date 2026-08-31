'use server'

import { di } from '@/di'
import { routing } from '@/i18n/routing'
import { HttpError, ServerActionBuilder } from '@/lib/next'
import { headers } from 'next/headers'
import { z } from 'zod'

const schema = z.object({
  locale: z.enum(routing.locales),
})

export const updateLocaleAction = ServerActionBuilder.create(schema).handle(async ({ data, context: { inject } }) => {
  const authService = inject(di.authService)
  const reqHeaders = await headers()
  const user = await authService.getUserFromSession(reqHeaders)
  if (!user) {
    throw new HttpError({
      status: 401,
      title: 'Unauthorized',
    })
  }
  const localApi = inject(di.localApi)
  await localApi.update({
    collection: 'users',
    data,
    id: user.id,
  })
})
