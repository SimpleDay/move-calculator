import { withTransaction } from '@/lib/tx'
import { BasePayload } from 'payload'

export function createTransactionalFindByID(payload: BasePayload): BasePayload['findByID'] {
  return (options) => {
    const req = withTransaction(options.req)
    const optionsWithTransactionId = {
      ...options,
      req,
    }
    return payload.findByID(optionsWithTransactionId)
  }
}
