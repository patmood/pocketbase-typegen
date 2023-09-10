import { CollectionRecord } from "./types"
import FormData from "form-data"
import fetch from "cross-fetch"
import { promises as fs } from "fs"
import { open } from "sqlite"
import sqlite3 from "sqlite3"

async function getCollectionsIsomorphic(dbPath: string): Promise<any[]> {
  try {
    // @ts-expect-error using the bun-types package makes a lot of stuff error
    const { Database } = await import("bun:sqlite")
    const db = new Database(dbPath)
    const query = db.query("SELECT * FROM _collections")

    return query.all()
  } catch (error) {
    const db = await open({
      driver: sqlite3.Database,
      filename: dbPath,
    })

    return await db.all("SELECT * FROM _collections")
  }
}

export async function fromDatabase(
  dbPath: string
): Promise<Array<CollectionRecord>> {
  const result = await getCollectionsIsomorphic(dbPath)
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
  let collections: Array<CollectionRecord> = []
  try {
    // Login
    const { token } = await fetch(`${url}/api/admins/auth-with-password`, {
      // @ts-ignore
      body: formData,
      method: "post",
    }).then((res) => {
      if (!res.ok) throw res
      return res.json()
    })

    // Get the collections
    const result = await fetch(`${url}/api/collections?perPage=200`, {
      headers: {
        Authorization: token,
      },
    }).then((res) => {
      if (!res.ok) throw res
      return res.json()
    })
    collections = result.items
  } catch (error) {
    console.error(error)
    process.exit(1)
  }

  return collections
}
