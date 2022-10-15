#!/usr/bin/env node

// src/lib.ts
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
async function saveFile(outPath, typeString) {
  await fs.writeFile(outPath, typeString, "utf8");
  console.log(`Created typescript definitions at ${outPath}`);
}

// src/schema.ts
import { open } from "sqlite";
import sqlite3 from "sqlite3";
async function fromDatabase(dbPath) {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });
  const schema = await db.all("SELECT * FROM _collections");
  return schema;
}

// src/index.ts
import { program } from "commander";

// package.json
var version = "1.0.3";

// src/index.ts
async function main(dbPath, outPath) {
  const schema = await fromDatabase(dbPath);
  const typeString = generate(schema);
  await saveFile(outPath, typeString);
}
program.name("Pocketbase Typegen").version(version).description(
  "CLI to create typescript typings for your pocketbase.io records"
).requiredOption("-d, --db <char>", "path to the pocketbase SQLite database").option(
  "-o, --out <char>",
  "path to save the typescript output file",
  "pocketbase-types.ts"
);
program.parse(process.argv);
var options = program.opts();
main(options.db, options.out);
