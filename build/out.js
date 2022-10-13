// src/index.ts
import { promises as fs } from "fs";
import { open } from "../node_modules/sqlite/build/index.mjs";
import sqlite3 from "../node_modules/sqlite3/lib/sqlite3.js";

// src/utils.ts
function toPascalCase(string) {
  return `${string}`.toLowerCase().replace(new RegExp(/[-_]+/, "g"), " ").replace(new RegExp(/[^\w\s]/, "g"), "").replace(
    new RegExp(/\s+(.)(\w*)/, "g"),
    (_, $2, $3) => `${$2.toUpperCase() + $3}`
  ).replace(new RegExp(/\w/), (s) => s.toUpperCase());
}

// src/index.ts
async function openDb(dbPath) {
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}
var pbSchemaTypescriptMap = {
  text: "string",
  number: "number",
  bool: "boolean",
  email: "string",
  url: "string",
  date: "string",
  select: "string",
  json: "string",
  file: "string",
  relation: "string",
  user: "string"
};
async function generate(dbPath) {
  const db = await openDb(dbPath);
  const results = await db.all("SELECT * FROM _collections");
  const collectionNames = [];
  const recordTypes = [];
  results.forEach((row) => {
    if (row.name)
      collectionNames.push(row.name);
    if (row.schema)
      recordTypes.push(createRecordType(row.name, row.schema));
  });
  const fileParts = [
    `// Generated using pocketbase-typegen
`,
    createCollectionEnum(collectionNames),
    ...recordTypes
  ];
  return fileParts.join("\n");
}
function createCollectionEnum(collectionNames) {
  let typeString = `export enum Collections {
`;
  collectionNames.forEach((name) => {
    typeString += `	${toPascalCase(name)} = "${name}",
`;
  });
  typeString += `}
`;
  return typeString;
}
function createRecordType(name, schema) {
  let typeString = `export type ${toPascalCase(name)}Record = {
`;
  JSON.parse(schema).forEach((field) => {
    typeString += `	${field.name}${field.required ? "" : "?"}: ${pbSchemaTypescriptMap[field.type]};
`;
  });
  typeString += `}
`;
  return typeString;
}
async function main() {
  const typeString = await generate("data.db");
  await fs.writeFile("pocketbase-types.ts", typeString, "utf8");
  console.log(typeString);
}
main();
