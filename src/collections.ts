import { sanitizeFieldName } from "./utils"

export function createCollectionEnum(
  collectionNames: Map<string, string>
): string {
  const collections = Array.from(
    collectionNames,
    ([name, identifier]) => `\t${identifier}: ${JSON.stringify(name)},`
  ).join("\n")
  return `export const Collections = {
${collections}
} as const
export type Collections = typeof Collections[keyof typeof Collections]`
}

export function createCollectionRecords(
  collectionNames: Map<string, string>
): string {
  const nameRecordMap = Array.from(
    collectionNames,
    ([name, identifier]) => `\t${sanitizeFieldName(name)}: ${identifier}Record`
  ).join("\n")
  return `export type CollectionRecords = {
${nameRecordMap}
}`
}

export function createCollectionResponses(
  collectionNames: Map<string, string>
): string {
  const nameRecordMap = Array.from(
    collectionNames,
    ([name, identifier]) =>
      `\t${sanitizeFieldName(name)}: ${identifier}Response`
  ).join("\n")
  return `export type CollectionResponses = {
${nameRecordMap}
}`
}
