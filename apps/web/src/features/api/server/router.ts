import { getHealth } from '../procedures/system/getHealth'
import { oc } from './orpc'

export const router = oc.router({
  system: {
    health: getHealth,
  },
})
