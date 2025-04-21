import {
  DATE_STRING_TYPE_NAME,
  HTML_STRING_NAME,
  RECORD_ID_STRING_NAME,
} from "./constants"
import { getOptionEnumName, getOptionValues, sanitizeFieldName, toPascalCase } from "./utils"

import { FieldSchema } from "./types"
import { fieldNameToGeneric } from "./generics"

// Helper to store collection ID to name mapping for relation fields
const collectionIdToName: Record<string, string> = {};

// Store field name to maxSelect mapping for manual override of relation cardinality
const fieldNameToMaxSelect: Record<string, number> = {};

export function setCollectionMap(collections: Array<{ id: string, name: string }>) {
  collections.forEach(collection => {
    collectionIdToName[collection.id] = collection.name;
  });
}

export function setFieldCardinality(collectionName: string, fieldName: string, maxSelect: number) {
  const key = `${collectionName}:${fieldName}`;
  fieldNameToMaxSelect[key] = maxSelect;
}

/**
 * Convert the pocketbase field type to the equivalent typescript type
 */
export const pbSchemaTypescriptMap = {
  // Basic fields
  bool: "boolean",
  date: DATE_STRING_TYPE_NAME,
  autodate: DATE_STRING_TYPE_NAME,
  editor: HTML_STRING_NAME,
  email: "string",
  text: "string",
  url: "string",
  password: "string",
  number: "number",

  // Dependent on schema
  file: (fieldSchema: FieldSchema) =>
    fieldSchema.maxSelect && fieldSchema.maxSelect > 1 ? "string[]" : "string",
  json: (fieldSchema: FieldSchema) =>
    `null | ${fieldNameToGeneric(fieldSchema.name)}`,
  relation: (fieldSchema: FieldSchema, collectionName: string) => {
    let relatedCollectionName = "";
    
    if (fieldSchema.options?.collectionId) {
      // Try to get the collection name from our map first
      relatedCollectionName = collectionIdToName[fieldSchema.options.collectionId] || fieldSchema.options.collectionId;
    }
    
    const relatedCollectionType = relatedCollectionName 
      ? `${toPascalCase(relatedCollectionName)}Record` 
      : RECORD_ID_STRING_NAME;
    
    // Check maxSelect in both field options and base field properties
    // Also check our manual override if needed
    const key = `${collectionName}:${fieldSchema.name}`;
    const manualMaxSelect = fieldNameToMaxSelect[key];
    
    if (manualMaxSelect !== undefined) {
      // Use manual override if set
      return manualMaxSelect === 1 ? relatedCollectionType : `${relatedCollectionType}[]`;
    }
    
    // First check options.maxSelect, then fall back to field.maxSelect
    const maxSelect = fieldSchema.options?.maxSelect !== undefined 
      ? fieldSchema.options.maxSelect 
      : fieldSchema.maxSelect;
    
    // If maxSelect is explicitly 1 or not set (undefined/null), return single type
    // otherwise return array type
    return maxSelect && maxSelect > 1
      ? `${relatedCollectionType}[]`
      : relatedCollectionType;
  },
  select: (fieldSchema: FieldSchema, collectionName: string) => {
    // pocketbase v0.8+ values are required
    const valueType = fieldSchema.values
      ? getOptionEnumName(collectionName, fieldSchema.name)
      : "string"
    return fieldSchema.maxSelect && fieldSchema.maxSelect > 1
      ? `${valueType}[]`
      : valueType
  },

  // DEPRECATED: PocketBase v0.8 does not have a dedicated user relation
  user: (fieldSchema: FieldSchema) =>
    fieldSchema.maxSelect && fieldSchema.maxSelect > 1
      ? `${RECORD_ID_STRING_NAME}[]`
      : RECORD_ID_STRING_NAME,
}

export function createTypeField(
  collectionName: string,
  fieldSchema: FieldSchema
): string {
  let typeStringOrFunc:
    | string
    | ((fieldSchema: FieldSchema, collectionName: string) => string)

  if (!(fieldSchema.type in pbSchemaTypescriptMap)) {
    console.log(`WARNING: unknown type "${fieldSchema.type}" found in schema`)
    typeStringOrFunc = "unknown"
  } else {
    typeStringOrFunc =
      pbSchemaTypescriptMap[
        fieldSchema.type as keyof typeof pbSchemaTypescriptMap
      ]
  }

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
  fields: Array<FieldSchema>
): string {
  const selectFields = fields.filter((field) => field.type === "select")
  const typestring = selectFields
    .map(
      (field) => `export enum ${getOptionEnumName(recordName, field.name)} {
${getOptionValues(field)
  .map((val) => `\t"${getSelectOptionEnumName(val)}" = "${val}",`)
  .join("\n")}
}\n`
    )
    .join("\n")
  return typestring
}

export function getSelectOptionEnumName(val: string) {
  if (!isNaN(Number(val))) {
    // The value is a number, which cannot be used as an enum name
    return `E${val}`
  } else {
    return val
  }
}
