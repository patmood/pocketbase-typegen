import {
  ALIAS_TYPE_DEFINITIONS,
  ALL_RECORD_RESPONSE_COMMENT,
  TYPED_POCKETBASE_COMMENT,
  AUTH_SYSTEM_FIELDS_DEFINITION,
  BASE_SYSTEM_FIELDS_DEFINITION,
  EXPAND_GENERIC_NAME,
  EXPORT_COMMENT,
  RECORD_TYPE_COMMENT,
  RESPONSE_TYPE_COMMENT,
  IMPORTS,
  EXPAND_TYPE_DEFINITION,
  GEOPOINT_TYPE_DEFINITION,
} from "./constants"
import {
  CollectionRecord,
  FieldSchema,
  RelationGraph,
  RelationNode,
} from "./types"
import {
  createCollectionEnum,
  createCollectionRecords,
  createCollectionResponses,
  createTypedPocketbase,
} from "./collections"
import { createSelectOptions, createTypeField } from "./fields"
import {
  getGenericArgForExpand,
  getGenericArgStringForRecord,
  getGenericArgStringWithDefault,
} from "./generics"
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
  const relationGraph = createRelationshipGraph(results)

  results
    .sort((a, b) => (a.name <= b.name ? -1 : 1))
    .forEach((row) => {
      if (row.name) collectionNames.push(row.name)
      if (row.fields) {
        recordTypes.push(createRecordType(row.name, row.fields))
        responseTypes.push(createResponseType(row, relationGraph))
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

export function createResponseType(
  collectionSchemaEntry: CollectionRecord,
  relationGraph: RelationGraph
): string {
  const { name, fields, type } = collectionSchemaEntry
  const pascaleName = toPascalCase(name)
  const genericArgsWithDefaults = getGenericArgStringWithDefault(fields, {
    includeExpand: true,
    relationGraph,
    collectionId: collectionSchemaEntry.id,
  })
  const genericArgsForRecord = getGenericArgStringForRecord(fields)
  const systemFields = getSystemFields(type)
  const expandArgString = `<T${EXPAND_GENERIC_NAME}>`

  return `export type ${pascaleName}Response${genericArgsWithDefaults} = Required<${pascaleName}Record${genericArgsForRecord}> & ${systemFields}${expandArgString}`
}

export function createRelationshipGraph(
  collections: Array<CollectionRecord>
): RelationGraph {
  const relationNodes = collections.map<RelationNode>((collection) => ({
    ...collection,
    children: new Map(),
    parents: new Map(),
  }))

  relationNodes.forEach((childNode) => {
    childNode.fields.forEach((field) => {
      const parentId =
        field.type === "relation" ? field.options?.collectionId : undefined

      const parentNode = parentId
        ? relationNodes.find((collection) => collection.id === parentId)
        : undefined

      if (!parentNode) {
        return
      }

      parentNode.children.set(field, childNode)
      childNode.parents.set(field, parentNode)
    })
  })

  return relationNodes
}
