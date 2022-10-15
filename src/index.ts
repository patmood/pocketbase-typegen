#!/usr/bin/env node

import type { CollectionRecord, Options } from "./types"
import { fromDatabase, fromJSON } from "./schema"
import { generate, saveFile } from "./lib"

import { program } from "commander"
import { version } from "../package.json"

async function main(options: Options) {
  let schema: Array<CollectionRecord>
  if (options.db) {
    schema = await fromDatabase(options.db)
  } else if (options.json) {
    schema = await fromJSON(options.json)
  } else {
    return console.error(
      "Missing schema path. Check options: pocketbase-typegen --help"
    )
  }
  console.log(schema)
  const typeString = generate(schema)
  await saveFile(options.out, typeString)
}

program
  .name("Pocketbase Typegen")
  .version(version)
  .description(
    "CLI to create typescript typings for your pocketbase.io records"
  )
  .option("-d, --db <char>", "path to the pocketbase SQLite database")
  .option(
    "-j, --json <char>",
    "path to JSON schema exported from pocketbase admin UI"
  )
  .option(
    "-o, --out <char>",
    "path to save the typescript output file",
    "pocketbase-types.ts"
  )

program.parse(process.argv)
const options = program.opts<Options>()
main(options)
