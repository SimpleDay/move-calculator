---
alwaysApply: false
paths: '**/package.json'
description: 'package.json script naming: colon namespaces, bare verb + variants, standard verbs, turbo.json sync'
---

# package.json Scripts

## Separator

Use `:` to namespace variants. Never use `-`.

```jsonc
// ✅
"check:types": "tsc --noEmit"
"generate:types": "payload generate:types"
"dev:android": "expo run:android --device"

// ❌
"check-types": "tsc --noEmit"
"generate-types": "payload generate:types"
```

**Exception** — scripts whose name is mandated by an external tool keep their original name, even if it uses hyphens or doesn't fit a verb namespace. Examples: `eas-build-post-install` (EAS hook), npm/pnpm lifecycle scripts like `prepare`, `preinstall`, `postinstall`.

## Bare verb and variants coexist

A bare verb is the **default** action. `:variant`s are specific cases. Both can be defined side by side.

```jsonc
// apps/mobile
"dev": "expo start",
"dev:android": "expo run:android --device",
"dev:ios": "expo run:ios --device",
"dev:web": "expo start --web",
```

This lets `pnpm dev` (and `turbo watch dev`) pick up the default, while `pnpm dev:ios` runs a specific path.

- If a verb has only one form, define just the bare verb: `build` (web), `test`, `lint`, `format`, `migrate`.
- If there is a sensible default plus alternatives, define both: bare + variants (`dev`, `dev:*`).
- If there is no sensible default, define variants only: `check:types`/`check:doctor`/`check:submodules`, `generate:*`, `render:*`, `build:apk`/`build:aab`/`build:ipa`.

Keep nesting to two levels. If you reach for a third (`eas:local:apk`), the verb is doing two jobs — pick a verb that expresses the intent, not the tool. Local artifact builds → `build:*`; cloud-distribution builds via EAS → `eas:*`.

## Standard verbs

These are the verbs already in use in this repo. The list is **not exhaustive** — add new ones when they express a distinct intent (e.g. `log:*` was added for device log streaming).

| Verb         | Purpose                                                                    |
| ------------ | -------------------------------------------------------------------------- |
| `dev`        | Development (watch, persistent).                                           |
| `generate:*` | Produce files that get committed (types, schema, import map, native dirs). |
| `build`      | Production build (`build`, `build:apk`, `build:aab`, `build:ipa`).         |
| `check:*`    | Read-only validation (`check:types`, `check:doctor`, `check:submodules`).  |
| `test`       | Tests.                                                                     |
| `migrate`    | Apply DB migrations.                                                       |
| `render:*`   | Produce deployment output (`render:pages`, `render:sitemap`).              |
| `start`      | Start the production server.                                               |
| `lint`       | Lint, including sub-targets like `lint:commit`.                            |
| `format`     | Format.                                                                    |
| `eas:*`      | Cloud build via EAS, auto-submit to store (`eas:ios`, `eas:android`).      |
| `log:*`      | Stream device logs (`log:ios`, `log:android`).                             |

## Workspace shortcuts (root only)

The root `package.json` may alias `pnpm --filter <pkg>` for a workspace package using the package name. This is the one place where a non-verb root script is allowed.

```jsonc
"web": "pnpm --filter web",
"mobile": "pnpm --filter mobile",
```

Lets you write `pnpm web build` instead of `pnpm --filter web build`.

## Casing

Lowercase only. No camelCase, no PascalCase.

## Keep `turbo.json` in sync

Turbo task names must match the script names verbatim — colons included. `turbo run check:types` only runs scripts literally named `check:types`. A mismatch silently no-ops the task (`"command": "<NONEXISTENT>"`).
