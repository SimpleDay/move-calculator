import { withTransaction } from '@/lib/tx'
import { BasePayload } from 'payload'

export function createTransactionalDelete(payload: BasePayload): BasePayload['delete'] {
  return ((options) => {
    const req = withTransaction(options.req)
    const optionsWithTransactionId = {
      ...options,
      req,
    }
    return payload.delete(optionsWithTransactionId as never)
  }) as BasePayload['delete']
}
