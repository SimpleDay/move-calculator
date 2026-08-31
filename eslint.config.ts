// @ts-ignore
import eslint from '@eslint/js'
import next from 'eslint-config-next'
import prettier from 'eslint-config-prettier'
import tslint from 'typescript-eslint'

export default tslint.config(
  {
    // specify all files that should be linted
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
  },
  {
    // skip certain directories or files
    ignores: [
      'pnpm-lock.yaml',
      'pnpm-workspace.yaml',
      'eslint.config.ts',
      'submodules',
      '**/.pnpm-store',
      '**/public',
      '**/dist',
      '**/.next',
      '**/.vercel',
      'submodules',
      '**/payload-types.ts',
      '**/payload-generated-schema.ts',
      '**/importMap.js',
      '**/next-env.d.ts',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        // NOTE at some point it makes sense to iterate over all projects programmatically
        project: [
          './actions/release-tag-action/tsconfig.json',
          './apps/web/tsconfig.json',
          './packages/*/tsconfig.json',
          './tsconfig.json',
        ],
      },
    },
  },
  eslint.configs.recommended,
  tslint.configs.recommended,
  {
    rules: {
      'no-console': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    files: ['scripts/**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['apps/web/src/**/*.{ts,tsx,js,jsx}'],
    extends: [...next],
    settings: {
      next: {
        rootDir: './apps/web/',
      },
    },
    rules: {
      'react-hooks/exhaustive-deps': 'error',
    },
  },
  prettier,
)
