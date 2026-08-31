import { AdminResetPasswordForm } from '@/lib/auth/components/AdminResetPasswordForm'
import { MinimalTemplate } from '@payloadcms/next/templates'
import { redirect } from 'next/navigation'
import { AdminViewServerProps } from 'payload'

type Props = AdminViewServerProps

export function AdminResetPasswordView({ searchParams, payload }: Props) {
  const { token } = searchParams ?? {}
  if (!token || typeof token !== 'string') {
    redirect(payload.config.routes.admin)
  }
  return (
    <MinimalTemplate>
      <AdminResetPasswordForm token={token} />
    </MinimalTemplate>
  )
}
