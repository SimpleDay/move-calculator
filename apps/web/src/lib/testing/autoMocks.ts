import { vi } from 'vitest'

vi.mock('react', async (actual) => {
  const originalReact: object = await actual()
  return { ...originalReact, cache: (fn: unknown) => fn }
})

vi.mock('next/cache', async (actual) => {
  const originalNextCache: object = await actual()
  return {
    ...originalNextCache,
    revalidateTag: () => {},
    revalidatePath: () => {},
  }
})

vi.mock('next/server', async (actual) => {
  const originalNextServer: object = await actual()
  return {
    ...originalNextServer,
    after: () => {},
  }
})
