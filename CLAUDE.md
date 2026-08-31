## Verification

After completing a task, run these commands to validate the changes:

```sh
pnpm turbo run check:types  # typecheck
pnpm lint                   # lint (with autofix)
pnpm format                 # format (with autowrite)
pnpm test                   # tests
```

## Zuegelofferte Domain Rules

- Pricing is a pure, deterministic, versioned domain calculation. AI may extract or explain inputs but must never invent or directly set a price.
- Every tenant-owned entity, query, job, cache key, and storage object has an explicit tenant scope. Derive tenant access on the server; never trust a client-supplied tenant ID.
- Customer-facing prices are provisional until a company confirms a specific immutable quote revision.
- AI output is untrusted input: use schema-validated structured output or tools, authorize every mutation server-side, and persist only canonical domain data.
- Keep provider code behind small adapters. Domain and business code must not import Google, Maps, storage, email, or PDF SDKs directly.
- Keep the public quote flow usable without AI. Missing provider credentials must disable AI assistance cleanly, not prevent deterministic development or calculation.
- Update `docs/02-spec.md` when behavior changes and `docs/03-technical-plan.md` when an architectural decision changes.

## Pull Requests

PR descriptions are in **English**, describe the **end state** (not the session history or how you got there — that's in the commits), and stay skimmable in ~15 seconds. Use `#` headings — `What` (1–2 sentences on what the change does, plus the damage radius: how far-reaching the necessary changes were and why), `Why` (≤3 sentences on the problem it solves), `Verification` (checkboxes only, one short line each — the check, not a description of what it proved). List the **outcome, not each edited file/function** (that's the diff); ≤3 bullets per section, one line per bullet, no parentheticals or nested clauses. Don't link the Linear ticket — Linear matches the ticket ID from the branch/PR. Don't append a "🤖 Generated with Claude Code" footer or any other attribution line.

## Testing

Vitest (`apps/web/vitest.config.ts`) runs three projects, split by filename suffix. The suffix picks the environment **and** the cost — choosing wrong doesn't fail, it silently makes the test slow:

- `*.unit.test.ts` — **the default.** Plain `node` env, multi-threaded, no database. For anything that doesn't touch Payload or Postgres (pure functions, URL/string parsing, classification). Runs in milliseconds.
- `*.dom.test.ts` — `jsdom` env, for React components and browser APIs. No database.
- `*.node.test.ts` — **only for tests that hit Payload/Postgres.** This project boots a Postgres testcontainer (`setupPostgres.ts`, needs Docker) and runs an `afterEach` that truncates the **entire** schema after every test, single-threaded. That teardown is a per-test-case tax — a misfiled pure-logic test here costs seconds for nothing.

**Rule: a test earns `.node.test.ts` only if it imports `getApp`/`getPayload` or otherwise queries the DB. Everything else is `.unit.test.ts`.**

Only `*.node.test.ts` needs Docker — CI provides it; locally those are skipped without Docker, while `*.unit.test.ts` / `*.dom.test.ts` run anywhere.

## Generated Files

Payload's generated artifacts must be committed alongside the source they come from; CI regenerates them and fails on any diff.

- **Migration schema snapshots stay minified.** `scripts/minifyMigrations.mjs` collapses `migrations/*.json` to one line, on commit via lint-staged and inside `pnpm format`, which CI runs. `.prettierignore` keeps Prettier from re-expanding them. Never pretty-print one back.
- **`.gitattributes` marks generated files `linguist-generated`**, so they collapse in review. `payload-types.ts` is deliberately excluded and stays reviewable.

## Source Reference

When you need to understand how Better Auth or Payload work — their APIs, internals, types, or conventions — read the source code in the git submodules:

- `submodules/better-auth/` — Better Auth source
- `submodules/payload/` — Payload source

Use these instead of `node_modules/`. The submodules contain the full repository (docs, tests, examples) which gives much richer context than the published package artifacts in node_modules.
