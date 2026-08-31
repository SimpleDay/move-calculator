import { Where as BetterAuthWhere } from 'better-auth'
import { Where as PayloadWhere, WhereField as PayloadWhereField } from 'payload'

type BetterAuthOperator = BetterAuthWhere['operator']

type BetterAuthValue = BetterAuthWhere['value']

function mapToWhereField(operator: BetterAuthOperator, value: BetterAuthValue): PayloadWhereField {
  switch (operator ?? 'eq') {
    case 'eq':
      return { equals: value }
    case 'ne':
      return { not_equals: value }
    case 'gt':
      return { greater_than: value }
    case 'gte':
      return { greater_than_equal: value }
    case 'lt':
      return { less_than: value }
    case 'lte':
      return { less_than_equal: value }
    case 'contains':
      return { contains: value }
    case 'in':
      return { in: value }
    case 'not_in':
      return { not_in: value }
    case 'starts_with':
      return { like: `${value}%` }
    case 'ends_with':
      return { like: `%${value}` }
    default: {
      throw new Error(`unsupported operator: ${operator}`)
    }
  }
}

export function mapWhereClause(where: BetterAuthWhere[] = []): PayloadWhere | undefined {
  if (where.length === 0) return undefined

  if (where.length === 1) {
    const w = where[0]
    return { [w.field]: mapToWhereField(w.operator, w.value) }
  }

  const and = where.filter((w) => w.connector === 'AND' || !w.connector)
  const or = where.filter((w) => w.connector === 'OR')

  const andClause = and.map((w) => ({ [w.field]: mapToWhereField(w.operator, w.value) }))
  const orClause = or.map((w) => ({ [w.field]: mapToWhereField(w.operator, w.value) }))

  return {
    ...(andClause.length > 0 ? { AND: andClause } : {}),
    ...(orClause.length > 0 ? { OR: orClause } : {}),
  }
}
