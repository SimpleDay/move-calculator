import { mapModelNameToCollectionSlug, mapWhereClause } from '@/lib/auth/adapter/mappers'
import { TransactionalOperations } from '@/lib/tx'
import { type CleanedWhere } from 'better-auth/adapters'
import { BasePayload } from 'payload'

export const deleteManyOperation =
  (payload: BasePayload, txOperations: TransactionalOperations) =>
  async ({ model, where }: { model: string; where: CleanedWhere[] }) => {
    try {
      payload.logger.debug({ model, where }, 'attempting deleteMany')
      const slug = mapModelNameToCollectionSlug(model)
      const payloadWhere = mapWhereClause(where)!
      const result = await txOperations.delete({ collection: slug, where: payloadWhere, depth: 0 })
      payload.logger.debug({ result: result.docs.length }, 'deleteMany succeeded')
      return result.docs.length
    } catch (error) {
      payload.logger.error({ msg: 'deleteMany failed', err: error })
      throw error
    }
  }
