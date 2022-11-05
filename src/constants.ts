export const EXPORT_COMMENT = `// This file was @generated using pocketbase-typegen`
export const DATE_STRING_TYPE_NAME = `IsoDateString`
export const DATE_STRING_TYPE_DEFINITION = `export type ${DATE_STRING_TYPE_NAME} = string`
export const RECORD_ID_STRING_NAME = `RecordIdString`
export const RECORD_ID_STRING_DEFINITION = `export type ${RECORD_ID_STRING_NAME} = string`
export const USER_ID_STRING_NAME = `UserIdString`
export const USER_ID_STRING_DEFINITION = `export type ${USER_ID_STRING_NAME} = string`
export const BASE_RECORD_DEFINITION = `export type BaseRecord = {
\tid: ${RECORD_ID_STRING_NAME}
\tcreated: ${DATE_STRING_TYPE_NAME}
\tupdated: ${DATE_STRING_TYPE_NAME}
\t"@collectionId": string
\t"@collectionName": string
\t"@expand"?: { [key: string]: any }
}`
