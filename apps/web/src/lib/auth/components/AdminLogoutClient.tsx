'use client'

import { useConfig } from '@payloadcms/ui'
import { useEffect } from 'react'
import { useBetterAuthClient } from '../client'

export const AdminLogoutClient = () => {
  const authClient = useBetterAuthClient()
  const { config } = useConfig()

  useEffect(() => {
    authClient.signOut().then(() => {
      window.location.href = config.routes.admin
    })
  }, [authClient, config])

  return null
}
