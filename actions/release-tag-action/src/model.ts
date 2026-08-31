import { parseVersion } from '@/parseVersion'
import { z } from 'zod'

const releaseTypeSchema = z.enum([
  'release',
  'release-candidate',
  'hotfix-release',
  'hotfix-release-candidate',
] as const)

export type ReleaseType = z.infer<typeof releaseTypeSchema>

export const inputSchema = z.object({
  branch: z.string(),
  prefix: z.string(),
  previousVersion: z
    .string()
    .optional()
    .transform((previousTag) => (previousTag ? parseVersion(previousTag) : undefined)),
  releaseType: releaseTypeSchema,
})

export type Input = z.infer<typeof inputSchema>

type BaseVersion = {
  major: number
  minor: number
  prefix: string
}

export type ReleaseVersion = BaseVersion & {
  type: 'release'
}

export type ReleaseCandidateVersion = BaseVersion & {
  type: 'release-candidate'
  rc: number
}

export type HotfixReleaseVersion = BaseVersion & {
  type: 'hotfix-release'
  hotfix: number
}

export type HotfixReleaseCandidateVersion = BaseVersion & {
  type: 'hotfix-release-candidate'
  hotfix: number
  rc: number
}

export type Version = ReleaseVersion | ReleaseCandidateVersion | HotfixReleaseVersion | HotfixReleaseCandidateVersion
