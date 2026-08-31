import {
  BasePayload,
  type CollectionSlug,
  type JoinQuery,
  PayloadRequest,
  PopulateType,
  type RequestContext,
  SelectType,
  Sort,
  TransformCollectionWithSelect,
  type TypedLocale,
  Where,
} from 'payload'

// copied from payload and some fields have been stripped
type Options<TSlug extends CollectionSlug, TSelect extends SelectType> = {
  /**
   * the Collection slug to operate against.
   */
  collection: TSlug
  /**
   * [Context](https://payloadcms.com/docs/hooks/context), which will then be passed to `context` and `req.context`,
   * which can be read by hooks. Useful if you want to pass additional information to the hooks which
   * shouldn't be necessarily part of the document, for example a `triggerBeforeChange` option which can be read by the BeforeChange hook
   * to determine if it should run or not.
   */
  context?: RequestContext
  /**
   * The current population depth, used internally for relationships population.
   * @internal
   */
  currentDepth?: number
  /**
   * [Control auto-population](https://payloadcms.com/docs/queries/depth) of nested relationship and upload fields.
   */
  depth?: number
  /**
   * When set to `true`, errors will not be thrown.
   */
  disableErrors?: boolean
  /**
   * Whether the documents should be queried from the versions table/collection or not. [More](https://payloadcms.com/docs/versions/drafts#draft-api)
   */
  draft?: boolean
  /**
   * Specify a [fallback locale](https://payloadcms.com/docs/configuration/localization) to use for any returned documents.
   */
  fallbackLocale?: false | TypedLocale
  /**
   * Include info about the lock status to the result into all documents with fields: `_isLocked` and `_userEditing`
   */
  includeLockStatus?: boolean
  /**
   * The [Join Field Query](https://payloadcms.com/docs/fields/join#query-options).
   * Pass `false` to disable all join fields from the result.
   */
  joins?: JoinQuery<TSlug>
  /**
   * Specify [locale](https://payloadcms.com/docs/configuration/localization) for any returned documents.
   */
  locale?: 'all' | TypedLocale
  /**
   * Skip access control.
   * Set to `false` if you want to respect Access Control for the operation, for example when fetching data for the fron-end.
   * @default true
   */
  overrideAccess?: boolean
  /**
   * Specify [populate](https://payloadcms.com/docs/queries/select#populate) to control which fields to include to the result from populated documents.
   */
  populate?: PopulateType
  /**
   * The `PayloadRequest` object. You can pass it to thread the current [transaction](https://payloadcms.com/docs/database/transactions), user and locale to the operation.
   * Recommended to pass when using the Local API from hooks, as usually you want to execute the operation within the current transaction.
   */
  req?: Partial<PayloadRequest>
  /**
   * Specify [select](https://payloadcms.com/docs/queries/select) to control which fields to include to the result.
   */
  select?: TSelect
  /**
   * Opt-in to receiving hidden fields. By default, they are hidden from returned documents in accordance to your config.
   * @default false
   */
  showHiddenFields?: boolean
  /**
   * Sort the documents, can be a string or an array of strings
   * @example '-createdAt' // Sort DESC by createdAt
   * @example ['group', '-createdAt'] // sort by 2 fields, ASC group and DESC createdAt
   */
  sort?: Sort
  /**
   * If you set `overrideAccess` to `false`, you can pass a user to use against the access control checks.
   */
  user?: Document
  /**
   * A filter [query](https://payloadcms.com/docs/queries/overview)
   */
  where?: Where
}

export type CollectionFindOne = <TSlug extends CollectionSlug, TSelect extends SelectType>(
  options: Options<TSlug, TSelect>,
) => Promise<TransformCollectionWithSelect<TSlug, TSelect> | null>

export type TransactionalOperations = Readonly<{
  count: BasePayload['count']
  countGlobalVersions: BasePayload['countGlobalVersions']
  countVersions: BasePayload['countVersions']
  create: BasePayload['create']
  delete: BasePayload['delete']
  duplicate: BasePayload['duplicate']
  find: BasePayload['find']
  findOne: CollectionFindOne
  findDistinct: BasePayload['findDistinct']
  findByID: BasePayload['findByID']
  findGlobal: BasePayload['findGlobal']
  findGlobalVersionByID: BasePayload['findGlobalVersionByID']
  findGlobalVersions: BasePayload['findGlobalVersions']
  findVersionByID: BasePayload['findVersionByID']
  findVersions: BasePayload['findVersions']
  restoreGlobalVersion: BasePayload['restoreGlobalVersion']
  restoreVersion: BasePayload['restoreVersion']
  unlock: BasePayload['unlock']
  updateGlobal: BasePayload['updateGlobal']
  update: BasePayload['update']
}>
