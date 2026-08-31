import { di } from '@/di'
import { emailService } from '@/lib/email/emailService'
import { ContainerModule } from 'inversify'

export const emailModule = new ContainerModule((options) => {
  options.bind(di.emailService).toResolvedValue(emailService, [di.payload, di.instrumentationService])
})
