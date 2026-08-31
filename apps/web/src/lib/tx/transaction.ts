import { isRedirectError } from '@/lib/next'
import { RunInTransactionFn, Transaction, TransactionId } from '@/lib/tx/types'
import { AsyncLocalStorage } from 'async_hooks'
import { BasePayload, PayloadRequest } from 'payload'

let transactionStore: AsyncLocalStorage<Transaction>

export function createRunInTransaction(payload: BasePayload): RunInTransactionFn {
  const store = getTransactionStore()
  return async (fn, options) => {
    const currentTransactionId = store.getStore()?.transactionId
    const optionTransactionId = options?.transactionId
    if (currentTransactionId && optionTransactionId && currentTransactionId === optionTransactionId) {
      // nothing to do here
      return await fn()
    }
    if (currentTransactionId && optionTransactionId !== currentTransactionId) {
      throw new Error(
        'A different transaction is already in progress. Nested transactions are currently not supported.',
      )
    }
    if (optionTransactionId) {
      // run in existing transaction. Do not handle commit or rollback
      return await store.run({ transactionId: optionTransactionId }, fn)
    }
    // run in new transaction
    const transactionId = (await payload.db.beginTransaction())!
    try {
      const transaction = { transactionId }
      const result = await store.run(transaction, fn)
      await payload.db.commitTransaction(transactionId)
      return result
    } catch (error) {
      // there might be more errors that should not be rolled back
      if (isRedirectError(error)) {
        await payload.db.commitTransaction(transactionId)
      } else {
        await payload.db.rollbackTransaction(transactionId)
      }
      throw error
    }
  }
}

export function withTransaction(req?: Partial<PayloadRequest>) {
  const transaction = currentTransaction()
  return transaction ? withTransactionId(transaction.transactionId, req) : req
}

export function currentTransaction(): Transaction | undefined {
  const transactionStore = getTransactionStore()
  return transactionStore.getStore()
}

function getTransactionStore(): AsyncLocalStorage<Transaction> {
  if (!transactionStore) {
    transactionStore = new AsyncLocalStorage<Transaction>()
  }
  return transactionStore
}

function withTransactionId(transactionId: TransactionId, req?: Partial<PayloadRequest>): Partial<PayloadRequest> {
  if (!req) {
    return { transactionID: transactionId }
  }
  return {
    transactionID: transactionId,
    // if req already has a transactionID, we keep it
    ...req,
  }
}
