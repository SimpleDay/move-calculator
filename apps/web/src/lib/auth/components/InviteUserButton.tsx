import { getAdminTranslation } from '@/i18n/adminTranslations'
import { Button } from '@payloadcms/ui'
import { BeforeListServerProps } from 'payload'

export function InviteUserButton({ payload, i18n }: BeforeListServerProps) {
  const link = `${payload.config.routes.admin}/collections/${payload.collections['user-invitations'].config.slug}/create`
  const { t } = getAdminTranslation(i18n)
  return (
    <Button size="small" buttonStyle="pill" el="link" to={link}>
      {t('custom:invitations:create')}
    </Button>
  )
}
