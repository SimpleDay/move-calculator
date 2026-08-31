import { coerceDateFields } from '@/lib/auth/adapter/coerceDateFields'
import { CollectionConfig } from 'payload'
import { expect, test } from 'vitest'

const collectionConfig: CollectionConfig = {
  slug: 'test',
  fields: [
    { name: 'expiresAt', type: 'date' },
    { name: 'startsAt', type: 'date' },
    { name: 'name', type: 'text' },
  ],
}

test('coerces ISO string values on date-typed fields to Date instances', () => {
  const iso = '2026-01-15T10:30:00.000Z'
  const doc: Record<string, unknown> = { expiresAt: iso }

  const result = coerceDateFields(doc, collectionConfig)

  expect(result.expiresAt).toBeInstanceOf(Date)
  expect((result.expiresAt as Date).toISOString()).toBe(iso)
})

test('leaves Date instances on date-typed fields unchanged', () => {
  const date = new Date('2026-01-15T10:30:00.000Z')
  const doc: Record<string, unknown> = { expiresAt: date }

  const result = coerceDateFields(doc, collectionConfig)

  expect(result.expiresAt).toBe(date)
})

test('leaves string values on non-date fields unchanged', () => {
  const doc: Record<string, unknown> = { name: '2026-01-15T10:30:00.000Z' }

  const result = coerceDateFields(doc, collectionConfig)

  expect(result.name).toBe('2026-01-15T10:30:00.000Z')
})

test('coerces multiple date-typed fields independently', () => {
  const doc: Record<string, unknown> = {
    expiresAt: '2026-01-15T10:30:00.000Z',
    startsAt: '2026-01-10T08:00:00.000Z',
  }

  const result = coerceDateFields(doc, collectionConfig)

  expect(result.expiresAt).toBeInstanceOf(Date)
  expect(result.startsAt).toBeInstanceOf(Date)
})

test('coerces createdAt and updatedAt by default (timestamps enabled)', () => {
  const doc: Record<string, unknown> = {
    createdAt: '2026-01-15T10:30:00.000Z',
    updatedAt: '2026-01-16T10:30:00.000Z',
  }

  const result = coerceDateFields(doc, collectionConfig)

  expect(result.createdAt).toBeInstanceOf(Date)
  expect(result.updatedAt).toBeInstanceOf(Date)
})

test('does not coerce createdAt and updatedAt when timestamps are disabled', () => {
  const noTimestamps: CollectionConfig = { ...collectionConfig, timestamps: false }
  const doc: Record<string, unknown> = {
    createdAt: '2026-01-15T10:30:00.000Z',
    updatedAt: '2026-01-16T10:30:00.000Z',
  }

  const result = coerceDateFields(doc, noTimestamps)

  expect(result.createdAt).toBe('2026-01-15T10:30:00.000Z')
  expect(result.updatedAt).toBe('2026-01-16T10:30:00.000Z')
})

test('leaves null values on date-typed fields unchanged', () => {
  const doc: Record<string, unknown> = { expiresAt: null }

  const result = coerceDateFields(doc, collectionConfig)

  expect(result.expiresAt).toBeNull()
})

test('leaves undefined values on date-typed fields unchanged', () => {
  const doc: Record<string, unknown> = { expiresAt: undefined }

  const result = coerceDateFields(doc, collectionConfig)

  expect(result.expiresAt).toBeUndefined()
})

test('returns null when given null', () => {
  expect(coerceDateFields(null, collectionConfig)).toBeNull()
})

test('returns undefined when given undefined', () => {
  expect(coerceDateFields(undefined, collectionConfig)).toBeUndefined()
})

test('mutates and returns the same object reference', () => {
  const doc: Record<string, unknown> = { expiresAt: '2026-01-15T10:30:00.000Z' }

  const result = coerceDateFields(doc, collectionConfig)

  expect(result).toBe(doc)
})
