import { withTransaction } from '@/lib/tx'
import { BasePayload } from 'payload'

export function createTransactionalCountVersions(payload: BasePayload): BasePayload['countVersions'] {
  return (options) => {
    const req = withTransaction(options.req)
    const optionsWithTransactionId = {
      ...options,
      req,
    }
    return payload.countVersions(optionsWithTransactionId)
  }
}
