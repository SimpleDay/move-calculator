import { di } from '@/di'
import configPromise from '@payload-config'
import { ContainerModule } from 'inversify'
import { getPayload } from 'payload'

export const payloadModule = new ContainerModule(async (options) => {
  const payload = await getPayload({ config: configPromise })
  options.bind(di.payload).toConstantValue(payload)
})
