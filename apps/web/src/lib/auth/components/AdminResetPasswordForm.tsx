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

const useResetPasswordForm = () => {
  const { t } = useTranslation()
  const schema = z
    .object({
      password: z.string().min(8, 'password too short'),
      confirmPassword: z.string().min(8, 'password too short'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('fields:passwordsDoNotMatch'),
      path: ['confirmPassword'],
    })
  return useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })
}

type Props = {
  token: string
}

export function AdminResetPasswordForm({ token }: Props) {
  const { t } = useTranslation()
  const { config } = useConfig()
  const [completed, setCompleted] = useState(false)
  const form = useResetPasswordForm()
  const { register } = form
  const authClient = useBetterAuthClient()
  const resetPassword = useCallback(
    async ({ password }: { password: string }) => {
      await authClient.resetPassword({ newPassword: password, token })
      setCompleted(true)
    },
    [authClient, setCompleted, token],
  )
  const loginHref = `${config.routes.admin}${config.admin.routes.login}`
  if (completed) {
    return (
      <AdminFormHeader>
        <h1>{t('authentication:passwordResetSuccessfully')}</h1>
        <Link href={loginHref} prefetch={false}>
          {t('authentication:backToLogin')}
        </Link>
      </AdminFormHeader>
    )
  }
  return (
    <AdminForm {...form} onSubmit={resetPassword}>
      <AdminFormHeader>
        <h1>{t('authentication:resetPassword')}</h1>
      </AdminFormHeader>
      <AdminFormFields>
        <AdminField name="password" type="password" label={t('authentication:newPassword')} required>
          <input type="password" autoComplete="off" {...register('password')} />
        </AdminField>
        <AdminField name="confirmPassword" type="password" label={t('authentication:confirmPassword')} required>
          <input type="password" autoComplete="off" {...register('confirmPassword')} />
        </AdminField>
      </AdminFormFields>
      <AdminFormFooter>
        <Button type="submit">{t('authentication:resetPassword')}</Button>
      </AdminFormFooter>
    </AdminForm>
  )
}
