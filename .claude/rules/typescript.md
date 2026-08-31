# TypeScript

## Types, not interfaces

Prefer `type` over `interface`.

## Union types, not enums

Use `as const` arrays/objects + indexed access:

```ts
export const vehicleStates = ['operational', 'absentees'] as const
export type VehicleState = (typeof vehicleStates)[number]
// 'operational' | 'absentees'

export const permissions = { read: 'r', write: 'w', execute: 'x' } as const
export type Permission = (typeof permissions)[keyof typeof permissions]
// 'r' | 'w' | 'x'
```

## File naming

Name files after what they export. Avoid generic names that repeat across the project (`Component.tsx`, `index.ts`, `config.ts`) — they hurt navigation.

- **React components** → `UpperCamelCase.tsx` (e.g. `ProductHero.tsx`, `CallToAction.tsx`). No hyphens, no dotted suffixes.
- **Everything else** → `lowerCamelCase.ts` (e.g. `saveProductFormAction.ts`, `getURL.ts`). No hyphens, no dotted suffixes.
- **Exceptions**: framework-mandated config files (`next.config.js`, `payload.config.ts`) and generated files (`payload-types.ts`, shadcn components).

## `index.ts` / `index.tsx`

Optional. If present, **re-exports only** — no logic.

Exception: a component in its own folder (`components/Foo/index.tsx`) may hold the component itself, so imports stay `@/components/Foo`. The folder name carries the component name.

## Exported identifier naming

- React components → `UpperCamelCase`
- Types / type aliases → `UpperCamelCase`
- Everything else (constants, functions, vars) → `lowerCamelCase`

## No default exports

Use named exports. Default exports break IDE auto-import.
