import { mapModelNameToCollectionSlug } from '@/lib/auth/adapter/mappers'
import type { JoinConfig } from 'better-auth'
import type { BasePayload, CollectionSlug, Field, JoinQuery } from 'payload'

export type PayloadLocalApiJoinConfig = {
  depth: number
  joins: JoinQuery | false
  mapJoinsToBetterAuth: (docs: readonly Record<string, unknown>[]) => Record<string, unknown>[]
}

type ForwardPlan = {
  kind: 'forward'
  alias: string
  relationshipFieldName: string
}

type ReversePlan = {
  kind: 'reverse'
  alias: string
  joinFieldName: string
  isOneToOne: boolean
}

type Plan = ForwardPlan | ReversePlan

type ToPayloadLocalApiConfigOptions = {
  payload: BasePayload
  baseModel: string
  joinConfig?: JoinConfig
}

const noopConfig: PayloadLocalApiJoinConfig = {
  depth: 0,
  joins: false,
  mapJoinsToBetterAuth: (docs) => docs.map((doc) => ({ ...doc })),
}

export function toPayloadLocalApiConfig({
  payload,
  baseModel,
  joinConfig,
}: ToPayloadLocalApiConfigOptions): PayloadLocalApiJoinConfig {
  if (!joinConfig || Object.keys(joinConfig).length === 0) {
    return noopConfig
  }

  const baseSlug = mapModelNameToCollectionSlug(baseModel)
  const baseFields = payload.collections[baseSlug].config.fields
  const plans: Plan[] = []
  const joinsQuery: Record<string, { limit: number }> = {}
  let depth = 0

  for (const [alias, config] of Object.entries(joinConfig)) {
    const { on, limit = 100, relation } = config
    const joinedSlug = mapModelNameToCollectionSlug(alias)
    const isOneToOne = relation === 'one-to-one'

    if (on.from === 'id') {
      const joinField = findJoinField(baseFields, joinedSlug, on.to)

      if (!joinField) {
        throw new Error(
          `Join from "${baseModel}" to "${alias}" requires a "join" field on the "${baseSlug}" Payload collection ` +
            `with collection: "${joinedSlug}" and on: "${on.to}". ` +
            `Suggestion: add \`{ name: '${alias}s', type: 'join', collection: '${joinedSlug}', on: '${on.to}' }\` to the "${baseSlug}" collection fields.`,
        )
      }

      joinsQuery[joinField.name] = { limit: isOneToOne ? 1 : limit }
      depth = Math.max(depth, 1)
      plans.push({ kind: 'reverse', alias, joinFieldName: joinField.name, isOneToOne })
    } else {
      if (on.to !== 'id') {
        throw new Error(
          `Join from "${baseModel}" to "${alias}" via the relationship field "${on.from}" requires on.to === "id" but received "${on.to}". ` +
            `Payload's native relationship populate only resolves joined documents by their primary id, so lateral joins through a shared foreign key (e.g. session ↔ account via userId) cannot be expressed as a single Payload query. ` +
            `Issue two separate joins instead.`,
        )
      }

      const relationshipField = findRelationshipField(baseFields, on.from, joinedSlug)

      if (!relationshipField) {
        throw new Error(
          `Join from "${baseModel}" to "${alias}" requires a "relationship" field "${on.from}" on the "${baseSlug}" Payload collection with relationTo: "${joinedSlug}".`,
        )
      }

      depth = Math.max(depth, 1)
      plans.push({ kind: 'forward', alias, relationshipFieldName: on.from })
    }
  }

  return {
    depth,
    joins: Object.keys(joinsQuery).length > 0 ? (joinsQuery as unknown as JoinQuery) : false,
    mapJoinsToBetterAuth: (docs) => docs.map((doc) => applyPlans(doc, plans)),
  }
}

type JoinField = Extract<Field, { type: 'join' }>
type RelationshipField = Extract<Field, { type: 'relationship' }>

const isJoinField = (field: Field): field is JoinField => 'type' in field && field.type === 'join'
const isRelationshipField = (field: Field): field is RelationshipField =>
  'type' in field && field.type === 'relationship'

function findJoinField(fields: readonly Field[], joinedSlug: CollectionSlug, onField: string): JoinField | undefined {
  return fields.find((field): field is JoinField => {
    if (!isJoinField(field)) return false
    const matchesCollection = Array.isArray(field.collection)
      ? field.collection.includes(joinedSlug)
      : field.collection === joinedSlug

    return matchesCollection && field.on === onField
  })
}

function findRelationshipField(
  fields: readonly Field[],
  fieldName: string,
  joinedSlug: CollectionSlug,
): RelationshipField | undefined {
  return fields.find((field): field is RelationshipField => {
    if (!isRelationshipField(field)) return false
    if (field.name !== fieldName) return false
    const matches = Array.isArray(field.relationTo)
      ? field.relationTo.includes(joinedSlug)
      : field.relationTo === joinedSlug

    return matches
  })
}

function applyPlans(record: Record<string, unknown>, plans: Plan[]): Record<string, unknown> {
  const result: Record<string, unknown> = { ...record }

  for (const plan of plans) {
    if (plan.kind === 'forward') {
      const populated = result[plan.relationshipFieldName]

      if (populated && typeof populated === 'object' && 'id' in populated) {
        result[plan.alias] = populated
        result[plan.relationshipFieldName] = (populated as { id: string | number }).id
      } else {
        result[plan.alias] = populated ?? null
      }
    } else {
      const joined = result[plan.joinFieldName]
      const docs =
        joined && typeof joined === 'object' && Array.isArray((joined as { docs?: unknown }).docs)
          ? (joined as { docs: unknown[] }).docs
          : []
      result[plan.alias] = plan.isOneToOne ? (docs[0] ?? null) : docs

      if (plan.joinFieldName !== plan.alias) {
        delete result[plan.joinFieldName]
      }
    }
  }

  return result
}
