import { CollectionRecord } from "./types"
import FormData from "form-data"
import fetch from "cross-fetch"
import { promises as fs } from "fs"
import { open } from "sqlite"
import sqlite3 from "sqlite3"

export async function fromDatabase(
  dbPath: string
): Promise<Array<CollectionRecord>> {
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

export async function fromJSON(path: string): Promise<Array<CollectionRecord>> {
  const schemaStr = await fs.readFile(path, { encoding: "utf8" })
  return JSON.parse(schemaStr)
}

export async function fromURL(
  url: string,
  email = "",
  password = ""
): Promise<Array<CollectionRecord>> {
  const formData = new FormData()
  formData.append("identity", email)
  formData.append("password", password)

  // Login
  const { token } = await fetch(`${url}/api/admins/auth-with-password`, {
    method: "post",
    // @ts-ignore
    body: formData,
  }).then((res) => res.json())

  // Get the collection
  const result = await fetch(`${url}/api/collections?perPage=200`, {
    headers: {
      Authorization: token,
    },
  }).then((res) => res.json())

  return result.items as Array<CollectionRecord>
}
