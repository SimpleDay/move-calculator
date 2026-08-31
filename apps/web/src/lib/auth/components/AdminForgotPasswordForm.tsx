'use client'

import { useBetterAuthClient } from '@/lib/auth/client'
import { AdminField } from '@/lib/auth/components/AdminField'
import { AdminForm } from '@/lib/auth/components/AdminForm'
import { AdminFormFields } from '@/lib/auth/components/AdminFormFields'
import { AdminFormFooter } from '@/lib/auth/components/AdminFormFooter'
import { AdminFormHeader } from '@/lib/auth/components/AdminFormHeader'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, useConfig, useTranslation } from '@payloadcms/ui'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

type Props = {
  redirectUrl: string
}

const useForgotPasswordForm = () => {
  const { t } = useTranslation()
  const schema = z.object({
    email: z.email(t('authentication:emailNotValid')),
  })
  return useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: undefined,
    },
  })
}

export function AdminForgotPasswordForm({ redirectUrl }: Props) {
  const { t } = useTranslation()
  const { config } = useConfig()
  const [completed, setCompleted] = useState(false)
  const form = useForgotPasswordForm()
  const { register } = form
  const authClient = useBetterAuthClient()
  const sendForgotPasswordEmail = useCallback(
    async ({ email }: { email: string }) => {
      await authClient.requestPasswordReset({
        email,
        redirectTo: redirectUrl,
      })
      setCompleted(true)
    },
    [authClient, redirectUrl],
  )
  const loginHref = `${config.routes.admin}${config.admin.routes.login}`
  if (completed) {
    return (
      <AdminFormHeader>
        <h1>{t('authentication:emailSent')}</h1>
        <p>{t('authentication:checkYourEmailForPasswordReset')}</p>
        <Link href={loginHref} prefetch={false}>
          {t('authentication:backToLogin')}
        </Link>
      </AdminFormHeader>
    )
  }
  return (
    <AdminForm {...form} onSubmit={sendForgotPasswordEmail}>
      <AdminFormHeader>
        <h1>{t('authentication:forgotPassword')}</h1>
        <p>{t('authentication:forgotPasswordEmailInstructions')}</p>
      </AdminFormHeader>
      <AdminFormFields>
        <AdminField name="email" type="email" label={t('general:email')} required>
          <input type="email" autoComplete="off" {...register('email')} />
        </AdminField>
      </AdminFormFields>
      <AdminFormFooter>
        <Button type="submit">{t('authentication:forgotPassword')}</Button>
        <Link href={loginHref} prefetch={false}>
          {t('authentication:backToLogin')}
        </Link>
      </AdminFormFooter>
    </AdminForm>
  )
}
