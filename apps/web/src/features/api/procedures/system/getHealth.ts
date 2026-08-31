import { oc } from '../../server/orpc'

export const getHealth = oc.system.health.handler(async () => ({
  service: 'zuegelofferte',
  status: 'ok',
}))
