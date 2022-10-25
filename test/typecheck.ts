/**
 * Examples of using the types. Exists only for type checking the example output
 */

import {
  CollectionRecords,
  Collections,
  EveryTypeRecord,
} from "./pocketbase-types-example"

// Utility function can to infer collection type
function getOne<T extends keyof CollectionRecords>(
  collection: T,
  id: string
): CollectionRecords[T] {
  return JSON.parse("id") as CollectionRecords[T]
}

// Return type is correctly inferred
let thing = getOne(Collections.EveryType, "a")

// Works when passing in JSON generic
const everythingRecordWithGeneric: EveryTypeRecord<{ a: "some string" }> = {
  json_field: { a: "some string" },
  text_field: "string",
  number_field: 1,
  bool_field: true,
}

// Works without passing in JSON generic
const everythingRecordWithoutGeneric: EveryTypeRecord = {
  json_field: { a: "some string" },
  text_field: "string",
  number_field: 1,
  bool_field: true,
}

console.log(thing, everythingRecordWithGeneric, everythingRecordWithoutGeneric)
