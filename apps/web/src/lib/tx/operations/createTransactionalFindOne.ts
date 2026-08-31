import { CollectionFindOne, withTransaction } from '@/lib/tx'
import { BasePayload } from 'payload'

export function createTransactionalFindOne(payload: BasePayload): CollectionFindOne {
  return async (options) => {
    const req = withTransaction(options.req)
    const optionsWithTransactionId = {
      ...options,
      req,
    }
    const { docs, totalDocs } = await payload.find({ ...optionsWithTransactionId, pagination: false, limit: 2 })
    if (totalDocs > 1) {
      throw new Error('Too many documents')
    }
    return docs?.[0] ?? null
  }
}
