import {
  createCollectionCreates,
  createCollectionEnum,
  createCollectionRecords,
  createCollectionResponses,
  createCollectionUpdates,
  createTypedPocketbase,
} from "./collections"
import {
  ALIAS_TYPE_DEFINITIONS,
  ALL_RECORD_RESPONSE_COMMENT,
  AUTH_SYSTEM_CREATE_FIELDS_DEFINITION,
  AUTH_SYSTEM_FIELDS_DEFINITION,
  AUTH_SYSTEM_UPDATE_FIELDS_DEFINITION,
  BASE_SYSTEM_CREATE_FIELDS_DEFINITION,
  BASE_SYSTEM_FIELDS_DEFINITION,
  BASE_SYSTEM_UPDATE_FIELDS_DEFINITION,
  CREATE_TYPE_COMMENT,
  EXPAND_GENERIC_NAME,
  EXPORT_COMMENT,
  EXTRA_SYSTEM_FIELDS,
  IMPORTS,
  NOT_COMMON_COLLECTIONS,
  RECORD_TYPE_COMMENT,
  RESPONSE_TYPE_COMMENT,
  TYPED_POCKETBASE_COMMENT,
  UPDATE_TYPE_COMMENT,
} from "./constants"
import { createSelectOptions, createTypeCreateField, createTypeField, createTypeUpdateField } from "./fields"
import {
  getGenericArgStringForRecord,
  getGenericArgStringWithDefault,
} from "./generics"
import { CollectionRecord, FieldSchema } from "./types"
import { getSystemCreateFields, getSystemFields, getSystemUpdateFields, toPascalCase } from "./utils"

type GenerateOptions = {
  sdk: boolean
}

export function generate(
  results: Array<CollectionRecord>,
  options: GenerateOptions
): string {
  const collectionNames: Array<string> = []
  const recordTypes: Array<string> = []
  const createTypes: Array<string> = []
  const updateTypes: Array<string> = []
  const responseTypes: Array<string> = [RESPONSE_TYPE_COMMENT]

  results
    .sort((a, b) => (a.name <= b.name ? -1 : 1))
    .forEach((row) => {
      if (row.name) collectionNames.push(row.name)
      if (row.fields) {
        recordTypes.push(createRecordType(row.name, row.fields))
        if (!NOT_COMMON_COLLECTIONS.includes(row.name)) {
          createTypes.push(createCreateType(row))
          updateTypes.push(createUpdateType(row))
        }
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
    BASE_SYSTEM_CREATE_FIELDS_DEFINITION,
    BASE_SYSTEM_UPDATE_FIELDS_DEFINITION,
    AUTH_SYSTEM_FIELDS_DEFINITION,
    AUTH_SYSTEM_CREATE_FIELDS_DEFINITION,
    AUTH_SYSTEM_UPDATE_FIELDS_DEFINITION,
    RECORD_TYPE_COMMENT,
    ...recordTypes,
    CREATE_TYPE_COMMENT,
    ...createTypes,
    UPDATE_TYPE_COMMENT,
    ...updateTypes,
    responseTypes.join("\n"),
    ALL_RECORD_RESPONSE_COMMENT,
    createCollectionRecords(sortedCollectionNames),
    createCollectionCreates(sortedCollectionNames),
    createCollectionUpdates(sortedCollectionNames),
    createCollectionResponses(sortedCollectionNames),
    options.sdk && TYPED_POCKETBASE_COMMENT,
    options.sdk && createTypedPocketbase(sortedCollectionNames),
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

export function createCreateType(
  collectionSchemaEntry: CollectionRecord
): string {
  const { name, fields, type } = collectionSchemaEntry
  const typeName = toPascalCase(name)
  const genericArgs = getGenericArgStringWithDefault(fields, {
    includeExpand: false,
  })
  const systemFields = getSystemCreateFields(type)
  const collectionFields = fields
    .filter((fieldSchema: FieldSchema) => !fieldSchema.system && !EXTRA_SYSTEM_FIELDS.includes(fieldSchema.name))
    .map((fieldSchema: FieldSchema) => createTypeCreateField(name, fieldSchema))
    .sort()
    .join("\n")

  return `export type ${typeName}Create${genericArgs} = ${
    collectionFields
      ? `{
${collectionFields}
} & ${systemFields}`
      : systemFields
  }`
}

export function createUpdateType(
  collectionSchemaEntry: CollectionRecord
): string {
  const { name, fields, type } = collectionSchemaEntry
  const typeName = toPascalCase(name)
  const genericArgs = getGenericArgStringWithDefault(fields, {
    includeExpand: false,
  })
  const systemFields = getSystemUpdateFields(type)
  const collectionFields = fields
    .filter((fieldSchema: FieldSchema) => !fieldSchema.system && !EXTRA_SYSTEM_FIELDS.includes(fieldSchema.name))
    .map((fieldSchema: FieldSchema) => createTypeUpdateField(name, fieldSchema))
    .sort()
    .join("\n")

  return `export type ${typeName}Update${genericArgs} = ${
    collectionFields
      ? `{
${collectionFields}
} & ${systemFields}`
      : systemFields
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
