import {
  ALIAS_TYPE_DEFINITIONS,
  ALL_RECORD_RESPONSE_COMMENT,
  AUTH_SYSTEM_FIELDS_DEFINITION,
  BASE_SYSTEM_FIELDS_DEFINITION,
  EXPORT_COMMENT,
  RECORD_TYPE_COMMENT,
  RESPONSE_TYPE_COMMENT,
  IMPORTS,
  GEOPOINT_TYPE_DEFINITION,
} from "./constants"
import {
  CollectionRecord,
  CollectionRecordWithRelations,
  FieldSchema,
} from "./types"
import {
  createCollectionEnum,
  createCollectionRecords,
  createCollectionResponses,
  createEnhancedPocketBase,
  createExpandHelpers,
} from "./collections"
import { createSelectOptions, createTypeField } from "./fields"
import {
  getGenericArgList,
  getGenericArgStringForRecord,
} from "./generics"
import { containsGeoPoint, getSystemFields, toPascalCase } from "./utils"

type GenerateOptions = {
  sdk: boolean
}

export function generate(
  schema: Array<CollectionRecord>,
  options: GenerateOptions
): string {
  const collectionNames = schema
    .map((c) => c.name)
    .sort((a, b) => (a <= b ? -1 : 1))

  const collectionIdToNameMap = new Map<string, string>(
    schema.map((c) => [c.id, c.name])
  )

  const schemaWithRelations: CollectionRecordWithRelations[] = schema
    .map((c) => {
      const relations: CollectionRecordWithRelations["relations"] = {}
      c.fields
        .filter((f) => f.type === "relation")
        .forEach((f) => {
          const collectionId = f.collectionId
          if (collectionId && collectionIdToNameMap.has(collectionId)) {
            relations[f.name] = {
              collectionName: collectionIdToNameMap.get(collectionId)!,
              isMultiple: f.maxSelect !== 1,
              required: f.required,
            }
          }
        })
      return { ...c, relations }
    })
    .sort((a, b) => (a.name <= b.name ? -1 : 1))

  const recordTypes: Array<string> = []
  const responseTypes: Array<string> = [RESPONSE_TYPE_COMMENT]

  schemaWithRelations.forEach((row) => {
    recordTypes.push(createRecordType(row))
    responseTypes.push(createResponseType(row))
  })

  const includeGeoPoint = containsGeoPoint(schema)

  const fileParts = [
    EXPORT_COMMENT,
    options.sdk && IMPORTS,
    createCollectionEnum(collectionNames),
    ALIAS_TYPE_DEFINITIONS,
    includeGeoPoint && GEOPOINT_TYPE_DEFINITION,
    options.sdk && createExpandHelpers(schemaWithRelations),
    BASE_SYSTEM_FIELDS_DEFINITION,
    AUTH_SYSTEM_FIELDS_DEFINITION,
    RECORD_TYPE_COMMENT,
    ...recordTypes,
    responseTypes.join("\n"),
    ALL_RECORD_RESPONSE_COMMENT,
    createCollectionRecords(schemaWithRelations),
    createCollectionResponses(collectionNames),
    options.sdk && createEnhancedPocketBase(schemaWithRelations),
  ]

  return fileParts.filter(Boolean).join("\n\n") + "\n"
}

export function createRecordType(
  collection: CollectionRecordWithRelations
): string {
  const { name, fields } = collection
  const selectOptionEnums = createSelectOptions(name, fields)
  const typeName = toPascalCase(name)
  const genericArgs = getGenericArgStringForRecord(collection)
  const fieldStrings = fields
    .map((fieldSchema: FieldSchema) => createTypeField(name, fieldSchema))
    .sort()
    .join("\n")

  return `${selectOptionEnums}export type ${typeName}Record${genericArgs} = {
${fieldStrings}
}`
}

export function createResponseType(
  collection: CollectionRecordWithRelations
): string {
  const { name, type } = collection
  const pascaleName = toPascalCase(name)
  const responseTypeName = `${pascaleName}Response`
  const recordTypeName = `${pascaleName}Record`
  const systemFieldsName = getSystemFields(type)
  const hasRelations = collection.relations && Object.keys(collection.relations).length > 0

  const genericArgsForRecord = getGenericArgStringForRecord(collection)

  const jsonGenerics = getGenericArgList(collection).map(g => `${g} = unknown`);
  const allGenericParams = [...jsonGenerics];

  let systemFieldsGeneric: string;

  allGenericParams.push(`Texpand extends string = ""`);
  if (hasRelations) {
    systemFieldsGeneric = `<${pascaleName}Expand<Texpand>>`;
  } else {
    systemFieldsGeneric = `<Texpand extends "" ? undefined : never>`;
  }
  const genericParamsString = allGenericParams.length > 0 ? `<${allGenericParams.join(", ")}>` : "";

  return `export type ${responseTypeName}${genericParamsString} = Required<${recordTypeName}${genericArgsForRecord}> & ${systemFieldsName}${systemFieldsGeneric}`
}
