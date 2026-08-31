export function mapSortBy(sortBy?: { field: string; direction: 'asc' | 'desc' }): string | undefined {
  if (!sortBy) return undefined
  const { field, direction } = sortBy
  const prefix = direction === 'desc' ? '-' : ''
  return `${prefix}${field}`
}
