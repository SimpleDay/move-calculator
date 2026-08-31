import { AdminChangeEmailForm } from '@/lib/auth/components/AdminChangeEmailForm'
import { MinimalTemplate } from '@payloadcms/next/templates'

export async function AdminChangeEmailView() {
  return (
    <MinimalTemplate>
      <AdminChangeEmailForm />
    </MinimalTemplate>
  )
}
