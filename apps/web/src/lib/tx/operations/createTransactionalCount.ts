import { withTransaction } from '@/lib/tx'
import { BasePayload } from 'payload'

export function createTransactionalCount(payload: BasePayload): BasePayload['count'] {
  return (options) => {
    const req = withTransaction(options.req)
    const optionsWithTransactionId = {
      ...options,
      req,
    }
    return payload.count(optionsWithTransactionId)
  }
}
