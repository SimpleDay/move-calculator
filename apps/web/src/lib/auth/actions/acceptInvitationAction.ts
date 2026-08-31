'use server'

import { di } from '@/di'
import { routing } from '@/i18n/routing'
import { HttpError } from '@/lib/next'
import { ServerActionBuilder } from '@/lib/next/serverActionBuilder'
import { z } from 'zod'

const schema = z.object({
  token: z.string(),
  name: z.string(),
  password: z.string(),
  locale: z.enum(routing.locales),
})

export const acceptInvitationAction = ServerActionBuilder.create(schema).handle(
  async ({ data, context: { inject } }) => {
    const { token, name, password, locale } = data
    const authService = inject(di.authService)
    const invitation = await authService.getValidInvitation(token)
    if (!invitation) {
      throw new HttpError({
        status: 409,
        title: 'Conflict',
        code: 'noValidInvitation',
      })
    }
    await authService.acceptInvitation({ invitation, name, password, locale })
  },
)
