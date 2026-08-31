'use client'

import { BetterAuthClientType, createBetterAuthClient } from '@/lib/auth/client/createBetterAuthClient'
import React from 'react'

const betterAuthClientContext = React.createContext<BetterAuthClientType>(createBetterAuthClient())

export function useBetterAuthClient() {
  return React.useContext(betterAuthClientContext)
}

export function BetterAuthClientProvider({ children }: React.PropsWithChildren) {
  return (
    <betterAuthClientContext.Provider value={createBetterAuthClient()}>{children}</betterAuthClientContext.Provider>
  )
}
