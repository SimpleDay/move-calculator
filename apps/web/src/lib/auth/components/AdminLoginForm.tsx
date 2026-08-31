'use client'

import { useAdminTranslation } from '@/i18n/useAdminTranslation'
import { useBetterAuthClient } from '@/lib/auth/client'
import { mapErrorCodeToAdminTranslationKey } from '@/lib/auth/client/mapErrorCodeToAdminTranslationKey'
import { AdminField } from '@/lib/auth/components/AdminField'
import { AdminForm } from '@/lib/auth/components/AdminForm'
import { AdminFormFooter } from '@/lib/auth/components/AdminFormFooter'
import { AdminFormHeader } from '@/lib/auth/components/AdminFormHeader'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, toast, useConfig, useTranslation } from '@payloadcms/ui'
import Link from 'next/link'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const useLoginForm = () => {
  const { t } = useTranslation()
  const schema = z.object({
    email: z.email(t('authentication:emailNotValid')),
    password: z.string().min(1, t('validation:required')),
  })
  return useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: undefined,
    },
  })
}

type LoginFormResult = { email: string; password: string }

export function AdminLoginForm() {
  const { t } = useAdminTranslation()
  const { config } = useConfig()
  const form = useLoginForm()
  const { register } = form
  const authClient = useBetterAuthClient()
  const login = useCallback(
    async ({ email, password }: LoginFormResult) => {
      try {
        const { error } = await authClient.signIn.email({ email, password })
        if (error) {
          const errorCode = error?.code ?? 'UNKNOWN'
          toast.error(t(mapErrorCodeToAdminTranslationKey(errorCode)))
        } else {
          window.location.href = config.routes.admin
        }
      } catch (_) {
        toast.error(t('error:unknown'))
      }
    },
    [authClient, config, t],
  )
  const forgotPasswordHref = `${config.routes.admin}${config.admin.routes.forgot}`
  return (
    <AdminForm {...form} onSubmit={login}>
      <AdminFormHeader>
        <h1>{t('authentication:login')}</h1>
      </AdminFormHeader>
      <div className="login__form__inputWrap">
        <AdminField name="email" type="email" label={t('general:email')} required>
          <input type="email" autoComplete="off" {...register('email')} />
        </AdminField>
        <AdminField name="password" type="password" label={t('general:password')} required>
          <input type="password" autoComplete="off" {...register('password')} />
        </AdminField>
      </div>
      <AdminFormFooter>
        <Button type="submit">{t('authentication:login')}</Button>
        <Link href={forgotPasswordHref} prefetch={false}>
          {t('authentication:forgotPasswordQuestion')}
        </Link>
      </AdminFormFooter>
    </AdminForm>
  )
}
