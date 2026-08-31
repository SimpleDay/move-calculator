import { withTransaction } from '@/lib/tx'
import { BasePayload } from 'payload'

export function createTransactionalRestoreGlobalVersion(payload: BasePayload): BasePayload['restoreGlobalVersion'] {
  return (options) => {
    const req = withTransaction(options.req)
    const optionsWithTransactionId = {
      ...options,
      req,
    }
    return payload.restoreGlobalVersion(optionsWithTransactionId)
  }
}
