import { promises as fs } from "fs"
import { generate } from "./lib"
import { open } from "sqlite"
import sqlite3 from "sqlite3"

async function main() {
	const db = await open({
		filename: "test/test.db",
		driver: sqlite3.Database,
	})
	const results = await db.all("SELECT * FROM _collections")
	console.log(results)
	const typeString = generate(results)
	await fs.writeFile("pocketbase-types.ts", typeString, "utf8")

	// console.log(typeString)
}

main()
