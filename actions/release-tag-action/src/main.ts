import { assertBranch } from '@/assertBranch'
import { getTargetRef } from '@/getTargetRef'
import { incrementVersion } from '@/incrementVersion'
import { ReleaseVersion, Version } from '@/model'
import { parseInput } from '@/parseInput'
import { toVersionString } from '@/toVersionString'
import { setOutput } from '@actions/core'

export function run() {
  const { previousVersion, releaseType, branch, prefix } = parseInput()
  const initialVersion: ReleaseVersion = {
    type: 'release',
    prefix,
    major: 0,
    minor: 0,
  }
  assertBranch(releaseType, branch)
  const nextVersion: Version = incrementVersion(previousVersion ?? initialVersion, releaseType)
  setOutput('next-tag', toVersionString(nextVersion))
  if (previousVersion) {
    setOutput('target-ref', getTargetRef(nextVersion, previousVersion, branch))
  } else {
    setOutput('target-ref', branch)
  }
}
