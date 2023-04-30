import {
  ALIAS_TYPE_DEFINITIONS,
  ALL_RECORD_RESPONSE_COMMENT,
  AUTH_SYSTEM_FIELDS_DEFINITION,
  BASE_SYSTEM_FIELDS_DEFINITION,
  EXPAND_GENERIC_NAME,
  EXPORT_COMMENT,
  RECORD_TYPE_COMMENT,
  RESPONSE_TYPE_COMMENT,
} from "./constants"
import { CollectionRecord, FieldSchema } from "./types"
import {
  canExpand,
  getGenericArgStringForRecord,
  getGenericArgStringWithDefault,
} from "./generics"
import {
  createCollectionEnum,
  createCollectionRecords,
  createCollectionResponses,
} from "./collections"
import { createSelectOptions, createTypeField } from "./fields"
import { getSystemFields, toPascalCase } from "./utils"

export function generate(results: Array<CollectionRecord>): string {
  const collectionNames: Array<string> = []
  const recordTypes: Array<string> = []
  const responseTypes: Array<string> = [RESPONSE_TYPE_COMMENT]

  results
    .sort((a, b) => (a.name <= b.name ? -1 : 1))
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
    BASE_SYSTEM_FIELDS_DEFINITION,
    AUTH_SYSTEM_FIELDS_DEFINITION,
    RECORD_TYPE_COMMENT,
    ...recordTypes,
    responseTypes.join("\n"),
    ALL_RECORD_RESPONSE_COMMENT,
    createCollectionRecords(sortedCollectionNames),
    createCollectionResponses(sortedCollectionNames),
  ]

  return fileParts.join("\n\n")
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
  const { name, schema, type } = collectionSchemaEntry
  const pascaleName = toPascalCase(name)
  const genericArgsWithDefaults = getGenericArgStringWithDefault(schema, {
    includeExpand: true,
  })
  const genericArgsForRecord = getGenericArgStringForRecord(schema)
  const systemFields = getSystemFields(type)
  const expandArgString = canExpand(schema) ? `<T${EXPAND_GENERIC_NAME}>` : ""

  return `export type ${pascaleName}Response${genericArgsWithDefaults} = Required<${pascaleName}Record${genericArgsForRecord}> & ${systemFields}${expandArgString}`
}
