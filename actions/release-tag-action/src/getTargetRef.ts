import { Version } from '@/model'
import { toVersionString } from '@/toVersionString'

export function getTargetRef(nextVersion: Version, previousVersion: Version, branchName: string): string {
  switch (nextVersion.type) {
    case 'release':
    case 'hotfix-release':
      return toVersionString(previousVersion)
    case 'release-candidate':
    case 'hotfix-release-candidate':
      return branchName
  }
}
