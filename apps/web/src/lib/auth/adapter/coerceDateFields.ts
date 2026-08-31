import type { CollectionConfig } from 'payload'

// Payload's local API can return date fields as ISO strings instead of Date instances.
// Better-auth does arithmetic like `session.expiresAt.valueOf() - expiresIn * 1000`,
// which silently produces NaN on strings and disables the rolling session refresh.
export const coerceDateFields = <T extends Record<string, unknown> | null | undefined>(
  doc: T,
  collectionConfig: CollectionConfig,
): T => {
  if (!doc) return doc
  for (const fieldName of dateFieldNames(collectionConfig)) {
    const value = doc[fieldName]
    if (typeof value === 'string') {
      ;(doc as Record<string, unknown>)[fieldName] = new Date(value)
    }
  }
  return doc
}

const dateFieldNames = (config: CollectionConfig): string[] => {
  const explicit = config.fields.flatMap((field) =>
    'type' in field && field.type === 'date' && 'name' in field ? [field.name] : [],
  )
  const hasTimestamps = config.timestamps !== false
  return hasTimestamps ? [...explicit, 'createdAt', 'updatedAt'] : explicit
}
