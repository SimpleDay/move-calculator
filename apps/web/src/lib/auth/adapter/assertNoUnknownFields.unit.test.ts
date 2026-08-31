import { assertNoUnknownFields } from '@/lib/auth/adapter/assertNoUnknownFields'
import { CollectionConfig } from 'payload'
import { expect, test } from 'vitest'

const collectionConfig: CollectionConfig = {
  slug: 'test',
  fields: [
    { name: 'knownField1', type: 'text' },
    { name: 'knownField2', type: 'text' },
  ],
}

test('fails given an unknown field', () => {
  const dataWithUnknownField = {
    knownField1: 'value1',
    unknownField: 'value2',
  }

  expect(() => assertNoUnknownFields({ modelName: 'model', data: dataWithUnknownField, collectionConfig })).toThrow()
})

test('returns without error given all known fields', () => {
  const dataWithKnownFields = {
    knownField1: 'value1',
    knownField2: 'value2',
  }

  expect(() => assertNoUnknownFields({ modelName: 'model', data: dataWithKnownFields, collectionConfig })).not.toThrow()
})

test('returns without error given some known fields', () => {
  const dataWithSomeKnownFields = {
    knownField1: 'value1',
  }

  expect(() =>
    assertNoUnknownFields({ modelName: 'model', data: dataWithSomeKnownFields, collectionConfig }),
  ).not.toThrow()
})
