import { Version } from '@/model'

export function parseVersion(version: string): Version {
  const [prefix, versionString] = version.toLowerCase().split('@')
  const fragments = versionString.split('.')
  if (fragments.length === 4) {
    return {
      type: 'hotfix-release-candidate',
      prefix,
      major: parseInt(fragments[0]),
      minor: parseInt(fragments[1]),
      hotfix: parseInt(fragments[2]),
      rc: parseInt(fragments[3].substring(2)), // remove 'rc' prefix
    }
  } else if (fragments.length === 3) {
    if (fragments[2].startsWith('rc')) {
      return {
        type: 'release-candidate',
        prefix,
        major: parseInt(fragments[0]),
        minor: parseInt(fragments[1]),
        rc: parseInt(fragments[2].substring(2)), // remove 'rc' prefix
      }
    } else {
      return {
        type: 'hotfix-release',
        prefix,
        major: parseInt(fragments[0]),
        minor: parseInt(fragments[1]),
        hotfix: parseInt(fragments[2]),
      }
    }
  } else if (fragments.length === 2) {
    return {
      type: 'release',
      prefix,
      major: parseInt(fragments[0]),
      minor: parseInt(fragments[1]),
    }
  }
  throw new Error(`Invalid version <${version}>`)
}
