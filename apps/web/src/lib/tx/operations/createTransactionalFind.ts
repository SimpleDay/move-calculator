import { withTransaction } from '@/lib/tx'
import { BasePayload } from 'payload'

export function createTransactionalFind(payload: BasePayload): BasePayload['find'] {
  return (options) => {
    const req = withTransaction(options.req)
    const optionsWithTransactionId = {
      ...options,
      req,
    }
    return payload.find(optionsWithTransactionId)
  }
}
