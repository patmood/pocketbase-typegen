import { CollectionRecord } from "./types"
import FormData from "form-data"
import fetch from "cross-fetch"
import { promises as fs } from "fs"
import Database from "better-sqlite3"

export async function fromDatabase(
  dbPath: string
): Promise<Array<CollectionRecord>> {
  const db = new Database(dbPath, { readonly: true })

  const result = db.prepare("SELECT * FROM _collections").all() as Array<
    CollectionRecord & { fields?: string; schema?: string }
  >
  db.close()
  return result.map((collection) => ({
    ...collection,
    fields: JSON.parse(collection.fields ?? collection.schema ?? "{}"),
  }))
}

export async function fromJSON(path: string): Promise<Array<CollectionRecord>> {
  const schemaStr = await fs.readFile(path, { encoding: "utf8" })
  return JSON.parse(schemaStr)
}

export async function fromURLWithToken(
  url: string,
  token: string = ""
): Promise<Array<CollectionRecord>> {
  let collections: Array<CollectionRecord> = []
  try {
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

export async function fromURLWithPassword(
  url: string,
  email = "",
  password = ""
): Promise<Array<CollectionRecord>> {
  const formData = new FormData()
  formData.append("identity", email)
  formData.append("password", password)

  let token: string
  try {
    // Login
    const response = await fetch(
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

    token = response.token
  } catch (error) {
    console.error(error)
    process.exit(1)
  }

  return await fromURLWithToken(url, token)
}
