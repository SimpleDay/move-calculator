import { assertNoUnknownFields } from '@/lib/auth/adapter/assertNoUnknownFields'
import { coerceDateFields } from '@/lib/auth/adapter/coerceDateFields'
import { mapModelNameToCollectionSlug, mapWhereClause } from '@/lib/auth/adapter/mappers'
import { TransactionalOperations } from '@/lib/tx'
import { type CleanedWhere } from 'better-auth/adapters'
import { BasePayload } from 'payload'

export const updateOperation =
  (payload: BasePayload, txOperations: TransactionalOperations) =>
  async <T>({ model, where, update: data }: { model: string; where: CleanedWhere[]; update: T }): Promise<T | null> => {
    try {
      payload.logger.debug({ model, where, data }, 'attempting update')
      const slug = mapModelNameToCollectionSlug(model)
      assertNoUnknownFields({
        modelName: model,
        data: data as Record<string, unknown>,
        collectionConfig: payload.collections[slug].config,
      })
      const payloadWhere = mapWhereClause(where)!
      const result = await txOperations.update({
        collection: slug,
        where: payloadWhere,
        data: data as Record<string, unknown>,
        depth: 0,
      })
      const returnValue = result.docs.length > 0 ? result.docs[0] : null
      const coerced = coerceDateFields(returnValue as Record<string, unknown> | null, payload.collections[slug].config)
      payload.logger.debug({ returnValue: coerced }, 'update succeeded')
      return coerced as T | null
    } catch (error) {
      payload.logger.error({ msg: 'update failed', err: error })
      throw error
    }
  }
