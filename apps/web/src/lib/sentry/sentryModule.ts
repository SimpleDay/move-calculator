import { di } from '@/di'
import { sentryService } from '@/lib/sentry/sentryService'
import { ContainerModule } from 'inversify'
import { InstrumentationService } from './types'

export const sentryModule = new ContainerModule((options) => {
  options.bind<InstrumentationService>(di.instrumentationService).toResolvedValue(sentryService)
})
