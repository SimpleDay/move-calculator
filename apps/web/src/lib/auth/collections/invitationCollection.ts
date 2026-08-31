import { constants } from '@/constants'
import { di } from '@/di'
import { getApp } from '@/getApp'
import { collectionGroups, getAdminTranslation } from '@/i18n/adminTranslations'
import { andAccess, isAccessibleRole, isAtLeastRole, noone } from '@/lib/auth'
import { accessibleRoleBaseListFilter } from '@/lib/auth/collections/accessibleRoleBaseListFilter'
import { roleField } from '@/lib/auth/fields/roleField'
import { label } from '@/lib/payload'
import { UserInvitation } from '@/payload-types'
import { addDays } from 'date-fns'
import { Locale } from 'next-intl'
import { CollectionAfterChangeHook, CollectionConfig, EmailFieldValidation } from 'payload'

const sendInvitationEmailHook: CollectionAfterChangeHook<UserInvitation> = async ({
  doc,
  req: { i18n, transactionID },
}) => {
  const { inject, runInTransaction } = await getApp()
  await runInTransaction(
    async () => {
      const authService = inject(di.authService)
      // The `doc` property may not contain all relevant fields due to the users permissions.
      // For this reason, the service fetches the invitation without access control.
      await authService.sendInvitationEmail({ invitationId: doc.id, locale: i18n.fallbackLanguage as Locale })
    },
    { transactionId: await transactionID },
  )
}

const validateNoUserWithEmail: EmailFieldValidation = async (data, { operation, req }) => {
  if (operation !== 'create' || !data) {
    return true
  }
  const { totalDocs } = await req.payload.count({
    collection: 'users',
    where: {
      email: {
        equals: data,
      },
    },
    req,
  })
  if (totalDocs > 0) {
    const { t } = getAdminTranslation(req.i18n)
    return t('error:userEmailAlreadyRegistered')
  }
  return true
}

export const invitationCollection = {
  slug: 'user-invitations',
  labels: {
    singular: label('custom:invitations:singular'),
    plural: label('custom:invitations:plural'),
  },
  access: {
    create: andAccess(isAtLeastRole('admin'), isAccessibleRole),
    update: andAccess(isAtLeastRole('admin'), isAccessibleRole),
    read: andAccess(isAtLeastRole('admin'), isAccessibleRole),
    delete: andAccess(isAtLeastRole('admin'), isAccessibleRole),
  },
  admin: {
    group: collectionGroups.auth,
    useAsTitle: 'email',
    baseListFilter: accessibleRoleBaseListFilter,
    defaultColumns: ['email', 'name', 'role', 'expiresAt'],
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      access: {
        // cannot change email after sending invitation
        update: noone,
      },
      validate: validateNoUserWithEmail,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    roleField,
    {
      name: 'token',
      type: 'text',
      required: true,
      defaultValue: () => crypto.randomUUID(),
      access: {
        // cannot change token after sending invitation
        read: isAtLeastRole('platformAdmin'),
        update: noone,
      },
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
      defaultValue: () => addDays(new Date(), constants.auth.invitations.maxAgeInDays),
    },
  ],
  hooks: {
    afterChange: [sendInvitationEmailHook],
  },
} as const satisfies CollectionConfig
