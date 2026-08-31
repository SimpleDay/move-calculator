import { constants } from '@/constants'
import { redirect } from 'next/navigation'
import { Payload } from 'payload'

export async function redirectInitialSignup(payload: Payload) {
  const { totalDocs } = await payload.count({
    collection: 'users',
  })
  if (totalDocs === 0) {
    redirect(`${payload.config.routes.admin}${constants.auth.adminRoutes.initialSignup}`)
  }
}
