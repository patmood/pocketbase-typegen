import { open } from "sqlite"
import sqlite3 from "sqlite3"

export async function fromDatabase(dbPath: string) {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  })
  const schema = await db.all("SELECT * FROM _collections")
  return schema
}

export async function fromJSON() {
  throw "not implemented"
}

export async function fromAPI() {
  throw "not implemented"
}
