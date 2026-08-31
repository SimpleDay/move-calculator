import { constants } from '@/constants'
import { getAdminTranslation } from '@/i18n/adminTranslations'
import { Button } from '@payloadcms/ui'
import { Data, UIFieldServerProps } from 'payload'

type Props = UIFieldServerProps

export async function AdminUserActions({ data, user, payload, i18n }: Props) {
  if (!isSelf(data, user)) return null
  const { t } = getAdminTranslation(i18n)
  const changeEmailHref = `${payload.config.routes.admin}${constants.auth.adminRoutes.changeEmail}`
  const changePasswordHref = `${payload.config.routes.admin}${constants.auth.adminRoutes.changePassword}`
  return (
    <div className="doc-controls__content">
      <div className="doc-controls__meta">
        <Button buttonStyle="secondary" el="link" to={changeEmailHref}>
          {t('custom:changeEmail:title')}
        </Button>
        <Button buttonStyle="secondary" el="link" to={changePasswordHref}>
          {t('authentication:changePassword')}
        </Button>
      </div>
    </div>
  )
}

function isSelf(data: Data | undefined | null, user: Data | undefined | null): boolean {
  return user && data && data.id && user.id && data.id === user.id
}
