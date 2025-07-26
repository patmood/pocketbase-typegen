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
  const lookupNode = relationGraph.find((some) => some.id === collectionId)

  if (!lookupNode) {
    return "unknown"
  }

  if (lookupNode.children.size === 0 && lookupNode.parents.size === 0) {
    return "unknown"
  }

  const parentFields = [...lookupNode.parents.entries()].map(
    ([field, parentNode]) => {
      const value = `${toPascalCase(parentNode.name)}Record`

      return `\t${field.name}?: ${value}`
    }
  )

  const childrenFields = [...lookupNode.children.entries()].map(
    ([field, childNode]) => {
      const name = `${childNode.name}_via_${field.name}`
      const value = `${toPascalCase(childNode.name)}Record[]`

      return `\t${name}?: ${value}`
    }
  )

  return `{
${[...parentFields, ...childrenFields].join(",\n")}
}`
}
