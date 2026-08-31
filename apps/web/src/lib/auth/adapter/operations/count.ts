import { mapModelNameToCollectionSlug, mapWhereClause } from '@/lib/auth/adapter/mappers'
import { TransactionalOperations } from '@/lib/tx'
import { type CleanedWhere } from 'better-auth/adapters'
import { BasePayload } from 'payload'

export const countOperation =
  (payload: BasePayload, txOperations: TransactionalOperations) =>
  async ({ model, where }: { model: string; where?: CleanedWhere[] }) => {
    try {
      payload.logger.debug({ model, where }, 'attempting count')
      const slug = mapModelNameToCollectionSlug(model)
      const payloadWhere = mapWhereClause(where)
      const result = await txOperations.count({ collection: slug, where: payloadWhere })
      payload.logger.debug({ result: result.totalDocs }, 'count succeeded')
      return result.totalDocs
    } catch (error) {
      payload.logger.error({ msg: 'count failed', err: error })
      throw error
    }
  }
