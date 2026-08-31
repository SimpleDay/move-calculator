import { withTransaction } from '@/lib/tx'
import { BasePayload } from 'payload'

export function createTransactionalFindDistinct(payload: BasePayload): BasePayload['findDistinct'] {
  return (options) => {
    const req = withTransaction(options.req)
    const optionsWithTransactionId = {
      ...options,
      req,
    }
    return payload.findDistinct(optionsWithTransactionId)
  }
}
