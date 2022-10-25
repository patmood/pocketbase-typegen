import { promises as fs } from "fs"
import { main } from "../src/cli"
import path from "path"

it("creates a type file from json schema", async () => {
  const out = path.resolve(__dirname, "pocketbase-types-example.ts")
  const result = await main({
    out,
    json: path.resolve(__dirname, "pb_schema.json"),
  })

  const fileOutput = await fs.readFile(out, { encoding: "utf-8" })
  expect(fileOutput).toEqual(result)
  expect(fileOutput).toMatchSnapshot()
})
