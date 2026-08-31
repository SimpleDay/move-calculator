import * as process from 'node:process'
import 'server-cli-only'

/**
 * returns the current domain including protocol without trailing slash.
 * use in server code only.
 */
export function getServerSideDomain(
  {
    VERCEL_TARGET_ENV,
    VERCEL_PROJECT_PRODUCTION_URL,
    NEXT_PUBLIC_SERVER_URL,
    VERCEL_BRANCH_URL,
    VERCEL_GIT_COMMIT_REF,
  }: Partial<NodeJS.ProcessEnv> = process.env,
) {
  if (VERCEL_TARGET_ENV === 'production') {
    return `https://${VERCEL_PROJECT_PRODUCTION_URL!}`
  }
  if (NEXT_PUBLIC_SERVER_URL) {
    return NEXT_PUBLIC_SERVER_URL
  }
  if (VERCEL_TARGET_ENV === 'preview' && VERCEL_GIT_COMMIT_REF !== 'main') {
    return `https://${VERCEL_BRANCH_URL!}`
  }
  throw new Error('Could not determine URL. Did you forget to set NEXT_PUBLIC_SERVER_URL?')
}
