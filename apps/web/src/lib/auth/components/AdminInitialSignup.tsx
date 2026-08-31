import { redirectGivenAdminExists } from '@/lib/auth/business/redirectGivenAdminExists'
import { AdminSignupForm } from '@/lib/auth/components/AdminSignupForm'
import { MinimalTemplate } from '@payloadcms/next/templates'
import { Locale } from 'next-intl'
import { AdminViewServerProps } from 'payload'

type Props = AdminViewServerProps

export async function AdminInitialSignup(props: Props) {
  await redirectGivenAdminExists(props.payload)
  const locale = props.i18n.language as Locale
  return (
    <MinimalTemplate>
      <AdminSignupForm locale={locale} />
    </MinimalTemplate>
  )
}
