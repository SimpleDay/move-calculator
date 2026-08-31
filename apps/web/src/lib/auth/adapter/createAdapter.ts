import {
  countOperation,
  createOperation,
  deleteManyOperation,
  deleteOneOperation,
  findManyOperation,
  findOneOperation,
  updateManyOperation,
  updateOperation,
} from '@/lib/auth/adapter/operations'
import { TransactionalOperations } from '@/lib/tx'
import { createAdapterFactory } from 'better-auth/adapters'
import { BasePayload } from 'payload'

export const createAdapter = (payload: BasePayload, txOperations: TransactionalOperations) =>
  createAdapterFactory({
    config: {
      adapterId: 'payload',
      disableIdGeneration: true,
      supportsJSON: true,
      supportsDates: true,
      supportsBooleans: true,
      supportsNumericIds: true,
    },
    adapter: () => ({
      create: createOperation(payload, txOperations),
      findOne: findOneOperation(payload, txOperations),
      findMany: findManyOperation(payload, txOperations),
      count: countOperation(payload, txOperations),
      update: updateOperation(payload, txOperations),
      updateMany: updateManyOperation(payload, txOperations),
      delete: deleteOneOperation(payload, txOperations),
      deleteMany: deleteManyOperation(payload, txOperations),
    }),
  })
