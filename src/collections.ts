import { NOT_COMMON_COLLECTIONS } from "./constants"
import { toPascalCase } from "./utils"

export function createCollectionEnum(collectionNames: Array<string>): string {
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

export function createCollectionCreates(
  collectionNames: Array<string>
): string {
  const nameRecordMap = collectionNames
    .filter((name) => !NOT_COMMON_COLLECTIONS.includes(name))
    .map((name) => `\t${name}: ${toPascalCase(name)}Create`)
    .join("\n")
  return `export type CollectionCreates = {
${nameRecordMap}
}`
}

export function createCollectionUpdates(
  collectionNames: Array<string>
): string {
  const nameRecordMap = collectionNames
    .filter((name) => !NOT_COMMON_COLLECTIONS.includes(name))
    .map((name) => `\t${name}: ${toPascalCase(name)}Update`)
    .join("\n")
  return `export type CollectionUpdates = {
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

export function createTypedPocketbase(collectionNames: Array<string>): string {
  const nameRecordMap = collectionNames
    .map(
      (name) =>
        `\tcollection(idOrName: '${name}'): RecordService<${toPascalCase(
          name
        )}Response>`
    )
    .join("\n")
  return `export type TypedPocketBase = PocketBase & {
${nameRecordMap}
}`
}
