export const EXPORT_COMMENT = `/**
* This file was @generated using pocketbase-typegen
*/`
export const IMPORTS = `import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'`
export const RECORD_TYPE_COMMENT = `// Record types for each collection`
export const RESPONSE_TYPE_COMMENT = `// Response types include system fields and match responses from the PocketBase API`
export const ALL_RECORD_RESPONSE_COMMENT = `// Types containing all Records and Responses, useful for creating typing helper functions`
export const TYPED_POCKETBASE_COMMENT = `// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = {
\tcollection<T extends keyof CollectionResponses>(
\t\tidOrName: T
\t): RecordService<CollectionResponses[T]>;
} & PocketBase;`
export const EXPAND_GENERIC_NAME = "expand"
export const DATE_STRING_TYPE_NAME = `IsoDateString`
export const AUTODATE_STRING_TYPE_NAME = `IsoAutoDateString`
export const RECORD_ID_STRING_NAME = `RecordIdString`
export const HTML_STRING_NAME = `HTMLString`
export const ALIAS_TYPE_DEFINITIONS = `// Alias types for improved usability
export type ${DATE_STRING_TYPE_NAME} = string
export type ${AUTODATE_STRING_TYPE_NAME} = string & { readonly auto: unique symbol }
export type ${RECORD_ID_STRING_NAME} = string
export type ${HTML_STRING_NAME} = string`

export const BASE_SYSTEM_FIELDS_DEFINITION = `// System fields
export type BaseSystemFields<T = never> = {
\tid: ${RECORD_ID_STRING_NAME}
\tcollectionId: string
\tcollectionName: Collections
\texpand?: T
}`

export const BASE_SYSTEM_CREATE_FIELDS_DEFINITION = `export type BaseSystemCreateFields = {
\tid?: ${RECORD_ID_STRING_NAME}
}`

export const BASE_SYSTEM_UPDATE_FIELDS_DEFINITION = `export type BaseSystemUpdateFields = unknown`

export const AUTH_SYSTEM_FIELDS_DEFINITION = `export type AuthSystemFields<T = never> = {
\temail: string
\temailVisibility: boolean
\tusername: string
\tverified: boolean
} & BaseSystemFields<T>`

export const AUTH_SYSTEM_CREATE_FIELDS_DEFINITION = `export type AuthSystemCreateFields = {
\tid?: ${RECORD_ID_STRING_NAME}
\temail: string
\temailVisibility?: boolean
\tpassword: string
\tpasswordConfirm: string
\tverified?: boolean
}`

export const AUTH_SYSTEM_UPDATE_FIELDS_DEFINITION = `export type AuthSystemUpdateFields = {
\temail?: string
\temailVisibility?: boolean
\toldPassword?: string
\tpassword?: string
\tpasswordConfirm?: string
\tverified?: boolean
}`

export const UTILITY_TYPES = `/** Utility types for PocketBase record operations */

// Helper to determine if a collection is Auth
type IsAuthCollection<T extends keyof CollectionResponses> =
\tCollectionResponses[T] extends AuthSystemFields ? true : false;

// Utility type that omits fields of type IsoAutoDateString
type OmitAutodate<T> = {
\t[K in keyof T as T[K] extends IsoAutoDateString ? never : K]: T[K]
};

// Create type for Auth collections
export type CreateAuth<T> = OmitAutodate<Omit<T, 'id'>> & AuthSystemCreateFields;

// Create type for Base collections
export type CreateBase<T> = OmitAutodate<Omit<T, 'id'>> & BaseSystemCreateFields;

// Update type for Auth collections
export type UpdateAuth<T> = Partial<Omit<T, keyof AuthSystemFields>> & AuthSystemUpdateFields;

// Update type for Base collections
export type UpdateBase<T> = Partial<Omit<T, keyof BaseSystemFields>> & BaseSystemUpdateFields;

// Get the correct create type for any collection
export type Create<T extends keyof CollectionResponses> =
\tIsAuthCollection<T> extends true
\t\t? CreateAuth<CollectionRecords[T]>
\t\t: CreateBase<CollectionRecords[T]>;

// Get the correct update type for any collection
export type Update<T extends keyof CollectionResponses> =
\tIsAuthCollection<T> extends true
\t\t? UpdateAuth<CollectionRecords[T]>
\t\t: UpdateBase<CollectionRecords[T]>;`;
