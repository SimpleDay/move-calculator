'use client'

import { useAdminTranslation } from '@/i18n/useAdminTranslation'
import { initialSignupAction } from '@/lib/auth/actions/initialSignupAction'
import { AdminField } from '@/lib/auth/components/AdminField'
import { AdminForm } from '@/lib/auth/components/AdminForm'
import { AdminFormFields } from '@/lib/auth/components/AdminFormFields'
import { AdminFormFooter } from '@/lib/auth/components/AdminFormFooter'
import { AdminFormHeader } from '@/lib/auth/components/AdminFormHeader'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, toast } from '@payloadcms/ui'
import { Locale } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const useSignupForm = () => {
  const { t } = useAdminTranslation()
  const schema = z
    .object({
      email: z.email(t('authentication:emailNotValid')),
      password: z.string().min(8, t('custom:password:tooShort')),
      confirmPassword: z.string(),
      name: z.string().min(1, t('validation:required')),
    })
    .refine(({ password, confirmPassword }) => password === confirmPassword, {
      message: t('authentication:confirmPassword'),
      path: ['confirmPassword'],
    })
  return useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: undefined,
    },
  })
}

type SignupFormResult = { email: string; password: string; name: string; confirmPassword: string }

type Props = {
  locale: Locale
}

export function AdminSignupForm({ locale }: Props) {
  const { t } = useAdminTranslation()
  const [showEmailValidationMessage, setShowEmailValidationMessage] = useState(false)
  const form = useSignupForm()
  const { register } = form
  const signup = async (data: SignupFormResult) => {
    const result = await initialSignupAction({ ...data, locale })
    if (result.error) {
      toast.error(t('error:unknown'))
    } else {
      setShowEmailValidationMessage(true)
    }
  }
  if (showEmailValidationMessage) {
    return (
      <AdminFormHeader>
        <h1>{t('authentication:emailSent')}</h1>
        <p>{t('custom:signUp:checkEmail')}</p>
      </AdminFormHeader>
    )
  }
  return (
    <AdminForm {...form} onSubmit={signup}>
      <AdminFormHeader>
        <div>
          <h1>{t('general:welcome')}</h1>
          <p>{t('authentication:beginCreateFirstUser')}</p>
        </div>
      </AdminFormHeader>
      <AdminFormFields>
        <AdminField name="email" type="email" label={t('general:email')} required>
          <input type="email" autoComplete="off" {...register('email')} />
        </AdminField>
        <AdminField name="name" type="password" label={t('custom:fields:name')} required>
          <input type="text" autoComplete="off" {...register('name')} />
        </AdminField>
        <AdminField name="password" type="password" label={t('general:password')} required>
          <input type="password" autoComplete="off" {...register('password')} />
        </AdminField>
        <AdminField name="confirmPassword" type="password" label={t('authentication:confirmPassword')} required>
          <input type="password" autoComplete="off" {...register('confirmPassword')} />
        </AdminField>
      </AdminFormFields>
      <AdminFormFooter>
        <Button type="submit">{t('general:create')}</Button>
      </AdminFormFooter>
    </AdminForm>
  )
}
