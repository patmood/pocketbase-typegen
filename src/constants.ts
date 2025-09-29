export const EXPORT_COMMENT = `/**
* This file was @generated using pocketbase-typegen
*/`
export const IMPORTS = `import type PocketBase from 'pocketbase'
import type { RecordService, RecordOptions, RecordListOptions, ListResult } from 'pocketbase'`
export const RECORD_TYPE_COMMENT = `// Record types for each collection`
export const RESPONSE_TYPE_COMMENT = `// Response types include system fields and match responses from the PocketBase API`
export const ALL_RECORD_RESPONSE_COMMENT = `// Types containing all Records and Responses, useful for creating typing helper functions`
export const TYPED_POCKETBASE_COMMENT = `// Type for usage with type asserted PocketBase instance\n// https://github.com/pocketbase/js-sdk#specify-typescript-definitions`
export const DATE_STRING_TYPE_NAME = `IsoDateString`
export const RECORD_ID_STRING_NAME = `RecordIdString`
export const HTML_STRING_NAME = `HTMLString`
export const GEOPOINT_TYPE_NAME = `GeoPoint`
export const ALIAS_TYPE_DEFINITIONS = `// Alias types for improved usability
export type ${DATE_STRING_TYPE_NAME} = string
export type ${RECORD_ID_STRING_NAME} = string
export type ${HTML_STRING_NAME} = string`

export const BASE_SYSTEM_FIELDS_DEFINITION = `// System fields
export type BaseSystemFields<T = unknown> = {
\tid: ${RECORD_ID_STRING_NAME}
\tcollectionId: string
\tcollectionName: Collections
\tcreated: ${DATE_STRING_TYPE_NAME}
\tupdated: ${DATE_STRING_TYPE_NAME}
} & (T extends never ? never : { expand: T })`

export const AUTH_SYSTEM_FIELDS_DEFINITION = `export type AuthSystemFields<T = unknown> = {
\temail: string
\temailVisibility: boolean
\tusername: string
\tverified: boolean
} & BaseSystemFields<T>`

export const GEOPOINT_TYPE_DEFINITION = `export type ${GEOPOINT_TYPE_NAME} = {
\tlon: number
\tlat: number
}`

export const ENHANCED_RECORD_SERVICE_DEFINITION = `// Enhanced RecordService type with dynamic expand typing
interface EnhancedRecordService<TCollection extends Collections> {
	getOne<TExpand extends string = ''>(
		id: string,
		options?: Omit<RecordOptions, 'expand'> & { expand?: TExpand },
	): Promise<GetResponseType<TCollection, TExpand>>

	getList<TExpand extends string = ''>(
		page?: number,
		perPage?: number,
		options?: Omit<RecordListOptions, 'expand'> & { expand?: TExpand },
	): Promise<ListResult<GetResponseType<TCollection, TExpand>>>

	getFullList<TExpand extends string = ''>(
		options?: Omit<RecordListOptions, 'expand'> & { expand?: TExpand },
	): Promise<Array<GetResponseType<TCollection, TExpand>>>

	getFirstListItem<TExpand extends string = ''>(
		filter: string,
		options?: Omit<RecordOptions, 'expand'> & { expand?: TExpand },
	): Promise<GetResponseType<TCollection, TExpand>>

	create<TBody = Record<string, unknown>, TExpand extends string = ''>(
		body: TBody,
		options?: Omit<RecordOptions, 'expand'> & { expand?: TExpand },
	): Promise<GetResponseType<TCollection, TExpand>>

	update<TBody = Record<string, unknown>, TExpand extends string = ''>(
		id: string,
		body: TBody,
		options?: Omit<RecordOptions, 'expand'> & { expand?: TExpand },
	): Promise<GetResponseType<TCollection, TExpand>>
}`
