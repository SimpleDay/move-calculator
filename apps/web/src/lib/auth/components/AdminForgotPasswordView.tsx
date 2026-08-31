import { constants } from '@/constants'
import { AdminForgotPasswordForm } from '@/lib/auth/components/AdminForgotPasswordForm'
import { MinimalTemplate } from '@payloadcms/next/templates'
import { AdminViewServerProps } from 'payload'

type Props = AdminViewServerProps

export async function AdminForgotPasswordView({ payload }: Props) {
  const redirectUrl = `${payload.config.routes.admin}${constants.auth.adminRoutes.resetPassword}`
  return (
    <MinimalTemplate>
      <AdminForgotPasswordForm redirectUrl={redirectUrl} />
    </MinimalTemplate>
  )
}
