import { expect, test } from 'vitest'

test('window should not exist', () => {
  expect(typeof window).toEqual('undefined')
})
