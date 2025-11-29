import {
  createCollectionEnum,
  createCollectionRecords,
  createCollectionResponses,
} from "./collections"
import {
  ALIAS_TYPE_DEFINITIONS,
  ALL_RECORD_RESPONSE_COMMENT,
  AUTH_SYSTEM_FIELDS_DEFINITION,
  BASE_SYSTEM_FIELDS_DEFINITION,
  EXPAND_GENERIC_NAME,
  EXPAND_TYPE_DEFINITION,
  EXPORT_COMMENT,
  GEOPOINT_TYPE_DEFINITION,
  IMPORTS,
  RECORD_TYPE_COMMENT,
  RESPONSE_TYPE_COMMENT,
  TYPED_POCKETBASE_TYPE,
  UTILITY_TYPES,
} from "./constants"
import { createSelectOptions, createTypeField } from "./fields"
import {
  getGenericArgStringForRecord,
  getGenericArgStringWithDefault,
} from "./generics"
import { CollectionRecord, FieldSchema } from "./types"
import { containsGeoPoint, getSystemFields, toPascalCase } from "./utils"

type GenerateOptions = {
  sdk: boolean
}

export function generate(
  results: Array<CollectionRecord>,
  options: GenerateOptions
): string {
  const collectionNames: Array<string> = []
  const recordTypes: Array<string> = []
  const responseTypes: Array<string> = [RESPONSE_TYPE_COMMENT]
  const fieldConstraints: Array<string> = []

  results
    .sort((a, b) => (a.name <= b.name ? -1 : 1))
    .forEach((row) => {
      if (row.name) collectionNames.push(row.name)
      if (row.fields) {
        recordTypes.push(createRecordType(row.name, row.fields))
        responseTypes.push(createResponseType(row))
        const constraints = createFieldConstraints(row.name, row.fields)
        if (constraints) fieldConstraints.push(constraints)
      }
    })
  const sortedCollectionNames = collectionNames
  const includeGeoPoint = containsGeoPoint(results)

  const fileParts = [
    EXPORT_COMMENT,
    options.sdk && IMPORTS,
    createCollectionEnum(sortedCollectionNames),
    ALIAS_TYPE_DEFINITIONS,
    includeGeoPoint && GEOPOINT_TYPE_DEFINITION,
    EXPAND_TYPE_DEFINITION,
    BASE_SYSTEM_FIELDS_DEFINITION,
    AUTH_SYSTEM_FIELDS_DEFINITION,
    RECORD_TYPE_COMMENT,
    ...recordTypes,
    responseTypes.join("\n"),
    ALL_RECORD_RESPONSE_COMMENT,
    createCollectionRecords(sortedCollectionNames),
    createCollectionResponses(sortedCollectionNames),
    UTILITY_TYPES,
    options.sdk && TYPED_POCKETBASE_TYPE,
  ]

  return fileParts.filter(Boolean).join("\n\n") + "\n"
}

export function createRecordType(
  name: string,
  schema: Array<FieldSchema>
): string {
  const selectOptionEnums = createSelectOptions(name, schema)
  const typeName = toPascalCase(name)
  const genericArgs = getGenericArgStringWithDefault(schema, {
    includeExpand: false,
  })
  const fields = schema
    .map((fieldSchema: FieldSchema) => createTypeField(name, fieldSchema))
    .sort()
    .join("\n")

  return `${selectOptionEnums}export type ${typeName}Record${genericArgs} = ${
    fields
      ? `{
${fields}
}`
      : "never"
  }`
}

export function createResponseType(
  collectionSchemaEntry: CollectionRecord
): string {
  const { name, fields, type } = collectionSchemaEntry
  const pascaleName = toPascalCase(name)
  const genericArgsWithDefaults = getGenericArgStringWithDefault(fields, {
    includeExpand: true,
  })
  const genericArgsForRecord = getGenericArgStringForRecord(fields)
  const systemFields = getSystemFields(type)
  const expandArgString = `<T${EXPAND_GENERIC_NAME}>`

  return `export type ${pascaleName}Response${genericArgsWithDefaults} = Required<${pascaleName}Record${genericArgsForRecord}> & ${systemFields}${expandArgString}`
}

function createFieldConstraints(
  name: string,
  schema: Array<FieldSchema>
): string {
  const fieldsToIgnore = ["id", "password", "tokenKey", "token"]
  const textBasedTypes = ["text", "email", "url", "number"]

  const constraints = schema
    .filter((field) => {
      if (field.system || fieldsToIgnore.includes(field.name)) return false
      if (!textBasedTypes.includes(field.type)) return false
      const hasMin = typeof field.min === "number" && field.min !== 0
      const hasMax = typeof field.max === "number" && field.max !== 0
      return hasMin || hasMax
    })
    .map((field) => {
      const parts: string[] = []
      if (typeof field.min === "number" && field.min !== 0) {
        parts.push(`min: ${field.min}`)
      }
      if (typeof field.max === "number" && field.max !== 0) {
        parts.push(`max: ${field.max}`)
      }

      if (parts.length === 0) return null
      return `  ${field.name}: { ${parts.join(", ")} }`
    })
    .filter(Boolean)

  if (constraints.length === 0) return ""

  const typeName = toPascalCase(name)
  return `export const ${typeName}FieldConstraints = {
${constraints.join(",\n")}
}`
}

export function generateConstraints(results: Array<CollectionRecord>): string {
  const fieldConstraints: Array<string> = []

  results
    .sort((a, b) => (a.name <= b.name ? -1 : 1))
    .forEach((row) => {
      if (row.name && row.fields) {
        const constraints = createFieldConstraints(row.name, row.fields)
        if (constraints) fieldConstraints.push(constraints)
      }
    })

  const fileParts = [
    EXPORT_COMMENT,
    fieldConstraints.length > 0
      ? fieldConstraints.join("\n")
      : "// No field constraints found",
  ]

  return fileParts.filter(Boolean).join("\n\n") + "\n"
}
