import { CollectionConfig } from 'payload'

type Options = {
  modelName: string
  data: Record<string, unknown>
  collectionConfig: CollectionConfig
}

const globalFieldsToIgnore = ['id']

const perModelFieldsToIgnore: Record<string, string[] | undefined> = {
  user: ['image'],
}

export function assertNoUnknownFields({ modelName, data, collectionConfig }: Options) {
  const knownFieldNames = fieldNames(collectionConfig)
  const ignoredFields = [...globalFieldsToIgnore, ...(perModelFieldsToIgnore[modelName] ?? [])]
  const dataKeys = Object.keys(data)
  const keysToCheck = dataKeys.filter((key) => !ignoredFields.includes(key))
  const unknownFields = keysToCheck.filter((field) => !knownFieldNames.includes(field))
  if (unknownFields.length > 0) {
    throw new Error(`Unknown fields in data: ${unknownFields.join(', ')} for collections ${collectionConfig.slug}.`)
  }
}

function fieldNames(collectionConfig: CollectionConfig): string[] {
  return collectionConfig.fields.flatMap((field) => ('name' in field ? field.name : []))
}
