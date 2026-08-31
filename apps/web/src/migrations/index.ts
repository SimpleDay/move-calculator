import * as migration_20260830_141709 from './20260830_141709'
import * as migration_20260830_175433 from './20260830_175433'

export const migrations = [
  {
    up: migration_20260830_141709.up,
    down: migration_20260830_141709.down,
    name: '20260830_141709',
  },
  {
    up: migration_20260830_175433.up,
    down: migration_20260830_175433.down,
    name: '20260830_175433',
  },
]
