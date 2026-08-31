import { Version } from '@/model'

export function toVersionString(version: Version): string {
  switch (version.type) {
    case 'release':
      return `${version.prefix}@${version.major}.${version.minor}`
    case 'release-candidate':
      return `${version.prefix}@${version.major}.${version.minor}.rc${version.rc}`
    case 'hotfix-release':
      return `${version.prefix}@${version.major}.${version.minor}.${version.hotfix}`
    case 'hotfix-release-candidate':
      return `${version.prefix}@${version.major}.${version.minor}.${version.hotfix}.rc${version.rc}`
  }
}
