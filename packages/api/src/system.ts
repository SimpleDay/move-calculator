import { z } from 'zod'
import { oc } from './oc'

export const healthStatusSchema = z.object({
  service: z.literal('zuegelofferte'),
  status: z.literal('ok'),
})

export type HealthStatus = z.infer<typeof healthStatusSchema>

export const getHealth = oc
  .route({
    method: 'GET',
    summary: 'Check whether the web application is available',
  })
  .meta({ access: 'anonymous' })
  .output(healthStatusSchema)
