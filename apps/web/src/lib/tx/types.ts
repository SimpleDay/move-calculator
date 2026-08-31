import { PayloadRequest } from 'payload'

export type TransactionId = string | number

export type Transaction = Readonly<{
  transactionId: TransactionId
}>

type TransactionOptions = {
  transactionId?: TransactionId
}

export type RunInTransactionFn = <T>(fn: () => Promise<T>, options?: TransactionOptions) => Promise<T>

export type Transactional = Readonly<{
  runInTransaction: RunInTransactionFn
  withTransaction: (req?: Partial<PayloadRequest>) => Partial<PayloadRequest> | undefined
  currentTransaction: () => Transaction | undefined
}>
