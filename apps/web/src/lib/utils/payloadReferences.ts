import { Config } from '@/payload-types'
import { TypedCollection } from 'payload'

type Ref = Config['db']['defaultIDType']

export function isObject<T>(obj: T | Ref): obj is T {
  return typeof obj === 'object'
}

export function assertObject<T>(obj: T | Ref): asserts obj is T {
  if (!isObject(obj)) {
    throw new Error('Expected object')
  }
}

export function asObject<T>(obj: T | Ref): T {
  assertObject(obj)
  return obj
}

export function withObject<T, R>(obj: T | Ref, fn: (obj: NonNullable<T>) => R): R
export function withObject<T, R>(obj: T | Ref | null | undefined, fn: (obj: NonNullable<T>) => R): R | undefined {
  if (obj == null) {
    return undefined
  }

  assertObject(obj)
  return fn(obj)
}

export function referenceId<T extends { id: Ref }>(obj: T | Ref): Ref {
  return isObject(obj) ? obj.id : obj
}

type PolymorphicAssociation<T extends keyof Config['collections']> = {
  relationTo: T
  value: Ref | TypedCollection[T]
}

export function polyReferenceId<T extends keyof Config['collections']>(obj: PolymorphicAssociation<T>): Ref {
  return referenceId(obj.value)
}
