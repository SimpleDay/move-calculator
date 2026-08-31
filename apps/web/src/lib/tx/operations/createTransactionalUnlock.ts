import { withTransaction } from '@/lib/tx'
import { BasePayload } from 'payload'

export function createTransactionalUnlock(payload: BasePayload): BasePayload['unlock'] {
  return (options) => {
    const req = withTransaction(options.req)
    const optionsWithTransactionId = {
      ...options,
      req,
    }
    return payload.unlock(optionsWithTransactionId)
  }
}
