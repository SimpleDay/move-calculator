import { withTransaction } from '@/lib/tx'
import { BasePayload } from 'payload'

export function createTransactionalFindGlobalVersionByID(payload: BasePayload): BasePayload['findGlobalVersionByID'] {
  return (options) => {
    const req = withTransaction(options.req)
    const optionsWithTransactionId = {
      ...options,
      req,
    }
    return payload.findGlobalVersionByID(optionsWithTransactionId)
  }
}
