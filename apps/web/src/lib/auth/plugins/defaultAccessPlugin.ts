import { CollectionConfig, Config, GlobalConfig } from 'payload'

type DefaultAccess = Required<NonNullable<CollectionConfig['access']>>

export type DefaultAccessPluginOptions = {
  defaults: DefaultAccess
}

export const defaultAccessPlugin = ({ defaults }: DefaultAccessPluginOptions) => {
  return (config: Config): Config => {
    const collections = config.collections?.map((collection) => mergeCollectionAccess(collection, defaults))
    const globals = config.globals?.map((global) => mergeGlobalAccess(global, defaults))

    return { ...config, collections, globals }
  }
}

const mergeCollectionAccess = (collection: CollectionConfig, defaults: DefaultAccess): CollectionConfig => ({
  ...collection,
  access: {
    ...defaults,
    ...collection.access,
  },
})

const mergeGlobalAccess = (global: GlobalConfig, defaults: DefaultAccess): GlobalConfig => ({
  ...global,
  access: {
    read: defaults.read,
    readVersions: defaults.readVersions,
    update: defaults.update,
    ...global.access,
  },
})
