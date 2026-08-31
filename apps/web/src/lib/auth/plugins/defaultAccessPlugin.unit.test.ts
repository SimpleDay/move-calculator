import type { CollectionConfig, Config, GlobalConfig } from 'payload'
import { describe, expect, it } from 'vitest'
import { defaultAccessPlugin } from './defaultAccessPlugin'

const defaultAccessFn = () => true

const configuredAccessFn = () => false

const defaults = {
  create: defaultAccessFn,
  read: defaultAccessFn,
  update: defaultAccessFn,
  delete: defaultAccessFn,
  admin: defaultAccessFn,
  readVersions: defaultAccessFn,
  unlock: defaultAccessFn,
}

describe('defaultAccessPlugin', () => {
  it('returns config as is when no collections or globals exist', async () => {
    const config: Partial<Config> = {
      collections: undefined,
      globals: undefined,
    }

    const plugin = defaultAccessPlugin({ defaults })
    const result = plugin(config as Config)

    expect(result).toEqual(config)
  })

  it('applies default access to collections without access configuration', async () => {
    const collections: CollectionConfig[] = [
      {
        slug: 'posts',
        fields: [],
      },
    ]

    const config: Partial<Config> = {
      collections,
    }

    const plugin = defaultAccessPlugin({ defaults })
    const result = plugin(config as Config)
    const actualAccess = result.collections?.[0].access

    expect(actualAccess?.admin).toBe(defaultAccessFn)
    expect(actualAccess?.read).toBe(defaultAccessFn)
    expect(actualAccess?.update).toBe(defaultAccessFn)
    expect(actualAccess?.create).toBe(defaultAccessFn)
    expect(actualAccess?.delete).toBe(defaultAccessFn)
    expect(actualAccess?.readVersions).toBe(defaultAccessFn)
    expect(actualAccess?.unlock).toBe(defaultAccessFn)
  })

  it('merges default access with existing collection access', async () => {
    const customAccess = {
      create: configuredAccessFn,
      read: configuredAccessFn,
    }

    const collections: CollectionConfig[] = [
      {
        slug: 'posts',
        fields: [],
        access: customAccess,
      },
    ]

    const config: Partial<Config> = {
      collections,
    }

    const plugin = defaultAccessPlugin({ defaults })
    const result = await plugin(config as Config)
    const actualAccess = result.collections?.[0].access

    expect(actualAccess?.admin).toBe(defaultAccessFn)
    expect(actualAccess?.read).toBe(configuredAccessFn)
    expect(actualAccess?.update).toBe(defaultAccessFn)
    expect(actualAccess?.create).toBe(configuredAccessFn)
    expect(actualAccess?.delete).toBe(defaultAccessFn)
    expect(actualAccess?.readVersions).toBe(defaultAccessFn)
    expect(actualAccess?.unlock).toBe(defaultAccessFn)
  })

  it('handles multiple collections', async () => {
    const collections: CollectionConfig[] = [
      {
        slug: 'posts',
        fields: [],
      },
      {
        slug: 'users',
        fields: [],
        access: {
          create: () => false,
        },
      },
    ]

    const config: Partial<Config> = {
      collections,
    }

    const plugin = defaultAccessPlugin({ defaults })
    const result = await plugin(config as Config)
    const firstCollection = result.collections?.[0]
    const secondCollection = result.collections?.[0]

    expect(firstCollection?.access?.read).toBe(defaultAccessFn)
    expect(secondCollection?.access?.read).toBe(defaultAccessFn)
  })

  it('applies default access to globals without access configuration', async () => {
    const globals: GlobalConfig[] = [
      {
        slug: 'settings',
        fields: [],
      },
    ]

    const config: Partial<Config> = { globals }

    const plugin = defaultAccessPlugin({ defaults })
    const result = await plugin(config as Config)
    const actualAccess = result.globals?.[0].access

    expect(actualAccess?.read).toBe(defaultAccessFn)
    expect(actualAccess?.update).toBe(defaultAccessFn)
    expect(actualAccess?.readVersions).toBe(defaultAccessFn)
  })

  it('merges default access with existing global access', async () => {
    const globals: GlobalConfig[] = [
      {
        slug: 'settings',
        fields: [],
        access: {
          read: configuredAccessFn,
        },
      },
    ]

    const config: Partial<Config> = { globals }

    const plugin = defaultAccessPlugin({ defaults })
    const result = await plugin(config as Config)
    const actualAccess = result.globals?.[0].access

    expect(actualAccess?.read).toBe(configuredAccessFn)
    expect(actualAccess?.update).toBe(defaultAccessFn)
    expect(actualAccess?.readVersions).toBe(defaultAccessFn)
  })
})
