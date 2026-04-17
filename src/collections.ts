import { toPascalCase } from "./utils"

export function createCollectionEnum(
  collectionNames: Array<string>
): string {
  const collections = collectionNames
    .map((name) => `\t${toPascalCase(name)}: "${name}",`)
    .join("\n")
  return `export const Collections = {
${collections}
} as const
export type Collections = typeof Collections[keyof typeof Collections]`
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
