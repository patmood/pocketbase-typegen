import { promises as fs } from "fs"
import { open } from "sqlite"
import sqlite3 from "sqlite3"
import { toPascalCase } from "./utils"

async function openDb(dbPath: string) {
  return open({
    filename: dbPath,
    driver: sqlite3.Database,
  })
}

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

async function generate(dbPath: string) {
  const db = await openDb(dbPath)
  const results = await db.all("SELECT * FROM _collections")
  const collectionNames: Array<string> = []
  const recordTypes: Array<string> = []

  results.forEach((row) => {
    if (row.name) collectionNames.push(row.name)
    if (row.schema) recordTypes.push(createRecordType(row.name, row.schema))
  })

  const fileParts = [
    `// Generated using pocketbase-typegen\n`,
    createCollectionEnum(collectionNames),
    ...recordTypes,
  ]

  return fileParts.join("\n")
}

function createCollectionEnum(collectionNames: Array<string>) {
  let typeString = `export enum Collections {\n`
  collectionNames.forEach((name) => {
    typeString += `\t${toPascalCase(name)} = "${name}",\n`
  })
  typeString += `}\n`
  return typeString
}

function createRecordType(name: string, schema: string): string {
  let typeString = `export type ${toPascalCase(name)}Record = {\n`
  JSON.parse(schema).forEach((field) => {
    typeString += `\t${field.name}${field.required ? "" : "?"}: ${
      pbSchemaTypescriptMap[field.type]
    };\n`
  })
  typeString += `}\n`
  return typeString
}

async function main() {
  const typeString = await generate("data.db")
  await fs.writeFile("pocketbase-types.ts", typeString, "utf8")

  console.log(typeString)
}

main()
