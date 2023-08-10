#!/usr/bin/env node

import type { Options } from "./types"
import { main } from "./cli"
import { program } from "commander"
import { version } from "../package.json"

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
  .option(
    "-w, --watch",
    "watch for changes in the database and automatically regenerate types, does not work with --json"
  )
  .option(
    "-i, --interval <number>",
    "interval in ms to check for changes in watch mode, defaults to 5000"
  )
  .option(
    "--hook <char>",
    "custom hook url for checking changes, should return json with timestamp of last change, use with --watch"
  )

program.parse(process.argv)
const options = program.opts<Options>()
// intitial watch mode check
if (options.watch) {
  if (!options.interval) {
    options.interval = 5000
  }
  if (options.hook == "") {
    console.error("Hook url must not be empty when using --watch")
    process.exit(1)
  }
  if (options.json) {
    console.error(
      "Cannot use --watch with --json. Check options: pocketbase-typegen --help"
    )
    process.exit(1)
  }
}
main(options)
if (options.watch) {
  console.log("[pocketbase-typegen] watching for changes...")
  let lastTime = Date.now()
  setInterval(async () => {
    if (!options.hook) {
      main(options)
      return console.log("[pocketbase-typegen] synchronizing changes")
    }
    try {
      const res = await fetch(options.hook, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (res.status !== 200) {
        return console.log(
          "[pocketbase-typegen] error synchronizing changes, skipping"
        )
      }
      const data = await res.json()
      if (data.timestamp > lastTime) {
        lastTime = data.timestamp
        main(options)
        console.log("[pocketbase-typegen] synchronizing changes")
      }
    } catch (err) {
      console.log("[pocketbase-typegen] error synchronizing changes, skipping")
      console.error(err)
    }
  }, options.interval)
}
