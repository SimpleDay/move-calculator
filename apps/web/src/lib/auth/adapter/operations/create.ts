import { assertNoUnknownFields } from '@/lib/auth/adapter/assertNoUnknownFields'
import { coerceDateFields } from '@/lib/auth/adapter/coerceDateFields'
import { mapModelNameToCollectionSlug, mapSelect } from '@/lib/auth/adapter/mappers'
import { TransactionalOperations } from '@/lib/tx'
import { BasePayload } from 'payload'

export const createOperation =
  (payload: BasePayload, txOperations: TransactionalOperations) =>
  async <T extends Record<string, unknown>>({
    model,
    data,
    select,
  }: {
    model: string
    data: T
    select?: string[]
  }): Promise<T> => {
    try {
      payload.logger.debug({ model, data }, 'attempting create')
      const slug = mapModelNameToCollectionSlug(model)
      assertNoUnknownFields({ modelName: model, data, collectionConfig: payload.collections[slug].config })
      const payloadSelect = mapSelect(select)
      const result = await txOperations.create({ collection: slug, data, depth: 0, select: payloadSelect })
      const coerced = coerceDateFields(result as unknown as Record<string, unknown>, payload.collections[slug].config)
      payload.logger.debug({ result: coerced }, 'create succeeded')
      return coerced as unknown as T
    } catch (error) {
      payload.logger.error({ msg: 'create failed', err: error })
      throw error
    }
  }
