import { ReleaseType } from '@/model'

const branchRegexByReleaseType: Record<ReleaseType, RegExp> = {
  release: /^main$/,
  'release-candidate': /^main$/,
  'hotfix-release': /^hotfix\/.+$/,
  'hotfix-release-candidate': /^hotfix\/.+$/,
}

export function assertBranch(releaseType: ReleaseType, branch: string): void {
  const regexp = branchRegexByReleaseType[releaseType]
  if (!regexp.test(branch)) {
    throw new Error(`Invalid branch <${branch}> for release type <${releaseType}>`)
  }
}
