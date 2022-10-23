import { CollectionRecord, FieldSchema, RecordOptions } from "./types"
import { fieldNameToGeneric, getGenericArgString } from "./generics"
import { sanitizeFieldName, toPascalCase } from "./utils"

const pbSchemaTypescriptMap = {
  text: "string",
  number: "number",
  bool: "boolean",
  email: "string",
  url: "string",
  date: "string",
  select: (fieldSchema: FieldSchema) =>
    fieldSchema.options.values
      ? fieldSchema.options.values.map((val) => `"${val}"`).join(" | ")
      : "string",
  json: (fieldSchema: FieldSchema) =>
    `null | ${fieldNameToGeneric(fieldSchema.name)}`,
  file: (fieldSchema: FieldSchema) =>
    fieldSchema.options.maxSelect && fieldSchema.options.maxSelect > 1
      ? "string[]"
      : "string",
  relation: "string",
  user: "string",
}

export function generate(results: Array<CollectionRecord>) {
  const collectionNames: Array<string> = []
  const recordTypes: Array<string> = []

  results.forEach((row) => {
    if (row.name) collectionNames.push(row.name)
    if (row.schema) recordTypes.push(createRecordType(row.name, row.schema))
  })
  const sortedCollectionNames = collectionNames.sort()

  const fileParts = [
    `// This file was @generated using pocketbase-typegen`,
    createCollectionEnum(sortedCollectionNames),
    ...recordTypes.sort(),
    createCollectionRecord(sortedCollectionNames),
  ]

  return fileParts.join("\n\n")
}

export function createCollectionEnum(collectionNames: Array<string>) {
  let typeString = `export enum Collections {\n`
  collectionNames.forEach((name) => {
    typeString += `\t${toPascalCase(name)} = "${name}",\n`
  })
  typeString += `}`
  return typeString
}

export function createCollectionRecord(collectionNames: Array<string>) {
  let typeString = `export type CollectionRecords = {\n`
  collectionNames.forEach((name) => {
    typeString += `\t${name}: ${toPascalCase(name)}Record\n`
  })
  typeString += `}`
  return typeString
}

export function createRecordType(
  name: string,
  schema: Array<FieldSchema>
): string {
  let typeString = `export type ${toPascalCase(
    name
  )}Record${getGenericArgString(schema)} = {\n`
  schema.forEach((fieldSchema: FieldSchema) => {
    typeString += createTypeField(fieldSchema)
  })
  typeString += `}`
  return typeString
}

export function createTypeField(fieldSchema: FieldSchema) {
  if (!(fieldSchema.type in pbSchemaTypescriptMap)) {
    throw new Error(`unknown type ${fieldSchema.type} found in schema`)
  }
  const typeStringOrFunc =
    pbSchemaTypescriptMap[
      fieldSchema.type as keyof typeof pbSchemaTypescriptMap
    ]

  const typeString =
    typeof typeStringOrFunc === "function"
      ? typeStringOrFunc(fieldSchema)
      : typeStringOrFunc
  return `\t${sanitizeFieldName(fieldSchema.name)}${
    fieldSchema.required ? "" : "?"
  }: ${typeString}\n`
}
