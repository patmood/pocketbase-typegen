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
import {
  createFieldComment,
  createSelectOptions,
  createTypeField,
} from "./fields"
import {
  getGenericArgStringForRecord,
  getGenericArgStringWithDefault,
} from "./generics"
import { CollectionRecord, FieldSchema } from "./types"
import {
  containsGeoPoint,
  getSystemFields,
  getUniqueNames,
  toCollectionIdentifier,
} from "./utils"

type GenerateOptions = {
  sdk: boolean
}

export function generate(
  results: Array<CollectionRecord>,
  options: GenerateOptions
): string {
  const collectionIdentifiers = new Map<string, string>()
  const recordTypes: Array<string> = []
  const responseTypes: Array<string> = [RESPONSE_TYPE_COMMENT]

  results.sort((a, b) => a.name.localeCompare(b.name))
  const identifiers = getUniqueNames(
    results.map(({ name }) => toCollectionIdentifier(name))
  )
  results.forEach((row, index) => {
    const identifier = identifiers[index]
    if (row.name) collectionIdentifiers.set(row.name, identifier)
    if (row.fields) {
      recordTypes.push(createRecordType(identifier, row.fields))
      responseTypes.push(createResponseType(row, identifier))
    }
  })
  const includeGeoPoint = containsGeoPoint(results)

  const fileParts = [
    EXPORT_COMMENT,
    options.sdk && IMPORTS,
    createCollectionEnum(collectionIdentifiers),
    ALIAS_TYPE_DEFINITIONS,
    includeGeoPoint && GEOPOINT_TYPE_DEFINITION,
    EXPAND_TYPE_DEFINITION,
    BASE_SYSTEM_FIELDS_DEFINITION,
    AUTH_SYSTEM_FIELDS_DEFINITION,
    RECORD_TYPE_COMMENT,
    ...recordTypes,
    responseTypes.join("\n"),
    ALL_RECORD_RESPONSE_COMMENT,
    createCollectionRecords(collectionIdentifiers),
    createCollectionResponses(collectionIdentifiers),
    UTILITY_TYPES,
    options.sdk && TYPED_POCKETBASE_TYPE,
  ]

  return fileParts.filter(Boolean).join("\n\n") + "\n"
}

export function createRecordType(
  collectionIdentifier: string,
  schema: Array<FieldSchema>
): string {
  const selectOptionEnums = createSelectOptions(collectionIdentifier, schema)
  const genericArgs = getGenericArgStringWithDefault(schema, {
    includeExpand: false,
  })
  const fields = schema
    .map((fieldSchema: FieldSchema) => ({
      comment: createFieldComment(fieldSchema),
      line: createTypeField(collectionIdentifier, fieldSchema),
    }))
    // Sort on the field line only, so help comments never change field order
    .sort(compareFieldLines)
    .map(({ comment, line }) => (comment ? `${comment}\n${line}` : line))
    .join("\n")

  return `${selectOptionEnums}export type ${collectionIdentifier}Record${genericArgs} = ${
    fields
      ? `{
${fields}
}`
      : "never"
  }`
}

type FieldLine = { comment: string; line: string }

// Same ordering as the default Array.prototype.sort() on the field lines
function compareFieldLines(a: FieldLine, b: FieldLine): number {
  if (a.line < b.line) return -1
  if (a.line > b.line) return 1
  return 0
}

export function createResponseType(
  collectionSchemaEntry: CollectionRecord,
  collectionIdentifier: string
): string {
  const { fields, type } = collectionSchemaEntry
  const genericArgsWithDefaults = getGenericArgStringWithDefault(fields, {
    includeExpand: true,
  })
  const genericArgsForRecord = getGenericArgStringForRecord(fields)
  const systemFields = getSystemFields(type)
  const expandArgString = `<T${EXPAND_GENERIC_NAME}>`

  return `export type ${collectionIdentifier}Response${genericArgsWithDefaults} = Required<${collectionIdentifier}Record${genericArgsForRecord}> & ${systemFields}${expandArgString}`
}
