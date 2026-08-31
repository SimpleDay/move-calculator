import { coerceDateFields } from '@/lib/auth/adapter/coerceDateFields'
import { mapLimitAndOffset, mapModelNameToCollectionSlug, mapSortBy, mapWhereClause } from '@/lib/auth/adapter/mappers'
import { toPayloadLocalApiConfig } from '@/lib/auth/adapter/toPayloadLocalApiConfig'
import { TransactionalOperations } from '@/lib/tx'
import { type CleanedWhere, type JoinConfig } from 'better-auth/adapters'
import { BasePayload, type JoinQuery } from 'payload'

export const findManyOperation =
  (payload: BasePayload, txOperations: TransactionalOperations) =>
  async <T>({
    model,
    where,
    limit,
    sortBy,
    offset,
    join,
  }: {
    model: string
    where?: CleanedWhere[]
    limit: number
    select?: string[]
    sortBy?: { field: string; direction: 'asc' | 'desc' }
    offset?: number
    join?: JoinConfig
  }): Promise<T[]> => {
    try {
      payload.logger.debug({ model, where, limit, sortBy, offset, join }, 'attempting findMany')
      const slug = mapModelNameToCollectionSlug(model)
      const payloadWhere = mapWhereClause(where)
      const { page, limit: newLimit } = mapLimitAndOffset(limit, offset)
      const sort = mapSortBy(sortBy)
      const { depth, joins, mapJoinsToBetterAuth } = toPayloadLocalApiConfig({
        payload,
        baseModel: model,
        joinConfig: join,
      })
      const result = await txOperations.find({
        collection: slug,
        where: payloadWhere,
        depth,
        page,
        limit: newLimit,
        sort,
        joins: joins as JoinQuery,
      })
      const config = payload.collections[slug].config
      const docs = mapJoinsToBetterAuth(result.docs as unknown as Record<string, unknown>[]).map((doc) =>
        coerceDateFields(doc, config),
      )
      payload.logger.debug({ result: docs }, 'findMany succeeded')

      return docs as T[]
    } catch (error) {
      payload.logger.error({ msg: 'findMany failed', err: error })
      throw error
    }
  }
