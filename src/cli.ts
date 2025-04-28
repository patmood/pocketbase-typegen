import dotenv from "dotenv-flow"

import type { CollectionRecord, Options } from "./types"
import {
  fromDatabase,
  fromJSON,
  fromURLWithPassword,
  fromURLWithToken,
} from "./schema"

import { generate } from "./lib"
import { saveFile } from "./utils"

export async function main(options: Options) {
  let schema: Array<CollectionRecord>
  if (options.db) {
    schema = await fromDatabase(options.db)
  } else if (options.json) {
    schema = await fromJSON(options.json)
  } else if (options.url && options.token) {
    schema = await fromURLWithToken(options.url, options.token)
  } else if (options.url) {
    schema = await fromURLWithPassword(
      options.url,
      options.email,
      options.password
    )
  } else if (options.env) {
    dotenv.config(
      typeof options.env === "string" ? { path: options.env } : undefined
    )
    if (!process.env.PB_TYPEGEN_URL) {
      return console.error("Missing PB_TYPEGEN_URL environment variable")
    }
    if (process.env.PB_TYPEGEN_TOKEN) {
      schema = await fromURLWithToken(
        process.env.PB_TYPEGEN_URL,
        process.env.PB_TYPEGEN_TOKEN
      )
    } else if (
      process.env.PB_TYPEGEN_EMAIL &&
      process.env.PB_TYPEGEN_PASSWORD
    ) {
      schema = await fromURLWithPassword(
        process.env.PB_TYPEGEN_URL,
        process.env.PB_TYPEGEN_EMAIL,
        process.env.PB_TYPEGEN_PASSWORD
      )
    } else {
      return console.error(
        "Missing PB_TYPEGEN_URL or PB_TYPEGEN_TOKEN environment variables"
      )
    }
  } else {
    return console.error(
      "Missing schema path. Check options: pocketbase-typegen --help"
    )
  }
  const typeString = generate(schema, {
    sdk: options.sdk ?? true,
  })
  await saveFile(options.out, typeString)
  return typeString
}
