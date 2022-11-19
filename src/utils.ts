import { CollectionRecord } from "./types"
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
  // If the first character is a number, wrap it in quotes to pass typecheck
  return !isNaN(parseFloat(name.charAt(0))) ? `"${name}"` : name
}

export async function saveFile(outPath: string, typeString: string) {
  await fs.writeFile(outPath, typeString, "utf8")
  console.log(`Created typescript definitions at ${outPath}`)
}

export function getSystemFields(type: CollectionRecord["type"]) {
  return type === "auth" ? "AuthSystemFields" : "BaseSystemFields"
}

export function getOptionEnumName(recordName: string, fieldName: string) {
  return `${toPascalCase(recordName)}${toPascalCase(fieldName)}Options`
}
