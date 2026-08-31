'use client'

import { useAdminTranslation } from '@/i18n/useAdminTranslation'
import { acceptInvitationAction } from '@/lib/auth/actions/acceptInvitationAction'
import { mapErrorCodeToAdminTranslationKey } from '@/lib/auth/client/mapErrorCodeToAdminTranslationKey'
import { AdminField } from '@/lib/auth/components/AdminField'
import { AdminForm } from '@/lib/auth/components/AdminForm'
import { AdminFormFields } from '@/lib/auth/components/AdminFormFields'
import { AdminFormFooter } from '@/lib/auth/components/AdminFormFooter'
import { AdminFormHeader } from '@/lib/auth/components/AdminFormHeader'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, toast, useConfig } from '@payloadcms/ui'
import { Locale } from 'next-intl'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

type Props = {
  name: string
  email: string
  token: string
  locale: Locale
}

const useInvitationForm = ({ name, email }: { name: string; email: string }) => {
  const { t } = useAdminTranslation()
  const schema = z
    .object({
      email: z.email(t('authentication:emailNotValid')),
      name: z.string().min(1, t('validation:required')),
      password: z.string().min(8, t('custom:password:tooShort')),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('fields:passwordsDoNotMatch'),
      path: ['confirmPassword'],
    })
  return useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: email,
      name: name,
      password: '',
      confirmPassword: '',
    },
  })
}

type InvitationFormResult = { email: string; name: string; password: string; confirmPassword: string }

export function AdminInvitationForm({ name, email, token, locale }: Props) {
  const { t } = useAdminTranslation()
  const { config } = useConfig()

  const form = useInvitationForm({ name, email })
  const { register } = form
  const acceptInvitation = useCallback(
    async (data: InvitationFormResult) => {
      const { error } = await acceptInvitationAction({ ...data, token, locale })
      if (error) {
        toast.error(t(mapErrorCodeToAdminTranslationKey(error?.code ?? 'unknown')))
      } else {
        window.location.href = config.routes.admin
      }
    },
    [config, token, t, locale],
  )
  return (
    <AdminForm {...form} onSubmit={acceptInvitation}>
      <AdminFormHeader>
        <h1>{t('custom:invitations:title')}</h1>
      </AdminFormHeader>
      <AdminFormFields>
        <AdminField name="email" label={t('general:email')} type="email" required readOnly>
          <input type="email" autoComplete="off" {...register('email')} disabled />
        </AdminField>
        <AdminField name="name" label={t('authentication:username')} type="text" required>
          <input type="name" autoComplete="off" {...register('name')} />
        </AdminField>
        <AdminField name="password" label={t('general:password')} type="password" required>
          <input type="password" autoComplete="off" {...register('password')} />
        </AdminField>
        <AdminField name="confirmPassword" label={t('authentication:confirmPassword')} type="password" required>
          <input type="password" autoComplete="off" {...register('confirmPassword')} />
        </AdminField>
      </AdminFormFields>
      <AdminFormFooter>
        <Button type="submit">{t('general:create')}</Button>
      </AdminFormFooter>
    </AdminForm>
  )
}
