#!/usr/bin/env node

// src/schema.ts
import FormData from "form-data";
import fetch from "cross-fetch";
import { promises as fs } from "fs";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
async function fromDatabase(dbPath) {
  const db = await open({
    driver: sqlite3.Database,
    filename: dbPath
  });
  const result = await db.all("SELECT * FROM _collections");
  return result.map((collection) => ({
    ...collection,
    schema: JSON.parse(collection.schema)
  }));
}
async function fromJSON(path) {
  const schemaStr = await fs.readFile(path, { encoding: "utf8" });
  return JSON.parse(schemaStr);
}
async function fromURL(url, email = "", password = "") {
  const formData = new FormData();
  formData.append("identity", email);
  formData.append("password", password);
  const { token } = await fetch(`${url}/api/admins/auth-with-password`, {
    body: formData,
    method: "post"
  }).then((res) => res.json());
  const result = await fetch(`${url}/api/collections?perPage=200`, {
    headers: {
      Authorization: token
    }
  }).then((res) => res.json());
  return result.items;
}

// src/constants.ts
var EXPORT_COMMENT = `/**
* This file was @generated using pocketbase-typegen
*/`;
var RECORD_TYPE_COMMENT = `// Record types for each collection`;
var RESPONSE_TYPE_COMMENT = `// Response types include system fields and match responses from the PocketBase API`;
var ALL_RECORD_RESPONSE_COMMENT = `// Types containing all Records and Responses, useful for creating typing helper functions`;
var EXPAND_GENERIC_NAME = "expand";
var DATE_STRING_TYPE_NAME = `IsoDateString`;
var RECORD_ID_STRING_NAME = `RecordIdString`;
var HTML_STRING_NAME = `HTMLString`;
var ALIAS_TYPE_DEFINITIONS = `// Alias types for improved usability
export type ${DATE_STRING_TYPE_NAME} = string
export type ${RECORD_ID_STRING_NAME} = string
export type ${HTML_STRING_NAME} = string`;
var BASE_SYSTEM_FIELDS_DEFINITION = `// System fields
export type BaseSystemFields<T = never> = {
	id: ${RECORD_ID_STRING_NAME}
	created: ${DATE_STRING_TYPE_NAME}
	updated: ${DATE_STRING_TYPE_NAME}
	collectionId: string
	collectionName: Collections
	expand?: T
}`;
var AUTH_SYSTEM_FIELDS_DEFINITION = `export type AuthSystemFields<T = never> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>`;

// src/generics.ts
function fieldNameToGeneric(name) {
  return `T${name}`;
}
function getGenericArgList(schema) {
  const jsonFields = schema.filter((field) => field.type === "json").map((field) => fieldNameToGeneric(field.name)).sort();
  return jsonFields;
}
function getGenericArgStringForRecord(schema) {
  const argList = getGenericArgList(schema);
  if (argList.length === 0)
    return "";
  return `<${argList.map((name) => `${name}`).join(", ")}>`;
}
function getGenericArgStringWithDefault(schema, opts) {
  const argList = getGenericArgList(schema);
  if (opts.includeExpand && canExpand(schema)) {
    argList.push(fieldNameToGeneric(EXPAND_GENERIC_NAME));
  }
  if (argList.length === 0)
    return "";
  return `<${argList.map((name) => `${name} = unknown`).join(", ")}>`;
}
function canExpand(schema) {
  return !!schema.find((field) => field.type === "relation");
}

// src/utils.ts
import { promises as fs2 } from "fs";
function toPascalCase(str) {
  if (/^[\p{L}\d]+$/iu.test(str)) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  return str.replace(
    /([\p{L}\d])([\p{L}\d]*)/giu,
    (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase()
  ).replace(/[^\p{L}\d]/giu, "");
}
function sanitizeFieldName(name) {
  return !isNaN(parseFloat(name.charAt(0))) ? `"${name}"` : name;
}
async function saveFile(outPath, typeString) {
  await fs2.writeFile(outPath, typeString, "utf8");
  console.log(`Created typescript definitions at ${outPath}`);
}
function getSystemFields(type) {
  switch (type) {
    case "auth":
      return "AuthSystemFields";
    default:
      return "BaseSystemFields";
  }
}
function getOptionEnumName(recordName, fieldName) {
  return `${toPascalCase(recordName)}${toPascalCase(fieldName)}Options`;
}
function getOptionValues(field) {
  const values = field.options.values;
  if (!values)
    return [];
  return values.filter((val, i) => values.indexOf(val) === i);
}

// src/collections.ts
function createCollectionEnum(collectionNames) {
  const collections = collectionNames.map((name) => `	${toPascalCase(name)} = "${name}",`).join("\n");
  const typeString = `export enum Collections {
${collections}
}`;
  return typeString;
}
function createCollectionRecords(collectionNames) {
  const nameRecordMap = collectionNames.map((name) => `	${name}: ${toPascalCase(name)}Record`).join("\n");
  return `export type CollectionRecords = {
${nameRecordMap}
}`;
}
function createCollectionResponses(collectionNames) {
  const nameRecordMap = collectionNames.map((name) => `	${name}: ${toPascalCase(name)}Response`).join("\n");
  return `export type CollectionResponses = {
${nameRecordMap}
}`;
}

// src/fields.ts
var pbSchemaTypescriptMap = {
  bool: "boolean",
  date: DATE_STRING_TYPE_NAME,
  editor: HTML_STRING_NAME,
  email: "string",
  text: "string",
  url: "string",
  number: "number",
  file: (fieldSchema) => fieldSchema.options.maxSelect && fieldSchema.options.maxSelect > 1 ? "string[]" : "string",
  json: (fieldSchema) => `null | ${fieldNameToGeneric(fieldSchema.name)}`,
  relation: (fieldSchema) => fieldSchema.options.maxSelect && fieldSchema.options.maxSelect === 1 ? RECORD_ID_STRING_NAME : `${RECORD_ID_STRING_NAME}[]`,
  select: (fieldSchema, collectionName) => {
    const valueType = fieldSchema.options.values ? getOptionEnumName(collectionName, fieldSchema.name) : "string";
    return fieldSchema.options.maxSelect && fieldSchema.options.maxSelect > 1 ? `${valueType}[]` : valueType;
  },
  user: (fieldSchema) => fieldSchema.options.maxSelect && fieldSchema.options.maxSelect > 1 ? `${RECORD_ID_STRING_NAME}[]` : RECORD_ID_STRING_NAME
};
function createTypeField(collectionName, fieldSchema) {
  let typeStringOrFunc;
  if (!(fieldSchema.type in pbSchemaTypescriptMap)) {
    console.log(`WARNING: unknown type "${fieldSchema.type}" found in schema`);
    typeStringOrFunc = "unknown";
  } else {
    typeStringOrFunc = pbSchemaTypescriptMap[fieldSchema.type];
  }
  const typeString = typeof typeStringOrFunc === "function" ? typeStringOrFunc(fieldSchema, collectionName) : typeStringOrFunc;
  const fieldName = sanitizeFieldName(fieldSchema.name);
  const required = fieldSchema.required ? "" : "?";
  return `	${fieldName}${required}: ${typeString}`;
}
function createSelectOptions(recordName, schema) {
  const selectFields = schema.filter((field) => field.type === "select");
  const typestring = selectFields.map(
    (field) => `export enum ${getOptionEnumName(recordName, field.name)} {
${getOptionValues(field).map((val) => `	"${val}" = "${val}",`).join("\n")}
}
`
  ).join("\n");
  return typestring;
}

// src/lib.ts
function generate(results) {
  const collectionNames = [];
  const recordTypes = [];
  const responseTypes = [RESPONSE_TYPE_COMMENT];
  results.sort((a, b) => a.name <= b.name ? -1 : 1).forEach((row) => {
    if (row.name)
      collectionNames.push(row.name);
    if (row.schema) {
      recordTypes.push(createRecordType(row.name, row.schema));
      responseTypes.push(createResponseType(row));
    }
  });
  const sortedCollectionNames = collectionNames;
  const fileParts = [
    EXPORT_COMMENT,
    createCollectionEnum(sortedCollectionNames),
    ALIAS_TYPE_DEFINITIONS,
    BASE_SYSTEM_FIELDS_DEFINITION,
    AUTH_SYSTEM_FIELDS_DEFINITION,
    RECORD_TYPE_COMMENT,
    ...recordTypes,
    responseTypes.join("\n"),
    ALL_RECORD_RESPONSE_COMMENT,
    createCollectionRecords(sortedCollectionNames),
    createCollectionResponses(sortedCollectionNames)
  ];
  return fileParts.join("\n\n");
}
function createRecordType(name, schema) {
  const selectOptionEnums = createSelectOptions(name, schema);
  const typeName = toPascalCase(name);
  const genericArgs = getGenericArgStringWithDefault(schema, {
    includeExpand: false
  });
  const fields = schema.map((fieldSchema) => createTypeField(name, fieldSchema)).join("\n");
  return `${selectOptionEnums}export type ${typeName}Record${genericArgs} = {
${fields}
}`;
}
function createResponseType(collectionSchemaEntry) {
  const { name, schema, type } = collectionSchemaEntry;
  const pascaleName = toPascalCase(name);
  const genericArgsWithDefaults = getGenericArgStringWithDefault(schema, {
    includeExpand: true
  });
  const genericArgsForRecord = getGenericArgStringForRecord(schema);
  const systemFields = getSystemFields(type);
  const expandArgString = canExpand(schema) ? `<T${EXPAND_GENERIC_NAME}>` : "";
  return `export type ${pascaleName}Response${genericArgsWithDefaults} = ${pascaleName}Record${genericArgsForRecord} & ${systemFields}${expandArgString}`;
}

// src/cli.ts
async function main(options2) {
  let schema;
  if (options2.db) {
    schema = await fromDatabase(options2.db);
  } else if (options2.json) {
    schema = await fromJSON(options2.json);
  } else if (options2.url) {
    schema = await fromURL(options2.url, options2.email, options2.password);
  } else {
    return console.error(
      "Missing schema path. Check options: pocketbase-typegen --help"
    );
  }
  const typeString = generate(schema);
  await saveFile(options2.out, typeString);
  return typeString;
}

// src/index.ts
import { program } from "commander";

// package.json
var version = "1.1.7";

// src/index.ts
program.name("Pocketbase Typegen").version(version).description(
  "CLI to create typescript typings for your pocketbase.io records"
).option("-d, --db <char>", "path to the pocketbase SQLite database").option(
  "-j, --json <char>",
  "path to JSON schema exported from pocketbase admin UI"
).option(
  "-u, --url <char>",
  "URL to your hosted pocketbase instance. When using this options you must also provide email and password options."
).option(
  "-e, --email <char>",
  "email for an admin pocketbase user. Use this with the --url option"
).option(
  "-p, --password <char>",
  "password for an admin pocketbase user. Use this with the --url option"
).option(
  "-o, --out <char>",
  "path to save the typescript output file",
  "pocketbase-types.ts"
);
program.parse(process.argv);
var options = program.opts();
main(options);
