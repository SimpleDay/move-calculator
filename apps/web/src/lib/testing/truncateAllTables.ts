import { getApp } from '@/getApp'
import { migrations } from '@/migrations'
import { sql } from '@payloadcms/db-postgres/drizzle'
import { PgTable } from '@payloadcms/db-postgres/drizzle/pg-core'
import { BasePayload, Migration } from 'payload'
import { afterEach, beforeAll } from 'vitest'

const excludeTruncate = ['payload_migrations']
let payload: BasePayload

beforeAll(async () => {
  payload = (await getApp()).payload
  await payload.db.migrate({ migrations: migrations as Migration[] })
})

afterEach(async () => {
  await truncateAllTables(payload)
})

async function truncateAllTables({ db }: BasePayload) {
  const tables = Object.entries(db.schema)
    .filter(([key, subject]) => subject instanceof PgTable && !excludeTruncate.includes(key))
    .map(([key]) => key)
  await db.drizzle.execute(sql.raw(`truncate table ${tables.join(', ')} cascade;`))
}
