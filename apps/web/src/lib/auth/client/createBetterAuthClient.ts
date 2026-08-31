import { BetterAuthType } from '@/lib/auth'
import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

export const createBetterAuthClient = () =>
  createAuthClient({
    plugins: [inferAdditionalFields<BetterAuthType>(), adminClient()],
  })

export type BetterAuthClientType = ReturnType<typeof createBetterAuthClient>
