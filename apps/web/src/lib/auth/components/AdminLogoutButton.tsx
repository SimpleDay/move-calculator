'use client'

import { useBetterAuthClient } from '@/lib/auth/client'
import { LogOutIcon, useConfig, useTranslation } from '@payloadcms/ui'

const baseClass = 'nav'

export function AdminLogoutButton() {
  const { config } = useConfig()
  const { t } = useTranslation()
  const auth = useBetterAuthClient()
  const logout = () => {
    auth.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = config.routes.admin
        },
      },
    })
  }
  return (
    <button
      onClick={logout}
      aria-label={t('authentication:logOut')}
      className={`${baseClass}__log-out`}
      tabIndex={0}
      title={t('authentication:logOut')}
    >
      <LogOutIcon />
    </button>
  )
}
