import { Container } from 'inversify'

declare global {
  // use var, otherwise the type will be not visible on globalThis
  var __container: Container | undefined
  var __containerInit: Promise<Container> | undefined

  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface ProcessEnv {
      PAYLOAD_SECRET: string
      DATABASE_URL: string
      AI_GATEWAY_API_KEY?: string
      AI_INVENTORY_MODEL_ID?: string
      VERCEL_OIDC_TOKEN?: string
      GOOGLE_MAPS_SERVER_API_KEY?: string
      NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY?: string
      POC_DEMO_MODE?: string
      NEXT_PUBLIC_SENTRY_DSN?: string
      SMTP_HOST?: string
      SMTP_PORT?: string
      SMTP_USERNAME?: string
      SMTP_PASSWORD?: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
