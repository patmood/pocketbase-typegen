export const EXPORT_COMMENT = `// This file was @generated using pocketbase-typegen`
export const RESPONSE_TYPE_COMMENT = `// Response types include system fields and match responses from the PocketBase API`
export const DATE_STRING_TYPE_NAME = `IsoDateString`
export const RECORD_ID_STRING_NAME = `RecordIdString`
export const ALIAS_TYPE_DEFINITIONS = `// Alias types for improved usability
export type ${DATE_STRING_TYPE_NAME} = string
export type ${RECORD_ID_STRING_NAME} = string`

export const AUTH_SYSTEM_FIELDS_DEFINITION = `export type AuthSystemFields = {
\tcollectionId: string
\tcollectionName: Collections,
\tcreated: ${DATE_STRING_TYPE_NAME}
\temail: string
\temailVisibility: boolean
\tid: ${RECORD_ID_STRING_NAME},
\tupdated: ${DATE_STRING_TYPE_NAME}
\tusername: string
\tverified: boolean
\texpand?: { [key: string]: any }
}`

export const BASE_SYSTEM_FIELDS_DEFINITION = `export type BaseSystemFields = {
\tid: ${RECORD_ID_STRING_NAME}
\tcreated: ${DATE_STRING_TYPE_NAME}
\tupdated: ${DATE_STRING_TYPE_NAME}
\tcollectionId: string
\tcollectionName: Collections
\texpand?: { [key: string]: any }
}`
