import assert from "node:assert"
import fs from "fs/promises"

// Known good types from repo
const controlTypes = await fs.readFile("pocketbase-types-example.ts", {
  encoding: "utf8",
})

async function testCreateFromUrl() {
  const typesFromUrl = await fs.readFile("pocketbase-types-url.ts", {
    encoding: "utf8",
  })
  assert.equal(typesFromUrl, controlTypes)
}

async function testCreateFromDb() {
  const typesFromDb = await fs.readFile("pocketbase-types-db.ts", {
    encoding: "utf8",
  })
  assert.equal(typesFromDb, controlTypes)
}

await testCreateFromUrl()
await testCreateFromDb()

console.log("Integration tests pass")
