import { withTransaction } from '@/lib/tx'
import { BasePayload } from 'payload'

export function createTransactionalUpdate(payload: BasePayload): BasePayload['update'] {
  return (options) => {
    const req = withTransaction(options.req)
    const optionsWithTransactionId = {
      ...options,
      req,
    }
    return payload.update(optionsWithTransactionId as never)
  }
}
