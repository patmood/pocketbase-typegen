#!/usr/bin/env node

import { generate, saveFile } from "./lib"

import { fromDatabase } from "./schema"
import { program } from "commander"
import { version } from "../package.json"

async function main(dbPath: string, outPath: string) {
  const schema = await fromDatabase(dbPath)
  const typeString = generate(schema)
  await saveFile(outPath, typeString)
}

program
  .name("Pocketbase Typegen")
  .version(version)
  .description(
    "CLI to create typescript typings for your pocketbase.io records"
  )
  .requiredOption("-d, --db <char>", "path to the pocketbase SQLite database")
  .option(
    "-o, --out <char>",
    "path to save the typescript output file",
    "pocketbase-types.ts"
  )

program.parse(process.argv)
const options = program.opts()
main(options.db, options.out)
