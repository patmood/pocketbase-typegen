#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/index.ts
var import_fs = require("fs");

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
var import_sqlite = require("sqlite");
var import_commander = require("commander");
var import_sqlite3 = __toESM(require("sqlite3"), 1);

// package.json
var version = "1.0.1";

// src/index.ts
async function main(dbPath, outPath) {
  const db = await (0, import_sqlite.open)({
    filename: dbPath,
    driver: import_sqlite3.default.Database
  });
  const results = await db.all("SELECT * FROM _collections");
  const typeString = generate(results);
  await import_fs.promises.writeFile(outPath, typeString, "utf8");
  console.log(`Created typescript definitions at ${outPath}`);
}
import_commander.program.name("Pocketbase Typegen").version(version).description(
  "CLI to create typescript typings for your pocketbase.io records"
).requiredOption("-d, --db <char>", "path to the pocketbase SQLite database").option(
  "-o, --out <char>",
  "path to save the typescript output file",
  "pocketbase-types.ts"
);
import_commander.program.parse(process.argv);
var options = import_commander.program.opts();
main(options.db, options.out);
