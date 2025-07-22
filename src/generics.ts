import { EXPAND_GENERIC_NAME } from "./constants"
import { CollectionRecord, FieldSchema, RelationGraph } from "./types"
import { toPascalCase } from "./utils"

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
  opts:
    | { includeExpand: false; relationGraph?: never; collectionId?: never }
    | {
        includeExpand: true
        relationGraph: RelationGraph
        collectionId: CollectionRecord["id"]
      }
): string {
  const argList = getGenericArgList(schema).map((name) => `${name} = unknown`)

  if (opts.includeExpand) {
    const expandArg = getGenericArgForExpand(
      opts.collectionId,
      opts.relationGraph
    )

    argList.push(`${fieldNameToGeneric(EXPAND_GENERIC_NAME)} = ${expandArg}`)
  }

  if (argList.length === 0) return ""

  return `<${argList.join(", ")}>`
}

export function getGenericArgForExpand(
  collectionId: CollectionRecord["id"],
  relationGraph: RelationGraph
): string {
  const node = relationGraph.find((some) => some.id === collectionId)

  if (!node) {
    return "unknown"
  }

  if (node.children.size === 0 && node.owners.size === 0) {
    return "unknown"
  }

  const ownerFields = [...node.owners.entries()].map(([field, collection]) => {
    const value = `${toPascalCase(collection.name)}Record`

    return `\t${field.name}?: ${value}`
  })

  const childrenFields = [...node.children.entries()].map(
    ([field, collection]) => {
      const name = `${collection.name}_via_${field.name}`
      const value = `${toPascalCase(collection.name)}Record[]`

      return `\t${name}?: ${value}`
    }
  )

  return `{
${[...ownerFields, ...childrenFields].join(",\n")}
}`
}
