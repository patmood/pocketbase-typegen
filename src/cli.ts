#!/usr/bin/env node

import dotenv from "dotenv-flow"

import type { CollectionRecord, Options } from "./types"
import {
  fromDatabase,
  fromJSON,
  fromURLWithPassword,
  fromURLWithToken,
} from "./schema"

import { generateFromSchema } from "./index"
import { saveFile } from "./utils"
import { program } from "commander"
import { version } from "../package.json"

type SchemaSource = {
  resolve: () => Promise<Array<CollectionRecord>>
}

function resolveFromEnv(options: Options): SchemaSource | null {
  dotenv.config(
    typeof options.env === "string" ? { path: options.env } : undefined
  )
  const url = process.env.PB_TYPEGEN_URL
  if (!url) return null
  if (process.env.PB_TYPEGEN_TOKEN) {
    return {
      resolve: () => fromURLWithToken(url, process.env.PB_TYPEGEN_TOKEN!),
    }
  }
  if (process.env.PB_TYPEGEN_EMAIL && process.env.PB_TYPEGEN_PASSWORD) {
    return {
      resolve: () =>
        fromURLWithPassword(
          url,
          process.env.PB_TYPEGEN_EMAIL,
          process.env.PB_TYPEGEN_PASSWORD
        ),
    }
  }
  return null
}

function resolveSchemaSource(options: Options): SchemaSource | null {
  if (options.db) return { resolve: () => fromDatabase(options.db!) }
  if (options.json) return { resolve: () => fromJSON(options.json!) }
  if (options.url && options.token)
    return { resolve: () => fromURLWithToken(options.url!, options.token!) }
  if (options.url)
    return {
      resolve: () =>
        fromURLWithPassword(options.url!, options.email, options.password),
    }
  if (options.env) return resolveFromEnv(options)
  return null
}

program
  .name("Pocketbase Typegen")
  .version(version)
  .description(
    "CLI to create typescript typings for your pocketbase.io records."
  )
  .option(
    "-u, --url <url>",
    "URL to your hosted pocketbase instance. When using this options you must also provide email and password options or auth token option."
  )
  .option(
    "--email <email>",
    "Email for a pocketbase superuser. Use this with the --url option."
  )
  .option(
    "-p, --password <password>",
    "Password for a pocketbase superuser. Use this with the --url option."
  )
  .option(
    "-t, --token <token>",
    "Auth token for a pocketbase superuser. Use this with the --url option."
  )
  .option("-d, --db <path>", "Path to the pocketbase SQLite database.")
  .option(
    "-j, --json <path>",
    "Path to JSON schema exported from pocketbase admin UI."
  )
  .option(
    "--env [dir]",
    "Use environment variables for configuration. Add PB_TYPEGEN_URL, PB_TYPEGEN_EMAIL, PB_TYPEGEN_PASSWORD to your .env file. Optionally provide a path to a directory containing a .env file",
    true
  )
  .option(
    "-o, --out <path>",
    "Path to save the typescript output file.",
    "pocketbase-types.ts"
  )
  .option(
    "--no-sdk",
    "Removes the pocketbase package dependency. A typed version of the SDK will not be generated."
  )

program.parse(process.argv)
const options = program.opts<Options>()

async function main(options: Options) {
  const source = resolveSchemaSource(options)
  if (!source) {
    if (options.env) {
      console.error(
        "Missing PB_TYPEGEN_URL or PB_TYPEGEN_TOKEN environment variables"
      )
    } else {
      console.error(
        "Missing schema path. Check options: pocketbase-typegen --help"
      )
    }
    return
  }

  let schema: Array<CollectionRecord>
  try {
    schema = await source.resolve()
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    process.exit(1)
  }
  const typeString = generateFromSchema(schema, {
    sdk: options.sdk,
  })
  await saveFile(options.out, typeString)
  return typeString
}

main(options)
