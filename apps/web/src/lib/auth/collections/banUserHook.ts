import { di } from '@/di'
import { getApp } from '@/getApp'
import { User } from '@/payload-types'
import { CollectionBeforeChangeHook } from 'payload'

export const banUserHook: CollectionBeforeChangeHook<User> = async ({ data, originalDoc, req: { transactionID } }) => {
  const { inject, runInTransaction } = await getApp()
  if (!originalDoc || data.banned === originalDoc.banned) return
  await runInTransaction(
    async () => {
      const authService = inject(di.authService)
      const emailService = inject(di.emailService)
      if (data.banned) {
        await authService.revokeSessions({ userId: originalDoc.id })
        await emailService.sendUserBannedEmail({
          recipient: {
            name: data.name ?? originalDoc.name,
            email: data.email ?? originalDoc.email,
          },
          locale: data.locale ?? originalDoc.locale,
        })
      }
    },
    { transactionId: await transactionID },
  )
}
