import { withTransaction } from '@/lib/tx'
import { BasePayload } from 'payload'

export function createTransactionalFindGlobalVersions(payload: BasePayload): BasePayload['findGlobalVersions'] {
  return (options) => {
    const req = withTransaction(options.req)
    const optionsWithTransactionId = {
      ...options,
      req,
    }
    return payload.findGlobalVersions(optionsWithTransactionId)
  }
}
