import { redirectInitialSignup } from '@/lib/auth/business/redirectInitialSignup'
import { AdminLoginForm } from '@/lib/auth/components/AdminLoginForm'
import { MinimalTemplate } from '@payloadcms/next/templates'
import { AdminViewServerProps } from 'payload'

type Props = AdminViewServerProps

export async function AdminLogin(props: Props) {
  await redirectInitialSignup(props.payload)
  return (
    <MinimalTemplate>
      <AdminLoginForm />
    </MinimalTemplate>
  )
}
