import dotenv from "dotenv"

import type { CollectionRecord, Options } from "./types"
import { fromDatabase, fromJSON, fromURL } from "./schema"

import { generate, generatePydantic } from "./lib"
import { saveFile } from "./utils"

export async function main(options: Options) {
  let schema: Array<CollectionRecord>
  if (options.db) {
    schema = await fromDatabase(options.db)
  } else if (options.json) {
    schema = await fromJSON(options.json)
  } else if (options.url) {
    schema = await fromURL(options.url, options.email, options.password)
  } else if (options.env) {
    const path: string = typeof options.env === "string" ? options.env : ".env"
    dotenv.config({ path: path })
    if (
      !process.env.PB_TYPEGEN_URL ||
      !process.env.PB_TYPEGEN_EMAIL ||
      !process.env.PB_TYPEGEN_PASSWORD
    ) {
      return console.error(
        "Missing environment variables. Check options: pocketbase-typegen --help"
      )
    }
    schema = await fromURL(
      process.env.PB_TYPEGEN_URL,
      process.env.PB_TYPEGEN_EMAIL,
      process.env.PB_TYPEGEN_PASSWORD
    )
  } else {
    return console.error(
      "Missing schema path. Check options: pocketbase-typegen --help"
    )
  }

  if (options.pydantic) {
    if (options.out === "pocketbase-types.ts") {
      options.out = "pocketbase_models.py"
    }
    const pythonString = generatePydantic(schema)
    await saveFile(options.out, pythonString)
    return pythonString
  }

  const typeString = generate(schema, {
    sdk: options.sdk ?? true,
  })
  await saveFile(options.out, typeString)
  return typeString
}
