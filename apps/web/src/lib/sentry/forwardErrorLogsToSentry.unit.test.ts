import { forwardErrorLogsToSentry } from '@/lib/sentry/forwardErrorLogsToSentry'
import type { LogFn, Logger } from 'pino'
import { afterEach, expect, test, vi } from 'vitest'

const captureException = vi.fn()
const captureMessage = vi.fn()

vi.mock('@sentry/nextjs', () => ({
  captureException: (...args: unknown[]) => captureException(...args),
  captureMessage: (...args: unknown[]) => captureMessage(...args),
}))

afterEach(() => {
  captureException.mockClear()
  captureMessage.mockClear()
})

// Invoke the hook as pino would; returns the `method` spy to assert passthrough.
const invoke = (level: number, args: unknown[]) => {
  const method = vi.fn()
  const logMethod = forwardErrorLogsToSentry?.logMethod
  if (!logMethod) throw new Error('logMethod hook is not defined')
  logMethod.call({} as Logger, args as Parameters<LogFn>, method as unknown as LogFn, level)
  return method
}

test('captures the attached Error (under `error`) for error-level logs', () => {
  const error = new Error('sendOrderConfirmationEmail failed')

  const method = invoke(50, [{ error, orderId: 'o1' }, 'sendOrderConfirmationEmail failed'])

  expect(captureException).toHaveBeenCalledExactlyOnceWith(error, {
    level: 'error',
    extra: { orderId: 'o1', message: 'sendOrderConfirmationEmail failed' },
  })
  expect(captureMessage).not.toHaveBeenCalled()
  // The original log must still be written.
  expect(method).toHaveBeenCalledOnce()
})

test('forwards structured fields as extra when no Error is attached', () => {
  invoke(50, [{ orderId: 'o9', step: 'debtor' }])

  expect(captureException).not.toHaveBeenCalled()
  expect(captureMessage).toHaveBeenCalledExactlyOnceWith('Error logged without a message', {
    level: 'error',
    extra: { orderId: 'o9', step: 'debtor' },
  })
})

test('maps a `tags` object to Sentry tags and keeps other fields as extra', () => {
  const error = new Error('Abacus sync failed')

  invoke(50, [{ error, localId: 'o1', tags: { feature: 'abacus_sync', resource: 'order' } }, 'Abacus sync failed'])

  expect(captureException).toHaveBeenCalledExactlyOnceWith(error, {
    level: 'error',
    tags: { feature: 'abacus_sync', resource: 'order' },
    extra: { localId: 'o1', message: 'Abacus sync failed' },
  })
})

test('keeps a non-Error `error`/`err` value as extra instead of dropping it', () => {
  invoke(50, [{ err: { code: 'E_OOPS' }, orderId: 'o3' }, 'not a real Error'])

  expect(captureException).not.toHaveBeenCalled()
  expect(captureMessage).toHaveBeenCalledExactlyOnceWith('not a real Error', {
    level: 'error',
    extra: { err: { code: 'E_OOPS' }, orderId: 'o3' },
  })
})

test('captures a bare Error passed as the first argument', () => {
  const error = new Error('unexpected failure')

  invoke(50, [error])

  expect(captureException).toHaveBeenCalledExactlyOnceWith(error, { level: 'error' })
  expect(captureMessage).not.toHaveBeenCalled()
})

test('captures the attached Error (under `err`) at fatal level for fatal logs', () => {
  const error = new Error('boom')

  invoke(60, [{ err: error }])

  expect(captureException).toHaveBeenCalledExactlyOnceWith(error, { level: 'fatal' })
})

test('falls back to the message when no Error is attached', () => {
  invoke(50, ['something went wrong'])

  expect(captureException).not.toHaveBeenCalled()
  expect(captureMessage).toHaveBeenCalledExactlyOnceWith('something went wrong', { level: 'error' })
})

test('ignores logs below error level', () => {
  const method = invoke(40, [{ error: new Error('warn only') }, 'a warning'])

  expect(captureException).not.toHaveBeenCalled()
  expect(captureMessage).not.toHaveBeenCalled()
  expect(method).toHaveBeenCalledOnce()
})

test('still writes the log and does not throw when Sentry fails', () => {
  captureException.mockImplementationOnce(() => {
    throw new Error('sentry down')
  })

  const method = invoke(50, [{ error: new Error('boom') }, 'boom'])

  expect(method).toHaveBeenCalledOnce()
})
