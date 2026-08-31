#!/usr/bin/env node
// Payload writes each migration schema snapshot pretty-printed (tens of thousands of lines), which bloats PRs and
// breaks the size limit of Linear's review guide. Minifies snapshots to one line in place — either the files passed as
// arguments (lint-staged pre-commit) or every snapshot in the repo (`pnpm format`, which CI runs).
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

// Tracked plus new-but-unignored files, so a freshly generated snapshot is covered; submodules stay untouched.
const listSnapshots = () =>
  execFileSync(
    'git',
    ['-C', repoRoot, 'ls-files', '--cached', '--others', '--exclude-standard', '*/migrations/*.json'],
    {
      encoding: 'utf8',
    },
  )
    .split('\n')
    .filter(Boolean)
    .map((file) => join(repoRoot, file))

const files = process.argv.length > 2 ? process.argv.slice(2) : listSnapshots()

const minified = files.filter(existsSync).filter((file) => {
  const source = readFileSync(file, 'utf8')
  const output = JSON.stringify(JSON.parse(source)) + '\n'

  if (output === source) return false

  writeFileSync(file, output)
  return true
})

if (minified.length > 0) console.log(`Minified ${minified.length} migration schema snapshot(s).`)
