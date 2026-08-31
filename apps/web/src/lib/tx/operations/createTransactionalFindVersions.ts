import { withTransaction } from '@/lib/tx'
import { BasePayload } from 'payload'

export function createTransactionalFindVersions(payload: BasePayload): BasePayload['findVersions'] {
  return (options) => {
    const req = withTransaction(options.req)
    const optionsWithTransactionId = {
      ...options,
      req,
    }
    return payload.findVersions(optionsWithTransactionId)
  }
}
