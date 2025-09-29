import { CollectionRecordWithRelations } from "./types"

export function fieldNameToGeneric(name: string) {
  return `T${name}`
}

export function getGenericArgList(schema: CollectionRecordWithRelations): string[] {
  return schema.fields
    .filter((field) => field.type === "json")
    .map((field) => fieldNameToGeneric(field.name))
    .sort()
}

export function getGenericArgStringForRecord(
  schema: CollectionRecordWithRelations
): string {
  const argList = getGenericArgList(schema)
  if (argList.length === 0) return ""
  return `<${argList.join(", ")}>`
}
