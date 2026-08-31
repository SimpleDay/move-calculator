import { createTransactionalCount } from '@/lib/tx/operations/createTransactionalCount'
import { createTransactionalCountGlobalVersions } from '@/lib/tx/operations/createTransactionalCountGlobalVersions'
import { createTransactionalCountVersions } from '@/lib/tx/operations/createTransactionalCountVersions'
import { createTransactionalCreate } from '@/lib/tx/operations/createTransactionalCreate'
import { createTransactionalDelete } from '@/lib/tx/operations/createTransactionalDelete'
import { createTransactionalDuplicate } from '@/lib/tx/operations/createTransactionalDuplicate'
import { createTransactionalFind } from '@/lib/tx/operations/createTransactionalFind'
import { createTransactionalFindByID } from '@/lib/tx/operations/createTransactionalFindByID'
import { createTransactionalFindGlobal } from '@/lib/tx/operations/createTransactionalFindGlobal'
import { createTransactionalFindGlobalVersionByID } from '@/lib/tx/operations/createTransactionalFindGlobalVersionByID'
import { createTransactionalFindGlobalVersions } from '@/lib/tx/operations/createTransactionalFindGlobalVersions'
import { createTransactionalFindOne } from '@/lib/tx/operations/createTransactionalFindOne'
import { createTransactionalFindVersionByID } from '@/lib/tx/operations/createTransactionalFindVersionByID'
import { createTransactionalFindVersions } from '@/lib/tx/operations/createTransactionalFindVersions'
import { createTransactionalRestoreGlobalVersion } from '@/lib/tx/operations/createTransactionalRestoreGlobalVersion'
import { createTransactionalRestoreVersion } from '@/lib/tx/operations/createTransactionalRestoreVersion'
import { createTransactionalUnlock } from '@/lib/tx/operations/createTransactionalUnlock'
import { createTransactionalUpdate } from '@/lib/tx/operations/createTransactionalUpdate'
import { createTransactionalUpdateGlobal } from '@/lib/tx/operations/createTransactionalUpdateGlobal'
import { TransactionalOperations } from '@/lib/tx/operations/types'
import { BasePayload } from 'payload'
import { createTransactionalFindDistinct } from './createTransactionalFindDistinct'

export function createTransactionalOperations(payload: BasePayload): TransactionalOperations {
  return {
    count: createTransactionalCount(payload),
    countVersions: createTransactionalCountVersions(payload),
    countGlobalVersions: createTransactionalCountGlobalVersions(payload),
    create: createTransactionalCreate(payload),
    delete: createTransactionalDelete(payload),
    duplicate: createTransactionalDuplicate(payload),
    find: createTransactionalFind(payload),
    findOne: createTransactionalFindOne(payload),
    findDistinct: createTransactionalFindDistinct(payload),
    findByID: createTransactionalFindByID(payload),
    findGlobal: createTransactionalFindGlobal(payload),
    findGlobalVersionByID: createTransactionalFindGlobalVersionByID(payload),
    findGlobalVersions: createTransactionalFindGlobalVersions(payload),
    findVersionByID: createTransactionalFindVersionByID(payload),
    findVersions: createTransactionalFindVersions(payload),
    restoreGlobalVersion: createTransactionalRestoreGlobalVersion(payload),
    restoreVersion: createTransactionalRestoreVersion(payload),
    unlock: createTransactionalUnlock(payload),
    updateGlobal: createTransactionalUpdateGlobal(payload),
    update: createTransactionalUpdate(payload),
  }
}
