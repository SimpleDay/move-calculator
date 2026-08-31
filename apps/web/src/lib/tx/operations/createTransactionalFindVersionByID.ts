import { withTransaction } from '@/lib/tx'
import { BasePayload } from 'payload'

export function createTransactionalFindVersionByID(payload: BasePayload): BasePayload['findVersionByID'] {
  return (options) => {
    const req = withTransaction(options.req)
    const optionsWithTransactionId = {
      ...options,
      req,
    }
    return payload.findVersionByID(optionsWithTransactionId)
  }
}
