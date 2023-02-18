import {
  DATE_STRING_TYPE_NAME,
  HTML_STRING_NAME,
  RECORD_ID_STRING_NAME,
} from "./constants"
import { getOptionEnumName, getOptionValues, sanitizeFieldName } from "./utils"

import { FieldSchema } from "./types"
import { fieldNameToGeneric } from "./generics"

/**
 * Convert the pocketbase field type to the equivalent typescript type
 */
export const pbSchemaTypescriptMap = {
  bool: "boolean",
  date: DATE_STRING_TYPE_NAME,
  editor: HTML_STRING_NAME,
  email: "string",
  file: (fieldSchema: FieldSchema) =>
    fieldSchema.options.maxSelect && fieldSchema.options.maxSelect > 1
      ? "string[]"
      : "string",
  json: (fieldSchema: FieldSchema) =>
    `null | ${fieldNameToGeneric(fieldSchema.name)}`,

  number: "number",
  relation: (fieldSchema: FieldSchema) =>
    fieldSchema.options.maxSelect && fieldSchema.options.maxSelect === 1
      ? RECORD_ID_STRING_NAME
      : `${RECORD_ID_STRING_NAME}[]`,
  select: (fieldSchema: FieldSchema, collectionName: string) => {
    // pocketbase v0.8+ values are required
    const valueType = fieldSchema.options.values
      ? getOptionEnumName(collectionName, fieldSchema.name)
      : "string"
    return fieldSchema.options.maxSelect && fieldSchema.options.maxSelect > 1
      ? `${valueType}[]`
      : valueType
  },
  text: "string",
  url: "string",

  // DEPRECATED: PocketBase v0.8 does not have a dedicated user relation
  user: (fieldSchema: FieldSchema) =>
    fieldSchema.options.maxSelect && fieldSchema.options.maxSelect > 1
      ? `${RECORD_ID_STRING_NAME}[]`
      : RECORD_ID_STRING_NAME,
}

export function createTypeField(
  collectionName: string,
  fieldSchema: FieldSchema
): string {
  let typeStringOrFunc:
    | string
    | ((fieldSchema: FieldSchema, collectionName: string) => string)

  if (!(fieldSchema.type in pbSchemaTypescriptMap)) {
    console.log(`WARNING: unknown type "${fieldSchema.type}" found in schema`)
    typeStringOrFunc = "unknown"
  } else {
    typeStringOrFunc =
      pbSchemaTypescriptMap[
        fieldSchema.type as keyof typeof pbSchemaTypescriptMap
      ]
  }

  const typeString =
    typeof typeStringOrFunc === "function"
      ? typeStringOrFunc(fieldSchema, collectionName)
      : typeStringOrFunc

  const fieldName = sanitizeFieldName(fieldSchema.name)
  const required = fieldSchema.required ? "" : "?"

  return `\t${fieldName}${required}: ${typeString}`
}

export function createSelectOptions(
  recordName: string,
  schema: Array<FieldSchema>
): string {
  const selectFields = schema.filter((field) => field.type === "select")
  const typestring = selectFields
    .map(
      (field) => `export enum ${getOptionEnumName(recordName, field.name)} {
${getOptionValues(field)
  .map((val) => `\t"${val}" = "${val}",`)
  .join("\n")}
}\n`
    )
    .join("\n")
  return typestring
}
