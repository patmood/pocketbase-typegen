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
    driver: sqlite3.Database,
    filename: dbPath,
  })

  const result = await db.all("SELECT * FROM _collections")
  return result.map((collection) => ({
    ...collection,
    fields: JSON.parse(collection.schema),
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
    const { token } = await fetch(
      `${url}/api/collections/_superusers/auth-with-password`,
      {
        // @ts-ignore
        body: formData,
        method: "post",
      }
    ).then((res) => {
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
