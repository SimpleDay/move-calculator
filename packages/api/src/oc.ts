import { oc as baseOc } from '@orpc/contract'
import type { AccessLevel } from './access'

export type ContractMeta = {
  // Defaults to 'authorized' when omitted — see accessMiddleware in apps/web.
  access?: AccessLevel
}

export const oc = baseOc.$meta<ContractMeta>({})
