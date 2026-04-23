import { expect, it } from "vitest"

import { promises as fs } from "fs"
import { generateFromSchema } from "../src/index"
import { fromJSON } from "../src/schema"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

it("creates a type file from json schema", async () => {
  const out = path.resolve(__dirname, "pocketbase-types-example.ts")
  const schema = await fromJSON(path.resolve(__dirname, "pb_schema.json"))
  const result = generateFromSchema(schema)

  await fs.writeFile(out, result, { encoding: "utf-8" })
  expect(result).toMatchSnapshot()
})
