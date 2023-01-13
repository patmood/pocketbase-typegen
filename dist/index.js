#!/usr/bin/env node

// src/schema.ts
import FormData from "form-data";
import fetch from "cross-fetch";
import { promises as fs } from "fs";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
async function fromDatabase(dbPath) {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
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
    method: "post",
    body: formData
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
var EXPAND_TYPE_COMMENT = `// Expand types are used to define the expand object in the PocketBase API`;
var DATE_STRING_TYPE_NAME = `IsoDateString`;
var RECORD_ID_STRING_NAME = `RecordIdString`;
var ALIAS_TYPE_DEFINITIONS = `// Alias types for improved usability
export type ${DATE_STRING_TYPE_NAME} = string
export type ${RECORD_ID_STRING_NAME} = string`;
var BASE_SYSTEM_FIELDS_DEFINITION = `// System fields
export type BaseSystemFields<T> = {
	id: ${RECORD_ID_STRING_NAME}
	created: ${DATE_STRING_TYPE_NAME}
	updated: ${DATE_STRING_TYPE_NAME}
	collectionId: string
	collectionName: Collections
	expand?: T extends object ? T : never
}`;
var AUTH_SYSTEM_FIELDS_DEFINITION = `export type AuthSystemFields = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
}`;

// src/generics.ts
function fieldNameToGeneric(name) {
  return `T${name}`;
}
function getGenericArgList(schema) {
  const jsonFields = schema.filter((field) => field.type === "json").map((field) => fieldNameToGeneric(field.name)).sort();
  return jsonFields;
}
function getGenericArgString(schema) {
  const argList = getGenericArgList(schema);
  if (argList.length === 0)
    return "";
  return `<${argList.map((name) => `${name}`).join(", ")}>`;
}
function getGenericArgStringWithDefault(schema) {
  const argList = getGenericArgList(schema);
  if (argList.length === 0)
    return "";
  return `<${argList.map((name) => `${name} = unknown`).join(", ")}>`;
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
function getOptionEnumName(recordName, fieldName) {
  return `${toPascalCase(recordName)}${toPascalCase(fieldName)}Options`;
}
function getOptionValues(field) {
  const values = field.options.values;
  if (!values)
    return [];
  return values.filter((val, i) => values.indexOf(val) === i);
}

// src/lib.ts
var pbSchemaTypescriptMap = {
  text: "string",
  number: "number",
  bool: "boolean",
  email: "string",
  url: "string",
  date: DATE_STRING_TYPE_NAME,
  select: (fieldSchema, collectionName) => {
    const valueType = fieldSchema.options.values ? getOptionEnumName(collectionName, fieldSchema.name) : "string";
    return fieldSchema.options.maxSelect && fieldSchema.options.maxSelect > 1 ? `${valueType}[]` : valueType;
  },
  json: (fieldSchema) => `null | ${fieldNameToGeneric(fieldSchema.name)}`,
  file: (fieldSchema) => fieldSchema.options.maxSelect && fieldSchema.options.maxSelect > 1 ? "string[]" : "string",
  relation: (fieldSchema) => fieldSchema.options.maxSelect && fieldSchema.options.maxSelect === 1 ? RECORD_ID_STRING_NAME : `${RECORD_ID_STRING_NAME}[]`,
  user: (fieldSchema) => fieldSchema.options.maxSelect && fieldSchema.options.maxSelect > 1 ? `${RECORD_ID_STRING_NAME}[]` : RECORD_ID_STRING_NAME
};
function generate(results) {
  const collectionNames = [];
  const recordTypes = [];
  const expandTypes = [EXPAND_TYPE_COMMENT];
  const responseTypes = [RESPONSE_TYPE_COMMENT];
  results.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  }).forEach((row) => {
    if (row.name)
      collectionNames.push(row.name);
    if (row.schema) {
      recordTypes.push(createRecordType(row.name, row.schema));
      responseTypes.push(createResponseType(row));
      expandTypes.push(createExpandType(results, row));
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
    expandTypes.join("\n"),
    responseTypes.join("\n"),
    createCollectionRecords(sortedCollectionNames)
  ];
  return fileParts.join("\n\n");
}
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
function createRecordType(name, schema) {
  const selectOptionEnums = createSelectOptions(name, schema);
  const typeName = toPascalCase(name);
  const genericArgs = getGenericArgStringWithDefault(schema);
  const fields = schema.map((fieldSchema) => createTypeField(name, fieldSchema)).join("\n");
  return `${selectOptionEnums}export type ${typeName}Record${genericArgs} = {
${fields}
}`;
}
function createResponseType(collectionSchemaEntry) {
  const { name, schema, type } = collectionSchemaEntry;
  const pascaleName = toPascalCase(name);
  const genericArgsWithDefaults = getGenericArgStringWithDefault(schema);
  const genericArgs = getGenericArgString(schema);
  return `export type ${pascaleName}Response${genericArgsWithDefaults} = ${pascaleName}Record${genericArgs} & BaseSystemFields<${pascaleName}ExpandType>${type === "auth" ? " & AuthSystemFields" : ""}`;
}
function createExpandType(allRecords, targetRecord) {
  const [directExpandTypes, directExpandConsts] = createDirectExpand(
    allRecords,
    targetRecord
  );
  const [indirectExpandTypes, indirectExpandConsts] = createIndirectExpand(
    allRecords,
    targetRecord
  );
  const expandTypes = [...directExpandTypes, ...indirectExpandTypes];
  const expandConsts = [...directExpandConsts, ...indirectExpandConsts];
  const hasExpandTypes = expandTypes.length > 0;
  const pascaleName = toPascalCase(targetRecord.name);
  const expandTypesString = `type ${pascaleName}ExpandType = {
${hasExpandTypes ? expandTypes.join("\n") : "	// Doesn't have any relation"}
}`;
  const expandConstString = hasExpandTypes && `export const ${pascaleName}Expand = {
  ${expandConsts.join(",\n")}
}`;
  return [expandTypesString, expandConstString].filter(Boolean).join("\n");
}
function createDirectExpand(allRecords, targetRecord) {
  const expandTypes = [];
  const expandConsts = [];
  targetRecord.schema.filter(({ type }) => type === "relation").forEach(({ name, options: options2 }) => {
    const expandedRecord = allRecords.find(
      (record) => record.id === (options2 == null ? void 0 : options2.collectionId)
    );
    if (!expandedRecord) {
      return;
    }
    const expandType = options2.maxSelect && options2.maxSelect > 1 ? `${toPascalCase(expandedRecord.name)}Response[]` : `${toPascalCase(expandedRecord.name)}Response`;
    expandTypes.push(`	${name}: ${expandType}`);
    const expandConst = `	${name}: "${name}"`;
    expandConsts.push(expandConst);
  });
  return [expandTypes, expandConsts];
}
function createIndirectExpand(allRecords, targetRecord) {
  const expandTypes = [];
  const expandConsts = [];
  allRecords.forEach((record) => {
    record.schema.filter((field) => field.type === "relation").forEach((field) => {
      var _a;
      if (((_a = field.options) == null ? void 0 : _a.collectionId) !== targetRecord.id) {
        return;
      }
      if (field.options.maxSelect && field.options.maxSelect > 1) {
        return;
      }
      const expandKeyName = `${record.name}(${field.name})`;
      expandTypes.push(
        `	"${expandKeyName}": ${toPascalCase(record.name)}Response[]`
      );
      expandConsts.push(`	${record.name}: "${expandKeyName}"`);
    });
  });
  return [expandTypes, expandConsts];
}
function createTypeField(collectionName, fieldSchema) {
  if (!(fieldSchema.type in pbSchemaTypescriptMap)) {
    throw new Error(`unknown type ${fieldSchema.type} found in schema`);
  }
  const typeStringOrFunc = pbSchemaTypescriptMap[fieldSchema.type];
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
var version = "1.1.2";

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
