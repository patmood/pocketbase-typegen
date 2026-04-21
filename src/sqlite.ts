export interface SQLiteRow {
  [key: string]: unknown
}

export interface SQLiteAdapter {
  queryAll(dbPath: string, sql: string): SQLiteRow[]
}

const isBun =
  typeof (globalThis as Record<string, unknown>).Bun !== "undefined"

async function createNodeAdapter(): Promise<SQLiteAdapter> {
  const BetterSqlite3 = (await import("better-sqlite3")).default
  return {
    queryAll(dbPath: string, sql: string): SQLiteRow[] {
      const db = new BetterSqlite3(dbPath, { readonly: true })
      const rows = db.prepare(sql).all() as SQLiteRow[]
      db.close()
      return rows
    },
  }
}

async function createBunAdapter(): Promise<SQLiteAdapter> {
  // @ts-ignore: bun:sqlite is only available in the Bun runtime
  const { Database } = await import("bun:sqlite")
  return {
    queryAll(dbPath: string, sql: string): SQLiteRow[] {
      const db = new Database(dbPath, { readonly: true })
      const rows = db.prepare(sql).all() as SQLiteRow[]
      db.close()
      return rows
    },
  }
}

export async function getSQLiteAdapter(): Promise<SQLiteAdapter> {
  if (isBun) {
    return createBunAdapter()
  }
  return createNodeAdapter()
}
