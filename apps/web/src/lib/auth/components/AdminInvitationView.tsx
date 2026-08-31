import { di } from '@/di'
import { getApp } from '@/getApp'
import { getAdminTranslation } from '@/i18n/adminTranslations'
import { AdminInvitationForm } from '@/lib/auth/components/AdminInvitationForm'
import { MinimalTemplate } from '@payloadcms/next/templates'
import { Locale } from 'next-intl'
import { AdminViewServerProps } from 'payload'

type Props = AdminViewServerProps

export async function AdminInvitationView({ searchParams, i18n }: Props) {
  const { token } = searchParams ?? {}
  const { t } = getAdminTranslation(i18n)
  if (!token || typeof token !== 'string') {
    return (
      <MinimalTemplate>
        <h1>{t('custom:invitations:invalid')}</h1>
      </MinimalTemplate>
    )
  }
  const app = await getApp()
  const authService = app.inject(di.authService)
  const invitation = await authService.getValidInvitation(token)
  if (!invitation) {
    return (
      <MinimalTemplate>
        <h1>{t('custom:invitations:invalid')}</h1>
      </MinimalTemplate>
    )
  }

  const locale = i18n.language as Locale

  return (
    <MinimalTemplate>
      <AdminInvitationForm name={invitation.name} email={invitation.email} token={token} locale={locale} />
    </MinimalTemplate>
  )
}
