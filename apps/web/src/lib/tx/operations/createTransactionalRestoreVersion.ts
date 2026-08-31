import { withTransaction } from '@/lib/tx'
import { BasePayload } from 'payload'

export function createTransactionalRestoreVersion(payload: BasePayload): BasePayload['restoreVersion'] {
  return (options) => {
    const req = withTransaction(options.req)
    const optionsWithTransactionId = {
      ...options,
      req,
    }
    return payload.restoreVersion(optionsWithTransactionId)
  }
}
