import { appModules } from '@/appModules'
import { TypeSymbol } from '@/lib/di/typeSymbol'
import { Container } from 'inversify'

export type InjectFn = <T>(symbol: TypeSymbol<T>) => T

// will be undefined everytime module is imported (hot reload potentially happened)
let container: Promise<Container> | undefined

export async function createInject(): Promise<InjectFn> {
  const container = await getOrCreateContainer()
  return (symbol) => container.get(symbol)
}

export async function getOrCreateContainer() {
  if (container) {
    // container is already initialized, no hot reloading has happened since the last time
    return await container
  }
  const containerInstance =
    globalThis.__container ?? (globalThis.__container = new Container({ defaultScope: 'Singleton' }))
  // serialize initializations on globalThis: the bundler may evaluate this module
  // more than once (one copy per chunk), and concurrent unbindAll/load calls on the
  // shared container would otherwise interleave and register bindings twice
  const previousInit = globalThis.__containerInit ?? Promise.resolve(containerInstance)
  container = globalThis.__containerInit = previousInit.then(() => initContainer(containerInstance))
  return await container
}

async function initContainer(container: Container) {
  await container.unbindAll()
  await container.load(...appModules)
  return container
}
