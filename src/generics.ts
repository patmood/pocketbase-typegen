import { FieldSchema } from "./types"

export function fieldNameToGeneric(name: string) {
  return `T${name}`
}

export function getGenericArgString(schema: FieldSchema[]) {
  const jsonFields = schema
    .filter((field) => field.type === "json")
    .map((field) => field.name)
    .sort()
  if (jsonFields.length === 0) {
    return ""
  }
  return `<${jsonFields
    .map((name) => `${fieldNameToGeneric(name)} = unknown`)
    .join(", ")}>`
}
