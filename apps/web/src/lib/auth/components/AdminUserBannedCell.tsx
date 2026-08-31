import { getAdminTranslation } from '@/i18n/adminTranslations'
import { clsx } from 'clsx'
import { ClientField, DefaultServerCellComponentProps } from 'payload'

import styles from './AdminUserBannedCell.module.css'

type Props = DefaultServerCellComponentProps<ClientField, boolean | undefined>

export function AdminUserBannedCell({ cellData, i18n }: Props) {
  const { t } = getAdminTranslation(i18n)
  return (
    <div className={styles.cell}>
      <div
        className={clsx(styles.indicator, {
          [styles.indicatorActive]: !cellData,
          [styles.indicatorInactive]: cellData,
        })}
      />
      <span>{t(`custom:banned:${cellData ? 'inactive' : 'active'}`)}</span>
    </div>
  )
}
