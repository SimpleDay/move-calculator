import { isDefined } from '@zuegelofferte/shared'

export function isRedirectError(error: unknown): boolean {
  return (
    isDefined(error) &&
    typeof error === 'object' &&
    'digest' in error &&
    typeof error?.digest === 'string' &&
    error.digest.startsWith('NEXT_REDIRECT')
  )
}
