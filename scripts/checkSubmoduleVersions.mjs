#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

const isCheckedOut = (path) => {
  try {
    return readdirSync(join(repoRoot, path)).length > 0
  } catch {
    return false
  }
}

const expectations = [
  { submodule: 'submodules/better-auth', pkg: 'apps/web/package.json', dep: 'better-auth' },
  { submodule: 'submodules/payload', pkg: 'apps/web/package.json', dep: 'payload' },
]

const stripRange = (v) => v.replace(/^[\^~]/, '')

const describe = (path) =>
  execFileSync('git', ['-C', path, 'describe', '--tags', '--exact-match', 'HEAD'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()

const present = expectations.filter(({ submodule }) => isCheckedOut(submodule))

if (present.length === 0) {
  console.log('No submodules checked out — skipping version check.')
  process.exit(0)
}

const errors = []

for (const { submodule, pkg, dep } of present) {
  const manifest = JSON.parse(readFileSync(join(repoRoot, pkg), 'utf8'))
  const declared = manifest.dependencies?.[dep] ?? manifest.devDependencies?.[dep]

  if (!declared) {
    errors.push(`${dep}: not found in ${pkg}`)
    continue
  }

  const expected = `v${stripRange(declared)}`

  let actual
  try {
    actual = describe(join(repoRoot, submodule))
  } catch {
    errors.push(`${submodule}: HEAD is not at a tagged release (expected ${expected})`)
    continue
  }

  if (actual !== expected) {
    errors.push(`${submodule}: HEAD is at ${actual}, expected ${expected} (from ${pkg} → ${dep})`)
  }
}

if (errors.length > 0) {
  console.error('Submodule version drift detected:')

  for (const err of errors) console.error(`  - ${err}`)

  console.error('\nFix: cd into the submodule and `git checkout v<version>`, then commit the pointer update.')
  process.exit(1)
}

console.log('Submodules match declared package versions.')
