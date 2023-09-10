#!/usr/bin/env node

import type { Options } from "./types"
import { main } from "./cli"
import { program } from "commander"
// import { version } from "../package.json"

program
  .name("Pocketbase Typegen")
  // .version(version)
  .description(
    "CLI to create typescript typings for your pocketbase.io records"
  )
  .option("-d, --db <char>", "path to the pocketbase SQLite database")
  .option(
    "-j, --json <char>",
    "path to JSON schema exported from pocketbase admin UI"
  )
  .option(
    "-u, --url <char>",
    "URL to your hosted pocketbase instance. When using this options you must also provide email and password options."
  )
  .option(
    "-e, --email <char>",
    "email for an admin pocketbase user. Use this with the --url option"
  )
  .option(
    "-p, --password <char>",
    "password for an admin pocketbase user. Use this with the --url option"
  )
  .option(
    "-o, --out <char>",
    "path to save the typescript output file",
    "pocketbase-types.ts"
  )
  .option(
    "-e, --env [path]",
    "flag to use environment variables for configuration. Add PB_TYPEGEN_URL, PB_TYPEGEN_EMAIL, PB_TYPEGEN_PASSWORD to your .env file. Optionally provide a path to your .env file"
  )

program.parse(process.argv)
const options = program.opts<Options>()
main(options)
