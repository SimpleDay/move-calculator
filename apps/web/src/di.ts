import type { AuthService } from '@/lib/auth'
import type { BetterAuthType } from '@/lib/auth/createBetterAuth'
import { typeSymbol } from '@/lib/di/typeSymbol'
import type { EmailService } from '@/lib/email'
import type { InstrumentationService } from '@/lib/sentry/types'
import type { RunInTransactionFn, TransactionalOperations } from '@/lib/tx'
import type { BasePayload } from 'payload'

export const di = {
  payload: typeSymbol<BasePayload>('di.payload'),
  instrumentationService: typeSymbol<InstrumentationService>('di.instrumentationService'),
  emailService: typeSymbol<EmailService>('di.emailService'),
  betterAuth: typeSymbol<BetterAuthType>('di.betterAuth'),
  authService: typeSymbol<AuthService>('di.authService'),
  localApi: typeSymbol<TransactionalOperations>('di.localApi'),
  transactionRunner: typeSymbol<RunInTransactionFn>('di.transactionRunner'),
} as const
