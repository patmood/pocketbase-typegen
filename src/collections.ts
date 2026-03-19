import { toPascalCase } from "./utils"

export function createCollectionEnum(
  collectionNames: Array<string>,
  useConst?: boolean
): string {
  if (useConst) {
    const collections = collectionNames
      .map((name) => `\t${toPascalCase(name)}: "${name}",`)
      .join("\n")
    return `export const Collections = {
${collections}
} as const
export type Collections = typeof Collections[keyof typeof Collections]`
  }

  const collections = collectionNames
    .map((name) => `\t${toPascalCase(name)} = "${name}",`)
    .join("\n")
  const typeString = `export enum Collections {
${collections}
}`
  return typeString
}

export function createCollectionRecords(
  collectionNames: Array<string>
): string {
  const nameRecordMap = collectionNames
    .map((name) => `\t${name}: ${toPascalCase(name)}Record`)
    .join("\n")
  return `export type CollectionRecords = {
${nameRecordMap}
}`
}

export function createCollectionResponses(
  collectionNames: Array<string>
): string {
  const nameRecordMap = collectionNames
    .map((name) => `\t${name}: ${toPascalCase(name)}Response`)
    .join("\n")
  return `export type CollectionResponses = {
${nameRecordMap}
}`
}
