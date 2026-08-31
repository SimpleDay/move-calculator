import { withTransaction } from '@/lib/tx'
import { BasePayload } from 'payload'

export function createTransactionalCreate(payload: BasePayload): BasePayload['create'] {
  return (options) => {
    const req = withTransaction(options.req)
    const optionsWithTransactionId = {
      ...options,
      req,
    }
    return payload.create(optionsWithTransactionId)
  }
}
