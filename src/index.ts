import { generate } from "./lib"
import { CollectionRecord } from "./types"

export type GenerateOptions = {
  sdk?: boolean
}

export function generateFromSchema(
  collections: Array<CollectionRecord>,
  options?: GenerateOptions
): string {
  return generate(collections, { sdk: options?.sdk ?? true })
}
