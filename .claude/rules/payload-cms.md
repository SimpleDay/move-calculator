---
alwaysApply: false
paths: apps/web/**
description: 'Payload CMS conventions: collections, blocks, globals, business layer, transactions'
---

# Payload CMS

## Collections

- Name: `xxxCollection` (e.g. `mediaCollection`, `userCollection`).
- Define as `const xxxCollection = { slug: 'xxx', ... } as const satisfies CollectionConfig`. Do **not** annotate `: CollectionConfig` — `as const satisfies` keeps `slug` literal so it's assignable to `CollectionSlug`.

## Blocks

Three parts:

- Config → `xxxBlock` (e.g. `mediaBlock`) in `xxxBlock.ts`
- Generated interface → `XxxBlockData`
- React component → `XxxBlockComponent` in `XxxBlockComponent.tsx`

The `Component` suffix on the React component disambiguates it from the config.

## Globals

- Name: `xxxGlobal` (e.g. `headerGlobal`).

## Directory structure

Based on [devedis-payload-template](https://github.com/devedis/devedis-payload-template):

- `src/app` — Next.js App Router
- `src/features/<feature>` — standalone features (do **not** nest). Common subfolders: `components`, `blocks`, `collection`, `business`, `actions`, `globals`.
- `src/components` — reusable components
- `src/lib` — reusable code, organized by topic

## Business layer

All data access goes through the feature's `business/` functions — never call Payload's local API (`payload.find`, `payload.create`, `payload.update`, etc.) directly from routes, actions, components, or other features. The business layer is the single entry point for reads and writes on a feature's entities.

This applies to:

- **Within a feature** — routes, server actions, hooks, and components call `business/` instead of Payload directly.
- **Cross-feature** — when feature A needs feature B's entities, it calls B's `business/` functions.

Enables composite ops, validation, audit logs, caching, and a stable seam for swapping the data source.

## Transactions

`getApp()` returns an `app` whose `find`, `findByID`, `create`, `update`, `delete`, `findGlobal`, `updateGlobal`, etc. are the **transaction-aware** wrappers from `src/lib/tx/operations`. They auto-join the ambient transaction via `AsyncLocalStorage`.

- For writes — and for reads that must be consistent with surrounding writes — call data ops on `app` directly (e.g. `app.find(...)`, `app.findByID(...)`). Name the variable `app` to reflect that it's the transactional wrapper. Wrap the flow in `app.runInTransaction(async () => { ... })`. Server actions built with `serverActionBuilder` are wrapped automatically; route handlers and standalone scripts wrap themselves.
- For standalone reads (no surrounding write, no consistency requirement), the raw `payload` from `getPayload({ config })` or `app.payload` is fine — transactionality buys nothing for a single read.

### Inside Payload hooks / field validators

Hooks and validators receive a `req: PayloadRequest` that carries the active `transactionID`. Two cases:

**1. Direct Payload calls inside the hook** — use `req.payload.*` and pass `req`:

```ts
await req.payload.find({ collection: 'users', where: { ... }, req })
```

The `req` argument is what propagates the transaction. Omitting it silently breaks transactional consistency. No `getApp()` needed.

**2. Delegating to services that use the `app.*` tx wrappers** — `req` does **not** propagate to them. The wrappers read the transaction from `AsyncLocalStorage`, which is only populated inside `app.runInTransaction(...)`. So you must re-enter the existing transaction explicitly:

```ts
const { inject, runInTransaction } = await getApp()
await runInTransaction(
  async () => {
    const svc = inject(di.someService)
    await svc.doStuff(...)
  },
  { transactionId: await req.transactionID },
)
```

This is **not** starting a new transaction — `transactionId` joins the one `req` is already in, so reads/writes inside the lambda stay consistent with the hook's outer transaction.
