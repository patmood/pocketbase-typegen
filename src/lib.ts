import {
  createCollectionEnum,
  createCollectionRecords,
  createCollectionResponses
} from "./collections"
import {
  ALIAS_TYPE_DEFINITIONS,
  ALL_RECORD_RESPONSE_COMMENT,
  AUTH_SYSTEM_FIELDS_DEFINITION,
  BASE_SYSTEM_FIELDS_DEFINITION,
  EXPAND_GENERIC_NAME,
  EXPORT_COMMENT,
  IMPORTS,
  RECORD_TYPE_COMMENT,
  RESPONSE_TYPE_COMMENT,
  TYPED_POCKETBASE_TYPE,
  UTILITY_TYPES
} from "./constants"
import { createSelectOptions, createTypeField } from "./fields"
import {
  getGenericArgStringForRecord,
  getGenericArgStringWithDefault,
} from "./generics"
import { CollectionRecord, FieldSchema } from "./types"
import { getSystemFields, toPascalCase } from "./utils"

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

  results
    .sort((a, b) => (a.name <= b.name ? -1 : 1))
    .forEach((row) => {
      if (row.name) collectionNames.push(row.name)
      if (row.fields) {
        recordTypes.push(createRecordType(row.name, row.fields))
        responseTypes.push(createResponseType(row))
      }
    })
  const sortedCollectionNames = collectionNames

  const fileParts = [
    EXPORT_COMMENT,
    options.sdk && IMPORTS,
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
