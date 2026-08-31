import { redirect } from 'next/navigation'
import { Payload } from 'payload'

export async function redirectGivenAdminExists(payload: Payload) {
  const { totalDocs } = await payload.count({
    collection: 'users',
  })
  if (totalDocs > 0) {
    redirect(`${payload.config.routes.admin}${payload.config.admin.routes.login}`)
  }
}
