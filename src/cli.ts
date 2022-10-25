import type { CollectionRecord, Options } from "./types"
import { fromDatabase, fromJSON, fromURL } from "./schema"

import { generate } from "./lib"
import { saveFile } from "./utils"

export async function main(options: Options) {
  let schema: Array<CollectionRecord>
  if (options.db) {
    schema = await fromDatabase(options.db)
  } else if (options.json) {
    schema = await fromJSON(options.json)
  } else if (options.url) {
    schema = await fromURL(options.url, options.email, options.password)
  } else {
    return console.error(
      "Missing schema path. Check options: pocketbase-typegen --help"
    )
  }
  const typeString = generate(schema)
  await saveFile(options.out, typeString)
  return typeString
}
