import { CollectionRecord } from "./types"
import { promises as fs } from "fs"
import { getSQLiteAdapter } from "./sqlite"
import { fetchWithAuth, loginAndFetch } from "./http"

export async function fromDatabase(
  dbPath: string
): Promise<Array<CollectionRecord>> {
  const adapter = await getSQLiteAdapter()
  const result = adapter.queryAll(dbPath, "SELECT * FROM _collections") as Array<
    CollectionRecord & { fields?: string; schema?: string }
  >
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
  try {
    const result = (await fetchWithAuth(
      `${url}/api/collections?perPage=200`,
      token
    )) as { items: Array<CollectionRecord> }
    return result.items
  } catch (error) {
    throw new Error(`Failed to load schema from URL: ${error}`)
  }
}

export async function fromURLWithPassword(
  url: string,
  email = "",
  password = ""
): Promise<Array<CollectionRecord>> {
  try {
    const result = (await loginAndFetch(
      url,
      email,
      password
    )) as { items: Array<CollectionRecord> }
    return result.items
  } catch (error) {
    throw new Error(`Failed to load schema from URL: ${error}`)
  }
}
