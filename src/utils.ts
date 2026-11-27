import { CollectionRecord, FieldSchema } from "./types"

import { promises as fs } from "fs"

export function toPascalCase(str: string) {
  if (/^[\p{L}\d]+$/iu.test(str)) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
  return str
    .replace(
      /([\p{L}\d])([\p{L}\d]*)/giu,
      (g0: string, g1: string, g2: string) =>
        g1.toUpperCase() + g2.toLowerCase()
    )
    .replace(/[^\p{L}\d]/giu, "")
}

export function sanitizeFieldName(name: string) {
  return /^[$_\p{ID_Start}][$\u200c\u200d\p{ID_Continue}]*$/u.test(name)
    ? name
    : JSON.stringify(name)
}

export function toCollectionIdentifier(name: string) {
  const identifier = toPascalCase(name)
  return /^\p{ID_Start}/u.test(identifier) ? identifier : `_${identifier}`
}

export function getUniqueNames(names: string[]) {
  const reserved = new Set(names)
  const used = new Set<string>()

  return names.map((name) => {
    let unique = name
    let suffix = 2
    // Leave preferred names available to their first occurrence.
    while (used.has(unique) || (unique !== name && reserved.has(unique))) {
      unique = `${name}_${suffix++}`
    }
    used.add(unique)
    return unique
  })
}

export async function saveFile(outPath: string, typeString: string) {
  await fs.writeFile(outPath, typeString, "utf8")
  console.log(`Created typescript definitions at ${outPath}`)
}

export function getSystemFields(type: CollectionRecord["type"]) {
  switch (type) {
    case "auth":
      return "AuthSystemFields"
    default:
      // `view` and `base` collection types share the same system fields (for now)
      return "BaseSystemFields"
  }
}

export function getOptionEnumName(
  collectionIdentifier: string,
  fieldName: string
) {
  return `${collectionIdentifier}${toPascalCase(fieldName)}Options`
}

export function getOptionValues(field: FieldSchema) {
  const values = field.values
  if (!values) return []
  return values.filter((val, i) => values.indexOf(val) === i)
}

export function containsGeoPoint(collections: CollectionRecord[]) {
  return collections.some((collection) =>
    collection.fields.some((field) => field.type === "geoPoint")
  )
}
