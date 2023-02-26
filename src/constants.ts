export const EXPORT_COMMENT = `/**
* This file was @generated using pocketbase-typegen
*/`
export const RECORD_TYPE_COMMENT = `// Record types for each collection`
export const RESPONSE_TYPE_COMMENT = `// Response types include system fields and match responses from the PocketBase API`
export const EXPAND_GENERIC_NAME = "expand"
export const DATE_STRING_TYPE_NAME = `IsoDateString`
export const RECORD_ID_STRING_NAME = `RecordIdString`
export const HTML_STRING_NAME = `HTMLString`
export const ALIAS_TYPE_DEFINITIONS = `// Alias types for improved usability
export type ${DATE_STRING_TYPE_NAME} = string
export type ${RECORD_ID_STRING_NAME} = string
export type ${HTML_STRING_NAME} = string`

export const BASE_SYSTEM_FIELDS_DEFINITION = `// System fields
export type BaseSystemFields<T = never> = {
\tid: ${RECORD_ID_STRING_NAME}
\tcreated: ${DATE_STRING_TYPE_NAME}
\tupdated: ${DATE_STRING_TYPE_NAME}
\tcollectionId: string
\tcollectionName: Collections
\texpand?: T
}`

export const AUTH_SYSTEM_FIELDS_DEFINITION = `export type AuthSystemFields<T = never> = {
\temail: string
\temailVisibility: boolean
\tusername: string
\tverified: boolean
} & BaseSystemFields<T>`

export const VIEW_SYSTEM_FIELDS_DEFINITION = `export type ViewSystemFields<T = never> = {
  \tid: ${RECORD_ID_STRING_NAME}
  \tcollectionId: string
  \tcollectionName: Collections
  \texpand?: T
}`
