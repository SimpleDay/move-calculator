'use client'

import { useAdminTranslation } from '@/i18n/useAdminTranslation'
import { useBetterAuthClient } from '@/lib/auth/client'
import { AdminField } from '@/lib/auth/components/AdminField'
import { AdminForm } from '@/lib/auth/components/AdminForm'
import { AdminFormFields } from '@/lib/auth/components/AdminFormFields'
import { AdminFormFooter } from '@/lib/auth/components/AdminFormFooter'
import { AdminFormHeader } from '@/lib/auth/components/AdminFormHeader'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, useConfig } from '@payloadcms/ui'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const useChangeEmailForm = () => {
  const { t } = useAdminTranslation()
  const schema = z.object({
    newEmail: z.email(t('validation:emailAddress')),
  })
  return useForm({
    resolver: zodResolver(schema),
  })
}

type ChangeEmailFormResult = {
  newEmail: string
}

export function AdminChangeEmailForm() {
  const [completed, setCompleted] = useState(false)
  const client = useBetterAuthClient()
  const { config } = useConfig()
  const form = useChangeEmailForm()
  const { register } = form
  const { t } = useAdminTranslation()
  const changeEmail = useCallback(
    async ({ newEmail }: ChangeEmailFormResult) => {
      await client.changeEmail({ newEmail, callbackURL: config.routes.admin })
      setCompleted(true)
    },
    [setCompleted, client, config],
  )
  if (completed) {
    return (
      <AdminFormHeader>
        <h1>{t('authentication:emailSent')}</h1>
      </AdminFormHeader>
    )
  }
  return (
    <AdminForm {...form} onSubmit={changeEmail}>
      <AdminFormHeader>
        <h1>{t('custom:changeEmail:title')}</h1>
      </AdminFormHeader>
      <AdminFormFields>
        <AdminField name="newEmail" label={t('general:email')} type="email" required={true}>
          <input type="email" autoComplete="off" {...register('newEmail')} />
        </AdminField>
      </AdminFormFields>
      <AdminFormFooter>
        <Button type="submit">{t('custom:changeEmail:title')}</Button>
      </AdminFormFooter>
    </AdminForm>
  )
}
