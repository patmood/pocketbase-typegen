#!/usr/bin/env node

import { promises as fs } from "fs"
import { generate } from "./lib"
import { open } from "sqlite"
import { program } from "commander"
import sqlite3 from "sqlite3"
import { version } from "../package.json"

async function main(dbPath, outPath) {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  })
  const results = await db.all("SELECT * FROM _collections")
  const typeString = generate(results)
  await fs.writeFile(outPath, typeString, "utf8")

  console.log(`Created typescript definitions at ${outPath}`)
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
