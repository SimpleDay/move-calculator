import {
  HotfixReleaseCandidateVersion,
  HotfixReleaseVersion,
  ReleaseCandidateVersion,
  ReleaseType,
  ReleaseVersion,
  Version,
} from '@/model'

export function incrementVersion(previousVersion: Version, releaseType: ReleaseType): Version {
  switch (releaseType) {
    case 'release':
      return nextReleaseVersion(previousVersion)
    case 'release-candidate':
      return nextReleaseCandidateVersion(previousVersion)
    case 'hotfix-release':
      return nextHotfixReleaseVersion(previousVersion)
    case 'hotfix-release-candidate':
      return nextHotfixReleaseCandidateVersion(previousVersion)
  }
}

function nextReleaseVersion(previousVersion: Version): ReleaseVersion {
  if (previousVersion.type !== 'release-candidate')
    throw new Error(`cannot create release from <${previousVersion.type}>`)
  return {
    type: 'release',
    prefix: previousVersion.prefix,
    major: previousVersion.major,
    minor: previousVersion.minor,
  }
}

function nextReleaseCandidateVersion(previousVersion: Version): ReleaseCandidateVersion {
  if (previousVersion.type === 'release') {
    const currentYear = new Date().getFullYear()
    if (previousVersion.major < currentYear) {
      return {
        type: 'release-candidate',
        prefix: previousVersion.prefix,
        major: currentYear,
        minor: 1,
        rc: 1,
      }
    }
    return {
      type: 'release-candidate',
      prefix: previousVersion.prefix,
      major: previousVersion.major,
      minor: previousVersion.minor + 1,
      rc: 1,
    }
  } else if (previousVersion.type === 'release-candidate') {
    return {
      type: 'release-candidate',
      prefix: previousVersion.prefix,
      major: previousVersion.major,
      minor: previousVersion.minor,
      rc: previousVersion.rc + 1,
    }
  }
  throw new Error(`cannot create release candidate from <${previousVersion.type}>`)
}

function nextHotfixReleaseCandidateVersion(previousVersion: Version): HotfixReleaseCandidateVersion {
  if (previousVersion.type === 'release') {
    return {
      type: 'hotfix-release-candidate',
      prefix: previousVersion.prefix,
      major: previousVersion.major,
      minor: previousVersion.minor,
      hotfix: 1,
      rc: 1,
    }
  } else if (previousVersion.type === 'hotfix-release') {
    return {
      type: 'hotfix-release-candidate',
      prefix: previousVersion.prefix,
      major: previousVersion.major,
      minor: previousVersion.minor,
      hotfix: previousVersion.hotfix + 1,
      rc: 1,
    }
  } else if (previousVersion.type === 'hotfix-release-candidate') {
    return {
      type: 'hotfix-release-candidate',
      prefix: previousVersion.prefix,
      major: previousVersion.major,
      minor: previousVersion.minor,
      hotfix: previousVersion.hotfix,
      rc: previousVersion.rc + 1,
    }
  }
  throw new Error(`cannot create hotfix release candidate from <${previousVersion.type}>`)
}

function nextHotfixReleaseVersion(previousVersion: Version): HotfixReleaseVersion {
  if (previousVersion.type === 'hotfix-release-candidate') {
    return {
      type: 'hotfix-release',
      prefix: previousVersion.prefix,
      major: previousVersion.major,
      minor: previousVersion.minor,
      hotfix: previousVersion.hotfix,
    }
  }
  throw new Error(`cannot create hotfix release from <${previousVersion.type}>`)
}
