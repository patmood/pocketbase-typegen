#!/usr/bin/env node

import type { Options } from "./types"
import { main } from "./cli"
import { program } from "commander"
import { version } from "../package.json"

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
  .option('--includeMetadata', '"Generates a secondary file containing JavaScript objects that represent your schema\'s metadata, such as constraints and enums.')
  .option('--metadata-out <path>', 'Output path for metadata file', "pocketbase-metadata.ts")

program.parse(process.argv)
const options = program.opts<Options>()
main(options)
