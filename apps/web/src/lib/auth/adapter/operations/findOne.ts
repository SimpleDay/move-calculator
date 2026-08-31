import { coerceDateFields } from '@/lib/auth/adapter/coerceDateFields'
import { mapModelNameToCollectionSlug, mapSelect, mapWhereClause } from '@/lib/auth/adapter/mappers'
import { toPayloadLocalApiConfig } from '@/lib/auth/adapter/toPayloadLocalApiConfig'
import { TransactionalOperations } from '@/lib/tx'
import { type CleanedWhere, type JoinConfig } from 'better-auth/adapters'
import { BasePayload, type JoinQuery } from 'payload'

export const findOneOperation =
  (payload: BasePayload, txOperations: TransactionalOperations) =>
  async <T>({
    model,
    where,
    select,
    join,
  }: {
    model: string
    where: CleanedWhere[]
    select?: string[]
    join?: JoinConfig
  }): Promise<T | null> => {
    try {
      payload.logger.debug({ model, where, join }, 'attempting findOne')
      const slug = mapModelNameToCollectionSlug(model)
      const payloadSelect = mapSelect(select)
      const payloadWhere = mapWhereClause(where)
      const { depth, joins, mapJoinsToBetterAuth } = toPayloadLocalApiConfig({
        payload,
        baseModel: model,
        joinConfig: join,
      })
      const result = await txOperations.findOne({
        collection: slug,
        select: payloadSelect,
        where: payloadWhere,
        depth,
        joins: joins as JoinQuery,
      })
      const [doc = null] = result ? mapJoinsToBetterAuth([result as unknown as Record<string, unknown>]) : []
      const coerced = coerceDateFields(doc, payload.collections[slug].config)
      payload.logger.debug({ result: coerced }, 'findOne succeeded')

      return coerced as T | null
    } catch (error) {
      payload.logger.error({ msg: 'findOne failed', err: error })
      throw error
    }
  }
