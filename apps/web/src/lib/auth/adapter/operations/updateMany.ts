import { assertNoUnknownFields } from '@/lib/auth/adapter/assertNoUnknownFields'
import { mapModelNameToCollectionSlug, mapWhereClause } from '@/lib/auth/adapter/mappers'
import { TransactionalOperations } from '@/lib/tx'
import { type CleanedWhere } from 'better-auth/adapters'
import { BasePayload } from 'payload'

export const updateManyOperation =
  (payload: BasePayload, txOperations: TransactionalOperations) =>
  async ({ model, where, update: data }: { model: string; where: CleanedWhere[]; update: Record<string, unknown> }) => {
    try {
      payload.logger.debug({ model, where, data }, 'attempting updateMany')
      const slug = mapModelNameToCollectionSlug(model)
      assertNoUnknownFields({
        modelName: model,
        data,
        collectionConfig: payload.collections[slug].config,
      })
      const payloadWhere = mapWhereClause(where)!
      const result = await txOperations.update({
        collection: slug,
        where: payloadWhere,
        data,
        depth: 0,
      })
      payload.logger.debug({ result: result.docs.length }, 'updateMany succeeded')
      return result.docs.length
    } catch (error) {
      payload.logger.error({ msg: 'updateMany failed', err: error })
      throw error
    }
  }
