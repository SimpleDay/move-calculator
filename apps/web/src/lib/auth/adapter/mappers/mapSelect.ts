export function mapSelect(keys: string[] | undefined): Record<string, true> | undefined {
  if (!keys || keys.length === 0) return undefined
  return Object.fromEntries(keys.map((key) => [key, true]))
}
