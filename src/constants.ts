export const EXPORT_COMMENT = `/**
* This file was @generated using pocketbase-typegen
*/`
export const IMPORTS = `import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'`
export const RECORD_TYPE_COMMENT = `// Record types for each collection`
export const RESPONSE_TYPE_COMMENT = `// Response types include system fields and match responses from the PocketBase API`
export const ALL_RECORD_RESPONSE_COMMENT = `// Types containing all Records and Responses, useful for creating typing helper functions`
export const TYPED_POCKETBASE_COMMENT = `// Type for usage with type asserted PocketBase instance\n// https://github.com/pocketbase/js-sdk#specify-typescript-definitions`
export const EXPAND_GENERIC_NAME = "expand"
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
