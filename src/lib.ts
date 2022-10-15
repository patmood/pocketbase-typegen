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
  json: "string",
  file: "string",
  relation: "string",
  user: "string",
}

export function generate(results: Array<any>) {
  const collectionNames: Array<string> = []
  const recordTypes: Array<string> = []

  results.forEach((row) => {
    if (row.name) collectionNames.push(row.name)
    if (row.schema) recordTypes.push(createRecordType(row.name, row.schema))
  })

  const fileParts = [
    `// Generated using pocketbase-typegen`,
    createCollectionEnum(collectionNames),
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

export function createRecordType(name: string, schema: Array<any>): string {
  let typeString = `export type ${toPascalCase(name)}Record = {\n`
  schema.forEach((field: any) => {
    typeString += createTypeField(field.name, field.required, field.type)
  })
  typeString += `}`
  return typeString
}

export function createTypeField(
  name: string,
  required: boolean,
  pbType: keyof typeof pbSchemaTypescriptMap
) {
  return `\t${name}${required ? "" : "?"}: ${pbSchemaTypescriptMap[pbType]};\n`
}

export async function saveFile(outPath: string, typeString: string) {
  await fs.writeFile(outPath, typeString, "utf8")
  console.log(`Created typescript definitions at ${outPath}`)
}
