import { CollectionRecord, RecordSchema } from "./types"

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
  file: "string",
  files: "string[]",
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

  const fileParts = [
    `// Generated using pocketbase-typegen`,
    createCollectionEnum(collectionNames),
    createCollectionRecord(collectionNames),
    ...recordTypes,
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
  schema.forEach((field: RecordSchema) => {
    const pbType =
      field.type === "file" &&
      field.options.maxSelect &&
      field.options.maxSelect > 1
        ? "files"
        : field.type
    typeString += createTypeField(field.name, field.required, pbType)
  })
  typeString += `}`
  return typeString
}

export function createTypeField(
  name: string,
  required: boolean,
  pbType: string
) {
  if (pbType in pbSchemaTypescriptMap) {
    return `\t${name}${required ? "" : "?"}: ${
      pbSchemaTypescriptMap[pbType as keyof typeof pbSchemaTypescriptMap]
    }\n`
  } else {
    throw new Error(`unknown type ${pbType} found in schema`)
  }
}

export async function saveFile(outPath: string, typeString: string) {
  await fs.writeFile(outPath, typeString, "utf8")
  console.log(`Created typescript definitions at ${outPath}`)
}
