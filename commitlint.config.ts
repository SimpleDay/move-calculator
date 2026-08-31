import { UserConfig } from '@commitlint/types'

const configuration: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  parserPreset: {
    parserOpts: {
      headerPattern: /^[A-Z]{1,4}-[0-9]+:\s(.+)$/,
      headerCorrespondence: ['subject'],
      issuePrefixes: ['[A-Z]{1,4}-'],
      referenceActions: null,
    },
  },
  rules: {
    'references-empty': [2, 'never'], // header should always contain an issue reference
    'type-empty': [2, 'always'], // type is optional
  },
}

export default configuration
