import { CollectionSlug } from 'payload'

const mappings: Record<string, CollectionSlug | undefined> = {
  user: 'users',
  account: 'accounts',
  session: 'sessions',
  verification: 'verifications',
  rateLimit: 'rateLimits',
}

export function mapModelNameToCollectionSlug(modelName: string): CollectionSlug {
  const collectionSlug = mappings[modelName]
  if (!collectionSlug) {
    throw new Error(`Model name "${modelName}" does not map to a collection slug.`)
  }
  return collectionSlug
}
