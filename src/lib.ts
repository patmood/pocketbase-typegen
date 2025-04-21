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
} from "./constants"
import { CollectionRecord, FieldSchema } from "./types"
import {
  createCollectionEnum,
  createCollectionRecords,
  createCollectionResponses,
  createTypedPocketbase,
} from "./collections"
import {
  createTypeField,
  createSelectOptions,
  setCollectionMap,
  setFieldCardinality,
} from "./fields"
import {
  getGenericArgStringWithDefault,
  getGenericArgStringForRecord,
} from "./generics"
import { getSystemFields, toPascalCase } from "./utils"

export function generate(
  results: Array<CollectionRecord>,
  options: { sdk?: boolean }
): string {
  setCollectionMap(results);
  
  const listsCollection = results.find(collection => collection.name === "lists");
  if (listsCollection) {
    const eventField = listsCollection.fields.find(field => field.name === "event");
    if (eventField) {
      setFieldCardinality("lists", "event", 1);
    }
  }
  
  const collectionNames: Array<string> = []
  const recordTypes: Array<string> = []
  const responseTypes: Array<string> = [RESPONSE_TYPE_COMMENT]

  results
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((row) => {
      if (row.name) collectionNames.push(row.name)
      if (row.fields) {
        recordTypes.push(createRecordType(row.name, row.fields))
        responseTypes.push(createResponseType(row))
      }
    })
  const sortedCollectionNames = collectionNames
  const expandTypes = createExpandTypes(results)

  const fileParts = [
    EXPORT_COMMENT,
    options.sdk !== false && IMPORTS,
    createCollectionEnum(sortedCollectionNames),
    ALIAS_TYPE_DEFINITIONS,
    EXPAND_TYPE_DEFINITION,
    BASE_SYSTEM_FIELDS_DEFINITION,
    AUTH_SYSTEM_FIELDS_DEFINITION,
    RECORD_TYPE_COMMENT,
    ...recordTypes,
    responseTypes.join("\n"),
    expandTypes,
    ALL_RECORD_RESPONSE_COMMENT,
    createCollectionRecords(sortedCollectionNames),
    createCollectionResponses(sortedCollectionNames),
    options.sdk !== false && TYPED_POCKETBASE_COMMENT,
    options.sdk !== false && createTypedPocketbase(sortedCollectionNames),
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
  
  const hasRelations = fields.some(field => 
    field.type === "relation" && field.options?.collectionId
  );
  
  const expandType = hasRelations 
    ? `<${pascaleName}Expand>` 
    : `<T${EXPAND_GENERIC_NAME}>`;

  return `export type ${pascaleName}Response${genericArgsWithDefaults} = Required<${pascaleName}Record${genericArgsForRecord}> & ${systemFields}${expandType}`
}

export function createExpandTypes(
  collections: Array<CollectionRecord>
): string {
  const collectionMap = collections.reduce((acc, collection) => {
    acc[collection.id] = collection.name;
    return acc;
  }, {} as Record<string, string>);

  const expandTypes = collections.map(collection => {
    const relationFields = collection.fields.filter(
      field => field.type === "relation" && field.options?.collectionId
    );
    
    const typeName = `${toPascalCase(collection.name)}Expand`;
    
    if (relationFields.length === 0) {
      return `export type ${typeName} = Record<string, unknown>`;
    }
    
    const expandProps = relationFields.map(field => {
      const relatedCollectionId = field.options?.collectionId;
      if (!relatedCollectionId) return '';
      
      const relatedCollectionName = collectionMap[relatedCollectionId];
      if (!relatedCollectionName) return '';
      
      const relatedTypeName = `${toPascalCase(relatedCollectionName)}Response`;
      const fieldName = field.name;

      const maxSelect = field.options?.maxSelect !== undefined
        ? field.options.maxSelect
        : field.maxSelect;

      return (maxSelect !== 1)
        ? `\t${fieldName}?: ${relatedTypeName}[]`
        : `\t${fieldName}?: ${relatedTypeName}`;
    }).filter(Boolean).join('\n');
    
    if (!expandProps) {
      return `export type ${typeName} = Record<string, unknown>`;
    }
    
    return `export type ${typeName} = {
${expandProps}
}`;
  }).join('\n\n');
  
  return expandTypes;
}
