# Release Concept

## Environments

### Preview (Feature)

Each feature branch is deployed to a semi contained environment, that is similar to preview. This helps test features before they reach `main`.

A feature branch is deployed as soon as a PR is created.

For now all applications contained by the mono repo are deployed regardless if they have changed or not.

### Preview

The Preview environment represents the latest development state and contains all merged features.

The preview environment is deployed on every push on `main`.

For now all applications contained by the mono repo are deployed regardless if they have changed or not.

### Staging

The Staging environment represents a potential version that can be released (release candidate). The Staging environment is deployed using a hotfix-release-candidate tag or a release-candidate tag. These tags are created either on `main` or a `hotfix/*` branch.

The purpose of the Staging Environment is acceptance testing by the client.

Each application uses their own tags and thus only the specified application is deployed.

### Production

The Production environment is the live version of the application that is exposed to customer.

It is deployed using a release tag or hotfix release tag. These tags are created either on `main` or a `hotfix/*` branch.

Each application uses their own tags and thus only the specified application is deployed.

## Versions

There are four different types of versions representing the four different release types:

- release candidate: `2025.1.rc1`
- release: `2025.1`
- hotfix release candidate: `2025.1.1.rc1`
- hotfix release `2025.1.1`

The sections of the version are:

- release year
- release increment
- hotfix increment (optional)
- release candidate increment (optional)

We do not follow semantic versioning since applications do not need compatibility information like libraries. Further, we want to provide a version that can be communicated to the client and used as milestones.

### Version Tags

Each application in a monorepo is versioned independently. For this reason each application has a unique prefix in the tag. A full release tag could look like this: `web@2025.1`.

Version tags for an application can be created using the respective Github Action.

## Worflows

Each application requires 4 Github Action workflows:

- Preview (Feature) Deployment: `.github/workflows/<application prefix>-deploy-feature.yaml`
- Preview Deployment: `.github/workflows/<application prefix>-deploy-preview.yaml`
- Staging Deployment: `.github/workflows/<application prefix>-deploy-staging.yaml`
- Production Deployment: `.github/workflows/<application prefix>-deploy-production.yaml`
- Create Release Tag: `.github/workflows/<application prefix>-create-release.yaml`

In addition a global workflow checks linting and formatting for the whole repository on pull request: `.github/workflows/pull-request.yaml`

## Release Flow

A release can only be done if there is a previous release candidate.

To create a release candidate:

- select the Create Release Action for the chosen application
- select branch `main` and type `release-candidate`
- Trigger the action

A new release candidate tag based on the last release tag / release candidate tag is created at `main`. Currently, the Github Action only supports the latest version of `main`. Selecting a commit is not supported.

To release the latest release candidate:

- select the Create Release Action for the chosen application
- select branch `main` and type `release`
- Trigger the action

A new release tag based on the last release candidate tag is created. If no release candidate tag is found, the job will fail.

## How to Hotfix

- Create a new hotfix branch from the version to hotfix: `git branch hotfix/web@2025.1 web@2025.1`
  - This is only required the first time a specific release needs to be hotfixed. Consecutive hotfixes of the same release do not require additional hotfix branches

Create a hotfix release candidate:

- Check if the staging environment requires a restore due to applied schema migrations of other release candidates
- select the Create Release Action for the chosen application
- select the hotfix branch and type `hotfix-release-candidate`
- Trigger the action

A new hotfix release candidate tag on the last tag is created. Currently, the Github Action only supports the latest version of the selected branch. Selecting a commit is not supported.

Do not merge the hotfix branch into main or delete the branch.

Create hotfix release:

- select the Create Release Action for the chosen application
- select the hotfix branch and type `hotfix-release`
- Trigger the action

A new hotfix release tag based on the last hotfix release candidate tag is created. If no hotfix release candidate tag is found, the job will fail.
