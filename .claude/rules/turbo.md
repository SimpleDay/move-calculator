---
alwaysApply: false
paths: 'turbo.json'
description: 'turbo.json conventions: what belongs here, env mode loose, build phase dependency layers'
---

# turbo.json

Script naming and `turbo.json` sync live in [package-json.md](./package-json.md). This file covers what belongs in `turbo.json` and the build-phase model.

## What belongs in `turbo.json`

A task is defined here if at least one of these applies:

- **Cacheable.** Its artifacts are a deterministic function of source — e.g. `build`, `check:types`.
- **Cross-package orchestration.** It depends on other packages' tasks via `^build` — e.g. `generate:types`, `migrate`.
- **Has turbo dependents.** Another turbo task depends on it, so its dep graph must be expressed — e.g. `migrate` is depended on by `render:pages`.
- **Persistent process** coordinated through Turbo's `tui` — `dev`.

Everything else stays as a plain package.json script, invoked directly via pnpm. In particular:

- Root-level globbing scripts that read the whole repo (`lint`, `format`).
- Package-local one-shots with no workspace dependencies (`dev:ios`, `dev:email`, `build:apk`, `eas:ios`, `log:android`, `check:doctor`, `start`).
- Lifecycle scripts owned by other tools (`prepare`, `eas-build-post-install`).

When in doubt, leave it out. Adding to `turbo.json` later is cheap; removing churns CI and developer muscle memory.

## Env mode: `loose`

Use `"envMode": "loose"`.

The invariant we hold is **cacheable tasks do not depend on env vars** (see below). Given that, `strict` buys nothing for cache correctness — it would only force us to enumerate every env var that uncached tasks (`render:*`, `migrate`, `generate:migration`) read at runtime, which is busywork without payoff. `loose` keeps those env reads ergonomic.

## Caching must not depend on env vars

Hashes ignore env vars unless declared in `env:`/`globalEnv:`. Do not declare any — `DATABASE_URL` and friends differ across machines/environments and would shatter the cache without changing the artifact. If a task's output legitimately depends on an env var, it isn't cacheable: set `"cache": false`.

## Never cache `test`

`test` is `"cache": false`. Running tests is the point — a cache hit gives no confidence.

## Build phase concept

```
^build  →  generate:*  →  build / check:types / test  →  migrate  →  render:*
```

| Task                                | `dependsOn`                                                   |
| ----------------------------------- | ------------------------------------------------------------- |
| `generate:importmap\|types\|schema` | `['^build']`                                                  |
| `generate`                          | `['generate:importmap', 'generate:types', 'generate:schema']` |
| `build`                             | `['^build', 'generate']`                                      |
| `check:types`                       | `['^build', 'generate']`                                      |
| `test`                              | `['^build', 'generate']`                                      |
| `migrate`                           | `['build']`                                                   |
| `render:pages`                      | `['build', 'migrate']`                                        |
| `render:sitemap`                    | `['render:pages']`                                            |

`migrate` depends on the same-package `build`, not just the generates. The `.next` bundle isn't a runtime prereq for `payload migrate` — this is a **policy gate**: don't mutate the database unless the code compiles. The `render:pages → migrate → build` chain inherits this.

### Generates outside the build gate

`generate:migration` and `generate:native` produce developer artifacts (migration files, `ios/`/`android/` dirs), not build inputs. They still `dependsOn: ['^build']` so workspace deps resolve, but they must **not** appear in `build`'s `dependsOn` — otherwise every build mutates the working tree.
