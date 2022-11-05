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

export function getGenericArgString(schema: FieldSchema[]): string {
  const argList = getGenericArgList(schema)
  if (argList.length === 0) return ""
  return `<${argList.map((name) => `${name}`).join(", ")}>`
}

export function getGenericArgStringWithDefault(schema: FieldSchema[]): string {
  const argList = getGenericArgList(schema)
  if (argList.length === 0) return ""
  return `<${argList.map((name) => `${name} = unknown`).join(", ")}>`
}
