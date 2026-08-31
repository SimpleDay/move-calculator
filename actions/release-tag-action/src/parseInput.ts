import { Input, inputSchema } from '@/model'
import * as core from '@actions/core'

export function parseInput(): Input {
  return inputSchema.parse({
    branch: core.getInput('branch'),
    prefix: core.getInput('prefix'),
    previousVersion: core.getInput('previous-tag'),
    releaseType: core.getInput('release-type'),
  })
}
