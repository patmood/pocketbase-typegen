import {
  ALIAS_TYPE_DEFINITIONS,
  AUTH_SYSTEM_FIELDS_DEFINITION,
  BASE_SYSTEM_FIELDS_DEFINITION,
  DATE_STRING_TYPE_NAME,
  EXPORT_COMMENT,
  RECORD_ID_STRING_NAME,
  RESPONSE_TYPE_COMMENT,
} from "./constants"
import { CollectionRecord, FieldSchema } from "./types"
import {
  fieldNameToGeneric,
  getGenericArgString,
  getGenericArgStringWithDefault,
} from "./generics"
import {
  getOptionEnumName,
  getSystemFields,
  sanitizeFieldName,
  toPascalCase,
} from "./utils"

const pbSchemaTypescriptMap = {
  text: "string",
  number: "number",
  bool: "boolean",
  email: "string",
  url: "string",
  date: DATE_STRING_TYPE_NAME,
  select: (fieldSchema: FieldSchema, collectionName: string) =>
    fieldSchema.options.values
      ? getOptionEnumName(collectionName, fieldSchema.name)
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
  const responseTypes: Array<string> = [RESPONSE_TYPE_COMMENT]

  results
    .sort((a, b) => {
      if (a.name < b.name) {
        return -1
      }
      if (a.name > b.name) {
        return 1
      }
      return 0
    })
    .forEach((row) => {
      if (row.name) collectionNames.push(row.name)
      if (row.schema) {
        recordTypes.push(createRecordType(row.name, row.schema))
        responseTypes.push(createResponseType(row))
      }
    })
  const sortedCollectionNames = collectionNames

  const fileParts = [
    EXPORT_COMMENT,
    createCollectionEnum(sortedCollectionNames),
    ALIAS_TYPE_DEFINITIONS,
    AUTH_SYSTEM_FIELDS_DEFINITION,
    BASE_SYSTEM_FIELDS_DEFINITION,
    ...recordTypes,
    responseTypes.join("\n"),
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
  const selectOptionEnums = createSelectOptions(name, schema)
  let typeString = `${selectOptionEnums}export type ${toPascalCase(
    name
  )}Record${getGenericArgStringWithDefault(schema)} = {\n`
  schema.forEach((fieldSchema: FieldSchema) => {
    typeString += createTypeField(name, fieldSchema)
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

export function createTypeField(
  collectionName: string,
  fieldSchema: FieldSchema
) {
  if (!(fieldSchema.type in pbSchemaTypescriptMap)) {
    throw new Error(`unknown type ${fieldSchema.type} found in schema`)
  }
  const typeStringOrFunc =
    pbSchemaTypescriptMap[
      fieldSchema.type as keyof typeof pbSchemaTypescriptMap
    ]

  const typeString =
    typeof typeStringOrFunc === "function"
      ? typeStringOrFunc(fieldSchema, collectionName)
      : typeStringOrFunc
  return `\t${sanitizeFieldName(fieldSchema.name)}${
    fieldSchema.required ? "" : "?"
  }: ${typeString}\n`
}

export function createSelectOptions(
  recordName: string,
  schema: Array<FieldSchema>
) {
  const selectFields = schema.filter((field) => field.type === "select")
  const typestring = selectFields
    .map(
      (field) => `export enum ${getOptionEnumName(recordName, field.name)} {
${field.options.values?.map((val) => `\t${val} = "${val}",`).join("\n")}
}\n`
    )
    .join("\n")
  return typestring
}
