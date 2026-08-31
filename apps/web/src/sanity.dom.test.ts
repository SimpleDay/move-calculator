import { expect, test } from 'vitest'

test('window should exist', () => {
  expect(typeof window).not.toEqual('undefined')
})
