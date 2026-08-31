import { mapModelNameToCollectionSlug, mapWhereClause } from '@/lib/auth/adapter/mappers'
import { TransactionalOperations } from '@/lib/tx'
import { type CleanedWhere } from 'better-auth/adapters'
import { BasePayload } from 'payload'

export const deleteOneOperation =
  (payload: BasePayload, txOperations: TransactionalOperations) =>
  async ({ model, where }: { model: string; where: CleanedWhere[] }) => {
    try {
      payload.logger.debug({ model, where }, 'attempting delete')
      const slug = mapModelNameToCollectionSlug(model)
      const payloadWhere = mapWhereClause(where)!
      await txOperations.delete({ collection: slug, where: payloadWhere, depth: 0 })
      payload.logger.debug('delete succeeded')
    } catch (error) {
      payload.logger.error({ msg: 'delete failed', err: error })
      throw error
    }
  }
