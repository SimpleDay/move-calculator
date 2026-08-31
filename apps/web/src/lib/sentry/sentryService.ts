import * as Sentry from '@sentry/nextjs'
import { InstrumentationService, SpanOptions } from './types'

const runInSpan = <T>(callback: () => T, { name }: SpanOptions = {}): T => {
  return Sentry.startSpan({ name: name ?? callback.name }, callback)
}

export const sentryService = (): InstrumentationService => ({
  runInSpan,
})
