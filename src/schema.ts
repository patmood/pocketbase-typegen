import { promises as fs } from "fs"
import { open } from "sqlite"
import sqlite3 from "sqlite3"

export async function fromDatabase(dbPath: string) {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  })
  const result = await db.all("SELECT * FROM _collections")
  return result.map((collection) => ({
    ...collection,
    schema: JSON.parse(collection.schema),
  }))
}

export async function fromJSON(path: string) {
  const schemaStr = await fs.readFile(path, { encoding: "utf8" })
  return JSON.parse(schemaStr)
}

export async function fromAPI() {
  throw "not implemented"
}
