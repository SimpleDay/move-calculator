import { constants } from '@/constants'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

function transportOptions() {
  if (process.env.SMTP_USERNAME && process.env.SMTP_PASSWORD) {
    return {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      // connection is upgraded using STARTTLS but requires plain text initially
      // see: https://nodemailer.com/smtp/
      secure: false,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        ciphers: 'SSLv3',
        requireTLS: true,
      },
    }
  }
  return {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    authMethod: 0,
    secure: false,
  }
}

export const emailAdapter = () =>
  process.env.SMTP_HOST
    ? nodemailerAdapter({
        defaultFromAddress: constants.email.defaultFromAddress,
        defaultFromName: constants.email.defaultFromName,
        transportOptions: transportOptions(),
      })
    : undefined
