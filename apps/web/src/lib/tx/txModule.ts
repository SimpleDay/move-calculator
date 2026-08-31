import { di } from '@/di'
import { createTransactionalOperations } from '@/lib/tx/operations'
import { createRunInTransaction } from '@/lib/tx/transaction'
import { ContainerModule } from 'inversify'

export const txModule = new ContainerModule((options) => {
  options.bind(di.localApi).toResolvedValue(createTransactionalOperations, [di.payload])
  options.bind(di.transactionRunner).toResolvedValue(createRunInTransaction, [di.payload])
})
