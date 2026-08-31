import { hasAdminRole } from '@/lib/auth'
import { MinimalTemplate } from '@payloadcms/next/templates'
import { redirect } from 'next/navigation'
import { AdminViewServerProps } from 'payload'
import { AdminChangePasswordForm } from './AdminChangePasswordForm'

type Props = AdminViewServerProps

export async function AdminChangePasswordView({ initPageResult, payload }: Props) {
  const {
    req: { user },
  } = initPageResult
  if (!hasAdminRole(user)) redirect(payload.config.routes.admin)
  return (
    <MinimalTemplate>
      <AdminChangePasswordForm />
    </MinimalTemplate>
  )
}
