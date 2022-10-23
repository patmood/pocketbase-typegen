import { CollectionRecord, RecordOptions, RecordSchema } from "./types"

import { promises as fs } from "fs"
import { toPascalCase } from "./utils"

const pbSchemaTypescriptMap = {
  text: "string",
  number: "number",
  bool: "boolean",
  email: "string",
  url: "string",
  date: "string",
  select: "string",
  json: "null | unknown",
  file: (opts: RecordOptions) =>
    opts.maxSelect && opts.maxSelect > 1 ? "string[]" : "string",
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
  schema: Array<RecordSchema>
): string {
  let typeString = `export type ${toPascalCase(name)}Record = {\n`
  schema.forEach((recordSchema: RecordSchema) => {
    typeString += createTypeField(recordSchema)
  })
  typeString += `}`
  return typeString
}

export function createTypeField(recordSchema: RecordSchema) {
  if (!(recordSchema.type in pbSchemaTypescriptMap)) {
    throw new Error(`unknown type ${recordSchema.type} found in schema`)
  }
  const typeStringOrFunc =
    pbSchemaTypescriptMap[
      recordSchema.type as keyof typeof pbSchemaTypescriptMap
    ]

  const typeString =
    typeof typeStringOrFunc === "function"
      ? typeStringOrFunc(recordSchema.options)
      : typeStringOrFunc
  return `\t${recordSchema.name}${
    recordSchema.required ? "" : "?"
  }: ${typeString}\n`
}

export async function saveFile(outPath: string, typeString: string) {
  await fs.writeFile(outPath, typeString, "utf8")
  console.log(`Created typescript definitions at ${outPath}`)
}
