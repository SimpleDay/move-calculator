'use client'

import { useAdminTranslation } from '@/i18n/useAdminTranslation'
import { useBetterAuthClient } from '@/lib/auth/client'
import { mapErrorCodeToAdminTranslationKey } from '@/lib/auth/client/mapErrorCodeToAdminTranslationKey'
import { AdminField } from '@/lib/auth/components/AdminField'
import { AdminForm } from '@/lib/auth/components/AdminForm'
import { AdminFormFields } from '@/lib/auth/components/AdminFormFields'
import { AdminFormFooter } from '@/lib/auth/components/AdminFormFooter'
import { AdminFormHeader } from '@/lib/auth/components/AdminFormHeader'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, toast, useConfig } from '@payloadcms/ui'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const useChangePasswordForm = () => {
  const { t } = useAdminTranslation()
  const schema = z
    .object({
      currentPassword: z.string(),
      newPassword: z.string().min(8, t('custom:password:tooShort')),
      confirmNewPassword: z.string(),
    })
    .refine(({ newPassword, confirmNewPassword }) => newPassword === confirmNewPassword, {
      message: t('authentication:confirmPassword'),
      path: ['confirmNewPassword'],
    })
  return useForm({
    resolver: zodResolver(schema),
  })
}

type ChangePasswordFormResult = {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

export function AdminChangePasswordForm() {
  const [completed, setCompleted] = useState(false)
  const { config } = useConfig()
  const { t } = useAdminTranslation()
  const client = useBetterAuthClient()
  const form = useChangePasswordForm()
  const accountHref = `${config.routes.admin}${config.admin.routes.account}`
  const { register } = form
  const changePassword = useCallback(
    async ({ currentPassword, newPassword }: ChangePasswordFormResult) => {
      const { error } = await client.changePassword({ currentPassword, newPassword })
      if (error) {
        toast.error(t(mapErrorCodeToAdminTranslationKey(error.code ?? 'unknown')))
      } else {
        setCompleted(true)
      }
    },
    [setCompleted, client, t],
  )
  if (completed) {
    return (
      <AdminFormHeader>
        <h1>{t('custom:changePassword:successfully')}</h1>
        <Link href={accountHref} prefetch={false}>
          {t('custom:changePassword:backToAccount')}
        </Link>
      </AdminFormHeader>
    )
  }
  return (
    <AdminForm {...form} onSubmit={changePassword}>
      <AdminFormHeader>
        <h1>{t('authentication:changePassword')}</h1>
      </AdminFormHeader>
      <AdminFormFields>
        <AdminField
          name="currentPassword"
          label={t('custom:changePassword:currentPasswordLabel')}
          type="password"
          required={true}
        >
          <input type="password" {...register('currentPassword')} />
        </AdminField>
        <AdminField name="newPassword" label={t('authentication:newPassword')} type="password" required={true}>
          <input type="password" {...register('newPassword')} />
        </AdminField>
        <AdminField
          name="confirmNewPassword"
          label={t('authentication:confirmPassword')}
          type="password"
          required={true}
        >
          <input type="password" {...register('confirmNewPassword')} />
        </AdminField>
      </AdminFormFields>
      <AdminFormFooter>
        <Button type="submit">{t('authentication:changePassword')}</Button>
        <Link href={accountHref} prefetch={false}>
          {t('custom:changePassword:backToAccount')}
        </Link>
      </AdminFormFooter>
    </AdminForm>
  )
}
