import { withTransaction } from '@/lib/tx'
import { BasePayload } from 'payload'

export function createTransactionalCountGlobalVersions(payload: BasePayload): BasePayload['countGlobalVersions'] {
  return (options) => {
    const req = withTransaction(options.req)
    const optionsWithTransactionId = {
      ...options,
      req,
    }
    return payload.countGlobalVersions(optionsWithTransactionId)
  }
}
