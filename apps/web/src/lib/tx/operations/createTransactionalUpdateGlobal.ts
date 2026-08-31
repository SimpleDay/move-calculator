import { withTransaction } from '@/lib/tx'
import { BasePayload } from 'payload'

export function createTransactionalUpdateGlobal(payload: BasePayload): BasePayload['updateGlobal'] {
  return (options) => {
    const req = withTransaction(options.req)
    const optionsWithTransactionId = {
      ...options,
      req,
    }
    return payload.updateGlobal(optionsWithTransactionId)
  }
}
