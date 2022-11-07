import {
  ALIAS_TYPE_DEFINITIONS,
  AUTH_SYSTEM_FIELDS_DEFINITION,
  BASE_SYSTEM_FIELDS_DEFINITION,
  DATE_STRING_TYPE_NAME,
  EXPORT_COMMENT,
  RECORD_ID_STRING_NAME,
} from "./constants"
import { CollectionRecord, FieldSchema } from "./types"
import {
  fieldNameToGeneric,
  getGenericArgString,
  getGenericArgStringWithDefault,
} from "./generics"
import { getSystemFields, sanitizeFieldName, toPascalCase } from "./utils"

const pbSchemaTypescriptMap = {
  text: "string",
  number: "number",
  bool: "boolean",
  email: "string",
  url: "string",
  date: DATE_STRING_TYPE_NAME,
  select: (fieldSchema: FieldSchema) =>
    fieldSchema.options.values
      ? fieldSchema.options.values.map((val) => `"${val}"`).join(" | ")
      : "string",
  json: (fieldSchema: FieldSchema) =>
    `null | ${fieldNameToGeneric(fieldSchema.name)}`,
  file: (fieldSchema: FieldSchema) =>
    fieldSchema.options.maxSelect && fieldSchema.options.maxSelect > 1
      ? "string[]"
      : "string",
  relation: (fieldSchema: FieldSchema) =>
    fieldSchema.options.maxSelect && fieldSchema.options.maxSelect > 1
      ? `${RECORD_ID_STRING_NAME}[]`
      : RECORD_ID_STRING_NAME,
}

export function generate(results: Array<CollectionRecord>) {
  const collectionNames: Array<string> = []
  const recordTypes: Array<string> = []

  results.forEach((row) => {
    if (row.name) collectionNames.push(row.name)
    if (row.schema) {
      recordTypes.push(createRecordType(row.name, row.schema))
      recordTypes.push(createResponseType(row))
    }
  })
  const sortedCollectionNames = collectionNames.sort()

  const fileParts = [
    EXPORT_COMMENT,
    createCollectionEnum(sortedCollectionNames),
    ALIAS_TYPE_DEFINITIONS,
    AUTH_SYSTEM_FIELDS_DEFINITION,
    BASE_SYSTEM_FIELDS_DEFINITION,
    ...recordTypes.sort(),
    createCollectionRecord(sortedCollectionNames),
  ]

  return fileParts.join("\n\n")
}

export function createCollectionEnum(collectionNames: Array<string>) {
  let typeString = `export enum Collections {\n`
  collectionNames.forEach((name) => {
    typeString += `\t${toPascalCase(name)} = "${name}",\n`
  })
  typeString += `}`
  return typeString
}

export function createCollectionRecord(collectionNames: Array<string>) {
  let typeString = `export type CollectionRecords = {\n`
  collectionNames.forEach((name) => {
    typeString += `\t${name}: ${toPascalCase(name)}Record\n`
  })
  typeString += `}`
  return typeString
}

export function createRecordType(
  name: string,
  schema: Array<FieldSchema>
): string {
  let typeString = `export type ${toPascalCase(
    name
  )}Record${getGenericArgStringWithDefault(schema)} = {\n`
  schema.forEach((fieldSchema: FieldSchema) => {
    typeString += createTypeField(fieldSchema)
  })
  typeString += `}`
  return typeString
}

export function createResponseType(collectionSchemaEntry: CollectionRecord) {
  const { name, schema, type } = collectionSchemaEntry
  const pascaleName = toPascalCase(name)
  let typeString = `export type ${pascaleName}Response${getGenericArgStringWithDefault(
    schema
  )} = ${pascaleName}Record${getGenericArgString(schema)} & ${getSystemFields(
    type
  )}`
  return typeString
}

export function createTypeField(fieldSchema: FieldSchema) {
  if (!(fieldSchema.type in pbSchemaTypescriptMap)) {
    throw new Error(`unknown type ${fieldSchema.type} found in schema`)
  }
  const typeStringOrFunc =
    pbSchemaTypescriptMap[
      fieldSchema.type as keyof typeof pbSchemaTypescriptMap
    ]

  const typeString =
    typeof typeStringOrFunc === "function"
      ? typeStringOrFunc(fieldSchema)
      : typeStringOrFunc
  return `\t${sanitizeFieldName(fieldSchema.name)}${
    fieldSchema.required ? "" : "?"
  }: ${typeString}\n`
}
