import { TransactionalOperations } from '@/lib/tx'

export const hasUsers = (localApi: TransactionalOperations) => async () => {
  const { totalDocs } = await localApi.count({ collection: 'users' })
  return totalDocs > 0
}
