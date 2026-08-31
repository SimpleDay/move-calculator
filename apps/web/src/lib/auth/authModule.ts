import { di } from '@/di'
import { BetterAuthType, createBetterAuth } from '@/lib/auth/createBetterAuth'
import { betterAuthService } from '@/lib/auth/service/betterAuthService'
import { AuthService } from '@/lib/auth/types'
import { ContainerModule } from 'inversify'

export const authModule = new ContainerModule((options) => {
  options
    .bind<BetterAuthType>(di.betterAuth)
    .toResolvedValue(createBetterAuth, [di.payload, di.localApi, di.emailService])
  options
    .bind<AuthService>(di.authService)
    .toResolvedValue(betterAuthService, [di.betterAuth, di.payload, di.localApi, di.emailService])
})
