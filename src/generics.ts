import { EXPAND_GENERIC_NAME } from "./constants"
import { FieldSchema } from "./types"

export function fieldNameToGeneric(name: string) {
  return `T${name}`
}

export function getGenericArgList(schema: FieldSchema[]): string[] {
  const jsonFields = schema
    .filter((field) => field.type === "json")
    .map((field) => fieldNameToGeneric(field.name))
    .sort()
  return jsonFields
}

export function getGenericArgStringForRecord(schema: FieldSchema[]): string {
  const argList = getGenericArgList(schema)
  if (argList.length === 0) return ""
  return `<${argList.map((name) => `${name}`).join(", ")}>`
}

export function getGenericArgStringWithDefault(
  schema: FieldSchema[],
  opts: { includeExpand: boolean }
): string {
  const argList = getGenericArgList(schema)

  if (opts.includeExpand) {
    argList.push(fieldNameToGeneric(EXPAND_GENERIC_NAME))
  }

  if (argList.length === 0) return ""
  return `<${argList.map((name) => `${name} = unknown`).join(", ")}>`
}
