// src/index.ts
import { promises as fs } from "fs";

// src/utils.ts
function toPascalCase(str) {
  if (/^[\p{L}\d]+$/iu.test(str)) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  return str.replace(
    /([\p{L}\d])([\p{L}\d]*)/giu,
    (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase()
  ).replace(/[^\p{L}\d]/giu, "");
}

// src/lib.ts
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
function generate(results) {
  const collectionNames = [];
  const recordTypes = [];
  results.forEach((row) => {
    if (row.name)
      collectionNames.push(row.name);
    if (row.schema)
      recordTypes.push(createRecordType(row.name, row.schema));
  });
  const fileParts = [
    `// Generated using pocketbase-typegen`,
    createCollectionEnum(collectionNames),
    ...recordTypes
  ];
  return fileParts.join("\n\n");
}
function createCollectionEnum(collectionNames) {
  let typeString = `export enum Collections {
`;
  collectionNames.forEach((name) => {
    typeString += `	${toPascalCase(name)} = "${name}",
`;
  });
  typeString += `}`;
  return typeString;
}
function createRecordType(name, schema) {
  let typeString = `export type ${toPascalCase(name)}Record = {
`;
  JSON.parse(schema).forEach((field) => {
    typeString += createTypeField(field.name, field.required, field.type);
  });
  typeString += `}`;
  return typeString;
}
function createTypeField(name, required, pbType) {
  return `	${name}${required ? "" : "?"}: ${pbSchemaTypescriptMap[pbType]};
`;
}

// src/index.ts
import { open } from "../node_modules/sqlite/build/index.mjs";
import sqlite3 from "../node_modules/sqlite3/lib/sqlite3.js";
async function main() {
  const db = await open({
    filename: "test/test.db",
    driver: sqlite3.Database
  });
  const results = await db.all("SELECT * FROM _collections");
  console.log(results);
  const typeString = generate(results);
  await fs.writeFile("pocketbase-types.ts", typeString, "utf8");
}
main();
