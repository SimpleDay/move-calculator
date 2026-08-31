import { getEmailTranslator } from '@/i18n/emailTranslations'
import Email, { EmailProps } from '@/lib/email/templates/Email'
import EmailWithLink, { EmailWithLinkProps } from '@/lib/email/templates/EmailWithLink'
import { EmailRecipient, EmailService } from '@/lib/email/types'
import { InstrumentationService } from '@/lib/sentry/types'
import { render } from '@react-email/render'
import { ifDefined } from '@zuegelofferte/shared'
import { after } from 'next/server'
import { BasePayload } from 'payload'
import React from 'react'

export function emailService(payload: BasePayload, { runInSpan }: InstrumentationService): EmailService {
  return {
    sendInvitationEmail: async ({ recipient, url, locale }) =>
      after(
        async () =>
          await runInSpan(
            async () => {
              const t = await getEmailTranslator({ locale, namespace: 'SendInvitationEmail' })
              const props: EmailWithLinkProps = {
                href: url,
                name: recipient.name,
                messages: {
                  preview: t('preview'),
                  title: t('title'),
                  description: t('description'),
                  link: t('link'),
                  greeting: t('greeting'),
                  alternative: t('alternative'),
                  addendum: t('addendum'),
                },
              }
              const message = await toNodemailerMessage({
                template: React.createElement(EmailWithLink, props),
                subject: t('subject'),
                to: recipient,
              })
              await payload.sendEmail(message)
            },
            { name: 'EmailService.sendInvitationEmail' },
          ),
      ),
    sendResetPasswordEmail: async ({ recipient, url, locale }) => {
      const t = await getEmailTranslator({ locale, namespace: 'SendResetPasswordEmail' })
      const props: EmailWithLinkProps = {
        href: url,
        name: recipient.name,
        messages: {
          preview: t('preview'),
          title: t('title'),
          description: t('description'),
          link: t('link'),
          greeting: t('greeting'),
          alternative: t('alternative'),
          addendum: t('addendum'),
        },
      }
      const message = await toNodemailerMessage({
        template: React.createElement(EmailWithLink, props),
        subject: t('subject'),
        to: recipient,
      })
      await payload.sendEmail(message)
    },
    sendVerificationEmail: async ({ recipient, url, locale }) => {
      const t = await getEmailTranslator({ locale, namespace: 'SendVerificationEmail' })
      const props: EmailWithLinkProps = {
        href: url,
        name: recipient.name,
        messages: {
          preview: t('preview'),
          title: t('title'),
          description: t('description'),
          link: t('link'),
          greeting: t('greeting'),
          alternative: t('alternative'),
          addendum: t('addendum'),
        },
      }
      const message = await toNodemailerMessage({
        template: React.createElement(EmailWithLink, props),
        subject: t('subject'),
        to: recipient,
      })
      await payload.sendEmail(message)
    },
    sendPasswordChangedEmail: async ({ recipient, locale }) => {
      const t = await getEmailTranslator({ locale, namespace: 'SendPasswordChangedEmail' })
      const props: EmailProps = {
        name: recipient.name,
        messages: {
          preview: t('preview'),
          title: t('title'),
          description: t('description'),
          greeting: t('greeting'),
          addendum: t('addendum'),
        },
      }
      const message = await toNodemailerMessage({
        template: React.createElement(Email, props),
        subject: t('subject'),
        to: recipient,
      })
      await payload.sendEmail(message)
    },

    sendEmailChangeStartedEmail: async ({ recipient, locale }) => {
      const t = await getEmailTranslator({ locale, namespace: 'SendEmailChangeStartedEmail' })
      const props: EmailProps = {
        name: recipient.name,
        messages: {
          preview: t('preview'),
          title: t('title'),
          description: t('description'),
          greeting: t('greeting'),
          addendum: t('addendum'),
        },
      }
      const message = await toNodemailerMessage({
        template: React.createElement(Email, props),
        subject: t('subject'),
        to: recipient,
      })
      await payload.sendEmail(message)
    },

    sendUserBannedEmail: async ({ recipient, locale }) => {
      const t = await getEmailTranslator({ locale, namespace: 'SendUserBannedEmail' })
      const props: EmailProps = {
        name: recipient.name,
        messages: {
          preview: t('preview'),
          title: t('title'),
          description: t('description'),
          greeting: t('greeting'),
          addendum: t('addendum'),
        },
      }
      const message = await toNodemailerMessage({
        template: React.createElement(Email, props),
        subject: t('subject'),
        to: recipient,
      })
      await payload.sendEmail(message)
    },
  }
}

async function toNodemailerMessage({
  template,
  subject,
  to,
  from,
  replyTo,
}: {
  template: React.ReactElement
  subject: string
  to: EmailRecipient
  from?: EmailRecipient
  replyTo?: EmailRecipient
}): Promise<NodemailerMessage> {
  const html = await render(template)
  const plaintext = await render(template, { plainText: true })
  const message = {
    to: toNodemailerAddress(to),
    from: ifDefined(from, toNodemailerAddress),
    replyTo: ifDefined(replyTo, toNodemailerAddress),
    subject,
    html,
    text: plaintext,
  } satisfies NodemailerMessage

  if (!message.from) {
    // For the 'defaultFromAddress' on 'nodemailerAdapter' to take effect, 'from' must not exist on the message object
    delete message.from
  }

  return message
}

function toNodemailerAddress(recipient: EmailRecipient): NodemailerAddress {
  return {
    address: recipient.email,
    name: recipient.name,
  }
}

type NodemailerAddress = string | { name?: string; address: string } | NodemailerAddress[]

type NodemailerMessage = {
  from?: NodemailerAddress
  replyTo?: NodemailerAddress
  to: NodemailerAddress
  subject: string
  html: string
  text?: string
}
