import * as Sentry from '@sentry/nextjs'
import { levels, type LogFn, type Logger, type LoggerOptions } from 'pino'

function forwardToSentry(this: Logger, inputArgs: Parameters<LogFn>, method: LogFn, level: number) {
  if (level >= levels.values.error) tryForwardToSentry(inputArgs, level)
  return method.apply(this, inputArgs)
}

// Pino accepts the error either as the first argument or under `error`/`err` on
// the merge object; pull whichever Error is present.
function capturedErrorFrom(first: unknown, merge: object | undefined): Error | undefined {
  if (first instanceof Error) return first
  const errorValue = merge && ('error' in merge ? merge.error : 'err' in merge ? merge.err : undefined)
  return errorValue instanceof Error ? errorValue : undefined
}

// Best-effort: swallows its own failures so a Sentry outage never drops the log
// write or throws into a caller that only logs to swallow-and-continue.
function tryForwardToSentry(inputArgs: Parameters<LogFn>, level: number) {
  try {
    // Pino call shapes: `logger.error(error)`, `logger.error(obj, msg)`, `logger.error(msg)`.
    const first: unknown = inputArgs[0]
    const second: unknown = inputArgs[1]

    const merge = typeof first === 'object' && first !== null ? first : undefined
    const capturedError = capturedErrorFrom(first, merge)
    const message = typeof first === 'string' ? first : typeof second === 'string' ? second : undefined

    // The captured Error becomes the Sentry exception; a `tags` object maps to
    // Sentry tags; every other field (including a non-Error `error`/`err`) is
    // preserved as `extra`.
    const extra: Record<string, unknown> = {}
    let tags: Record<string, string> | undefined
    if (merge) {
      for (const [key, value] of Object.entries(merge)) {
        if (value === capturedError) continue
        if (key === 'tags' && typeof value === 'object' && value !== null) {
          tags = {}
          for (const [name, tag] of Object.entries(value)) if (typeof tag === 'string') tags[name] = tag
          continue
        }
        extra[key] = value
      }
    }

    const context: { level: 'error' | 'fatal'; extra?: Record<string, unknown>; tags?: Record<string, string> } = {
      level: level >= levels.values.fatal ? 'fatal' : 'error',
    }
    if (tags) context.tags = tags

    if (capturedError && message) extra.message = message
    if (Object.keys(extra).length) context.extra = extra

    // captureException runs before pino serializes, so the Error still carries its stack.
    if (capturedError) Sentry.captureException(capturedError, context)
    else Sentry.captureMessage(message ?? 'Error logged without a message', context)
  } catch {
    // A Sentry failure here is intentionally ignored (see the note above).
  }
}

// Payload logs errors instead of rethrowing, so they never reach Next.js's
// onRequestError and stay invisible to Sentry. Capturing at the log boundary
// covers both request 5xx and swallow-and-log sites with one hook; an
// afterError hook would double-report every request 500.
export const forwardErrorLogsToSentry: LoggerOptions['hooks'] = {
  logMethod: forwardToSentry,
}
