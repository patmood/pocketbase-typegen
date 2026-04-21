import assert from "node:assert"
import fs from "fs/promises"

// Known good types from repo
const controlTypes = await fs.readFile("../pocketbase-types-example.ts", {
  encoding: "utf8",
})

// Node tests
async function testCreateFromUrl() {
  const typesFromUrl = await fs.readFile("./output/pocketbase-types-url.ts", {
    encoding: "utf8",
  })
  assert.equal(typesFromUrl, controlTypes)
}

async function testCreateFromEnv() {
  const typesFromEnv = await fs.readFile("./output/pocketbase-types-env.ts", {
    encoding: "utf8",
  })
  assert.equal(typesFromEnv, controlTypes)
}

async function testCreateFromDb() {
  const typesFromDb = await fs.readFile("./output/pocketbase-types-db.ts", {
    encoding: "utf8",
  })
  assert.equal(typesFromDb, controlTypes)
}

// Bun tests
async function testBunCreateFromUrl() {
  const typesFromUrl = await fs.readFile(
    "./output/bun-pocketbase-types-url.ts",
    { encoding: "utf8" }
  )
  assert.equal(typesFromUrl, controlTypes)
}

async function testBunCreateFromEnv() {
  const typesFromEnv = await fs.readFile(
    "./output/bun-pocketbase-types-env.ts",
    { encoding: "utf8" }
  )
  assert.equal(typesFromEnv, controlTypes)
}

async function testBunCreateFromDb() {
  const typesFromDb = await fs.readFile(
    "./output/bun-pocketbase-types-db.ts",
    { encoding: "utf8" }
  )
  assert.equal(typesFromDb, controlTypes)
}

console.log("Checking Node outputs...")
await testCreateFromUrl()
await testCreateFromDb()
await testCreateFromEnv()

console.log("Checking Bun outputs...")
await testBunCreateFromUrl()
await testBunCreateFromDb()
await testBunCreateFromEnv()
