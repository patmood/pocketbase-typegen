import {
  AUTODATE_STRING_TYPE_NAME,
  DATE_STRING_TYPE_NAME,
  FILE_NAME_STRING_NAME,
  GEOPOINT_TYPE_NAME,
  HTML_STRING_NAME,
  RECORD_ID_STRING_NAME,
} from "./constants"
import { getOptionEnumName, getOptionValues, sanitizeFieldName } from "./utils"

import { fieldNameToGeneric } from "./generics"
import { FieldSchema } from "./types"

/**
 * Convert the pocketbase field type to the equivalent typescript type
 */
export const pbSchemaTypescriptMap = {
  // Basic fields
  bool: "boolean",
  date: DATE_STRING_TYPE_NAME,
  autodate: AUTODATE_STRING_TYPE_NAME,
  editor: HTML_STRING_NAME,
  email: "string",
  geoPoint: GEOPOINT_TYPE_NAME,
  text: "string",
  url: "string",
  password: "string",
  number: "number",

  // Dependent on schema
  file: (fieldSchema: FieldSchema) =>
    fieldSchema.maxSelect && fieldSchema.maxSelect > 1
      ? `${FILE_NAME_STRING_NAME}[]`
      : `${FILE_NAME_STRING_NAME}`,
  json: (fieldSchema: FieldSchema) =>
    `null | ${fieldNameToGeneric(fieldSchema.name)}`,
  relation: (fieldSchema: FieldSchema) =>
    fieldSchema.maxSelect && fieldSchema.maxSelect > 1
      ? `${RECORD_ID_STRING_NAME}[]`
      : RECORD_ID_STRING_NAME,
  select: (fieldSchema: FieldSchema, collectionName: string) => {
    // pocketbase v0.8+ values are required
    const valueType = fieldSchema.values
      ? getOptionEnumName(collectionName, fieldSchema.name)
      : "string"
    return fieldSchema.maxSelect && fieldSchema.maxSelect > 1
      ? `${valueType}[]`
      : valueType
  },

  // DEPRECATED: PocketBase v0.8 does not have a dedicated user relation
  user: (fieldSchema: FieldSchema) =>
    fieldSchema.maxSelect && fieldSchema.maxSelect > 1
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
  const required =
    (fieldSchema.type === "autodate" && !fieldSchema.onCreate) ||
    (fieldSchema.type !== "autodate" && !fieldSchema.required)
      ? "?"
      : ""

  return `\t${fieldName}${required}: ${typeString}`
}

/**
 * Build a JSDoc comment from the field's help text (PocketBase v0.37+).
 * Returns an empty string when the field has no help text.
 */
export function createFieldComment(fieldSchema: FieldSchema): string {
  if (typeof fieldSchema.help !== "string") return ""

  const help = fieldSchema.help
    .replace(/\r\n?/g, "\n")
    // Prevent the help text from closing the comment early
    .replace(/\*\//g, "*\\/")
    .trim()
  if (!help) return ""

  const lines = help.split("\n").map((line) => line.trimEnd())
  if (lines.length === 1) return `\t/** ${lines[0]} */`

  const body = lines.map((line) => (line ? `\t * ${line}` : "\t *"))
  return ["\t/**", ...body, "\t */"].join("\n")
}

export function createSelectOptions(
  recordName: string,
  fields: Array<FieldSchema>
): string {
  const selectFields = fields.filter((field) => field.type === "select")

  const typestring = selectFields
    .map((field) => {
      const name = getOptionEnumName(recordName, field.name)
      const values = getOptionValues(field)
      const entries = values
        .map(
          (val) => `\t"${getSelectOptionEnumName(val)}": "${val}",`
        )
        .join("\n")
      return `export const ${name} = {
${entries}
} as const
export type ${name} = typeof ${name}[keyof typeof ${name}]
`
    })
    .join("\n")
  return typestring
}

export function getSelectOptionEnumName(val: string) {
  if (!isNaN(Number(val))) {
    // The value is a number, which cannot be used as an enum name
    return `E${val}`
  } else {
    return val
  }
}
