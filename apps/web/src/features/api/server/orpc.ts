import { App } from '@/getApp'
import { User } from '@/payload-types'
import { implement } from '@orpc/server'
import { contract } from '@zuegelofferte/api'
import { NextRequest } from 'next/server'
import { accessMiddleware } from '../middleware/accessMiddleware'
import { payloadMiddleware } from '../middleware/payloadMiddleware'

export type ORPCContext = {
  app?: App
  user?: User
  request?: NextRequest
}

export const oc = implement(contract).$context<ORPCContext>().use(payloadMiddleware).use(accessMiddleware)
