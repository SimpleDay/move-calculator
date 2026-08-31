export function isDemoPortalEnabled(): boolean {
  return process.env.NODE_ENV === 'development' || process.env.POC_DEMO_MODE === 'true'
}
