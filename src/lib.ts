import {
  ALIAS_TYPE_DEFINITIONS,
  AUTH_SYSTEM_FIELDS_DEFINITION,
  BASE_SYSTEM_FIELDS_DEFINITION,
  DATE_STRING_TYPE_NAME,
  EXPAND_TYPE_COMMENT,
  EXPORT_COMMENT,
  RECORD_ID_STRING_NAME,
  RECORD_TYPE_COMMENT,
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
  getOptionValues,
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
  select: (fieldSchema: FieldSchema, collectionName: string) => {
    // pocketbase v0.8+ values are required
    const valueType = fieldSchema.options.values
      ? getOptionEnumName(collectionName, fieldSchema.name)
      : "string"
    return fieldSchema.options.maxSelect && fieldSchema.options.maxSelect > 1
      ? `${valueType}[]`
      : valueType
  },
  json: (fieldSchema: FieldSchema) =>
    `null | ${fieldNameToGeneric(fieldSchema.name)}`,
  file: (fieldSchema: FieldSchema) =>
    fieldSchema.options.maxSelect && fieldSchema.options.maxSelect > 1
      ? "string[]"
      : "string",
  relation: (fieldSchema: FieldSchema) =>
    fieldSchema.options.maxSelect && fieldSchema.options.maxSelect === 1
      ? RECORD_ID_STRING_NAME
      : `${RECORD_ID_STRING_NAME}[]`,
  // DEPRECATED: PocketBase v0.8 does not have a dedicated user relation
  user: (fieldSchema: FieldSchema) =>
    fieldSchema.options.maxSelect && fieldSchema.options.maxSelect > 1
      ? `${RECORD_ID_STRING_NAME}[]`
      : RECORD_ID_STRING_NAME,
}

export function generate(results: Array<CollectionRecord>) {
  const collectionNames: Array<string> = []
  const recordTypes: Array<string> = []
  const expandTypes: Array<string> = [EXPAND_TYPE_COMMENT]
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
        expandTypes.push(createExpandType(results, row))
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
    expandTypes.join("\n"),
    responseTypes.join("\n"),
    createCollectionRecords(sortedCollectionNames),
  ]

  return fileParts.join("\n\n")
}

export function createCollectionEnum(collectionNames: Array<string>) {
  const collections = collectionNames
    .map((name) => `\t${toPascalCase(name)} = "${name}",`)
    .join("\n")
  const typeString = `export enum Collections {
${collections}
}`
  return typeString
}

export function createCollectionRecords(collectionNames: Array<string>) {
  const nameRecordMap = collectionNames
    .map((name) => `\t${name}: ${toPascalCase(name)}Record`)
    .join("\n")
  return `export type CollectionRecords = {
${nameRecordMap}
}`
}

export function createRecordType(
  name: string,
  schema: Array<FieldSchema>
): string {
  const selectOptionEnums = createSelectOptions(name, schema)
  const typeName = toPascalCase(name)
  const genericArgs = getGenericArgStringWithDefault(schema)
  const fields = schema
    .map((fieldSchema: FieldSchema) => createTypeField(name, fieldSchema))
    .join("\n")

  return `${selectOptionEnums}export type ${typeName}Record${genericArgs} = {
${fields}
}`
}

export function createResponseType(collectionSchemaEntry: CollectionRecord) {
  const { name, schema, type } = collectionSchemaEntry
  const pascaleName = toPascalCase(name)
  const genericArgsWithDefaults = getGenericArgStringWithDefault(schema)
  const genericArgs = getGenericArgString(schema)
  return `export type ${pascaleName}Response${genericArgsWithDefaults} = ${pascaleName}Record${genericArgs} & BaseSystemFields<${pascaleName}ExpandType>${
    type === "auth" ? " & AuthSystemFields" : ""
  }`
}

export function createExpandType(
  allRecords: CollectionRecord[],
  targetRecord: CollectionRecord
) {
  const [directExpandTypes, directExpandConsts] = createDirectExpand(
    allRecords,
    targetRecord
  )
  const [indirectExpandTypes, indirectExpandConsts] = createIndirectExpand(
    allRecords,
    targetRecord
  )

  const expandTypes = [...directExpandTypes, ...indirectExpandTypes]
  const expandConsts = [...directExpandConsts, ...indirectExpandConsts]

  const hasExpandTypes = expandTypes.length > 0
  const pascaleName = toPascalCase(targetRecord.name)

  const expandTypesString = `type ${pascaleName}ExpandType = {
${hasExpandTypes ? expandTypes.join("\n") : "\t// Doesn't have any relation"}
}`

  const expandConstString =
    hasExpandTypes &&
    `export const ${pascaleName}ExpandKeys = {
  ${expandConsts.join(",\n")}
}`

  return [expandTypesString, expandConstString].filter(Boolean).join("\n")
}

export function createDirectExpand(
  allRecords: CollectionRecord[],
  targetRecord: CollectionRecord
) {
  const expandTypes: string[] = []
  const expandConsts: string[] = []

  targetRecord.schema
    .filter(({ type }) => type === "relation")
    .forEach(({ name, options }) => {
      const expandedRecord = allRecords.find(
        (record) => record.id === options?.collectionId
      )
      if (!expandedRecord) {
        return
      }
      const expandType =
        options.maxSelect && options.maxSelect > 1
          ? `${toPascalCase(expandedRecord.name)}Response[]`
          : `${toPascalCase(expandedRecord.name)}Response`
      expandTypes.push(`\t${name}: ${expandType}`)

      const expandConst = `\t${name}: "${name}"`
      expandConsts.push(expandConst)
    })
  return [expandTypes, expandConsts]
}

export function createIndirectExpand(
  allRecords: CollectionRecord[],
  targetRecord: CollectionRecord
) {
  const expandTypes: string[] = []
  const expandConsts: string[] = []

  allRecords.forEach((record) => {
    record.schema
      .filter((field) => field.type === "relation")
      .forEach((field) => {
        if (field.options?.collectionId !== targetRecord.id) {
          return
        }
        if (field.options.maxSelect && field.options.maxSelect > 1) {
          return
        }
        const expandKeyName = `${record.name}(${field.name})`
        expandTypes.push(
          `\t"${expandKeyName}": ${toPascalCase(record.name)}Response[]`
        )
        expandConsts.push(`\t${record.name}: "${expandKeyName}"`)
      })
  })
  return [expandTypes, expandConsts]
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

  const fieldName = sanitizeFieldName(fieldSchema.name)
  const required = fieldSchema.required ? "" : "?"

  return `\t${fieldName}${required}: ${typeString}`
}

export function createSelectOptions(
  recordName: string,
  schema: Array<FieldSchema>
) {
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
