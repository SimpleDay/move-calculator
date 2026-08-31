'use server'

import { di } from '@/di'
import { routing } from '@/i18n/routing'
import { HttpError, ServerActionBuilder } from '@/lib/next'
import { z } from 'zod'

const initialSignupActionSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string().min(1),
  locale: z.enum(routing.locales),
})

export const initialSignupAction = ServerActionBuilder.create(initialSignupActionSchema).handle(
  async ({ data, context: { inject } }) => {
    const authService = inject(di.authService)
    const hasUsers = await authService.hasUsers()
    if (hasUsers) {
      throw new HttpError()
    }
    await authService.signUpUser({ ...data, role: 'platformAdmin' })
  },
)
