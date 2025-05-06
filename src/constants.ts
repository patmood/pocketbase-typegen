export const EXPORT_COMMENT = `/**
* This file was @generated using pocketbase-typegen
*/`
export const IMPORTS = `import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'`
export const RECORD_TYPE_COMMENT = `// Record types for each collection`
export const RESPONSE_TYPE_COMMENT = `// Response types include system fields and match responses from the PocketBase API`
export const ALL_RECORD_RESPONSE_COMMENT = `// Types containing all Records and Responses, useful for creating typing helper functions`
export const TYPED_POCKETBASE_TYPE = `// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = {
\tcollection<T extends keyof CollectionResponses>(
\t\tidOrName: T
\t): RecordService<CollectionResponses[T]>
} & PocketBase`
export const EXPAND_GENERIC_NAME = "expand"
export const DATE_STRING_TYPE_NAME = `IsoDateString`
export const AUTODATE_STRING_TYPE_NAME = `IsoAutoDateString`
export const RECORD_ID_STRING_NAME = `RecordIdString`
export const FILE_NAME_STRING_NAME = `FileNameString`
export const HTML_STRING_NAME = `HTMLString`
export const GEOPOINT_TYPE_NAME = `GeoPoint`
export const ALIAS_TYPE_DEFINITIONS = `// Alias types for improved usability
export type ${DATE_STRING_TYPE_NAME} = string
export type ${AUTODATE_STRING_TYPE_NAME} = string & { readonly autodate: unique symbol }
export type ${RECORD_ID_STRING_NAME} = string
export type ${FILE_NAME_STRING_NAME} = string & { readonly filename: unique symbol }
export type ${HTML_STRING_NAME} = string`

export const BASE_SYSTEM_FIELDS_DEFINITION = `// System fields
export type BaseSystemFields<T = unknown> = {
\tid: ${RECORD_ID_STRING_NAME}
\tcollectionId: string
\tcollectionName: Collections
} & ExpandType<T>`

export const AUTH_SYSTEM_FIELDS_DEFINITION = `export type AuthSystemFields<T = unknown> = {
\temail: string
\temailVisibility: boolean
\tusername: string
\tverified: boolean
} & BaseSystemFields<T>`

// Utility type to get expand field. If T is provided, expand is no longer optional
export const EXPAND_TYPE_DEFINITION = `type ExpandType<T> = unknown extends T
\t? T extends unknown
\t\t? { expand?: unknown }
\t\t: { expand: T }
\t: { expand: T }`

export const GEOPOINT_TYPE_DEFINITION = `export type ${GEOPOINT_TYPE_NAME} = {
\tlon: number
\tlat: number
}`

export const UTILITY_TYPES = `// Utility types for create/update operations

type ProcessCreateAndUpdateFields<T> = Omit<{
\t// Omit AutoDate fields
\t[K in keyof T as Extract<T[K], IsoAutoDateString> extends never ? K : never]: 
\t\t// Convert FileNameString to File
\t\tT[K] extends infer U ? 
\t\t\tU extends (FileNameString | FileNameString[]) ? 
\t\t\t\tU extends any[] ? File[] : File 
\t\t\t: U
\t\t: never
}, 'id'>

// Create type for Auth collections
export type CreateAuth<T> = {
\tid?: ${RECORD_ID_STRING_NAME}
\temail: string
\temailVisibility?: boolean
\tpassword: string
\tpasswordConfirm: string
\tverified?: boolean
} & ProcessCreateAndUpdateFields<T>

// Create type for Base collections
export type CreateBase<T> = {
\tid?: RecordIdString
} & ProcessCreateAndUpdateFields<T>

// Update type for Auth collections
export type UpdateAuth<T> = Partial<
\tOmit<ProcessCreateAndUpdateFields<T>, keyof AuthSystemFields>
> & {
\temail?: string
\temailVisibility?: boolean
\toldPassword?: string
\tpassword?: string
\tpasswordConfirm?: string
\tverified?: boolean
}

// Update type for Base collections
export type UpdateBase<T> = Partial<
\tOmit<ProcessCreateAndUpdateFields<T>, keyof BaseSystemFields>
>

// Get the correct create type for any collection
export type Create<T extends keyof CollectionResponses> =
\tCollectionResponses[T] extends AuthSystemFields
\t\t? CreateAuth<CollectionRecords[T]>
\t\t: CreateBase<CollectionRecords[T]>

// Get the correct update type for any collection
export type Update<T extends keyof CollectionResponses> =
\tCollectionResponses[T] extends AuthSystemFields
\t\t? UpdateAuth<CollectionRecords[T]>
\t\t: UpdateBase<CollectionRecords[T]>`
