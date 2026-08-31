import { di } from '@/di'
import { createInject } from '@/lib/di/createInject'

export type App = Awaited<ReturnType<typeof getApp>>

export async function getApp() {
  const inject = await createInject()
  const payload = inject(di.payload)
  const localApi = inject(di.localApi)
  const runInTransaction = inject(di.transactionRunner)
  return {
    ...localApi,
    payload,
    inject,
    runInTransaction,
  }
}
