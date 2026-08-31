---
alwaysApply: false
paths: apps/web/**
description: 'Next.js conventions: App Router scope, server actions, SSR pitfalls'
---

# Next.js

## App Router

`src/app` contains only App Router convention files. Components and utilities live elsewhere.

## Server Actions

- Don't overuse — for data reads in server components, a plain function is enough. Each server action becomes an endpoint in every route it's imported into.
- Location: `actions/` directory, usually inside a feature.
- Treat them as public endpoints: runtime-validate inputs and outputs.
- Auth: server actions are unauthenticated by default. Don't call APIs that skip access control (e.g. `payload.create`) without an explicit auth check.

## AuthN & AuthZ

Every route handler, server action, page, and layout (server components that fetch data or render gated UI) must check authentication and authorization before doing work. Public endpoints and pages must be explicitly called out.

Middleware should optimistically check authN state and redirect unauthenticated requests. It is not a substitute for per-route checks — treat it as a UX shortcut, not a security boundary.

## Client components and `window`

Client components also render on the server. Guard `window` access. For libraries that touch `window` unconditionally, wrap them in a dynamic import with `ssr: false`.
