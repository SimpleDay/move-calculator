import { withTransaction } from '@/lib/tx'
import { BasePayload } from 'payload'

export function createTransactionalFindGlobal(payload: BasePayload): BasePayload['findGlobal'] {
  return (options) => {
    const req = withTransaction(options.req)
    const optionsWithTransactionId = {
      ...options,
      req,
    }
    return payload.findGlobal(optionsWithTransactionId)
  }
}
