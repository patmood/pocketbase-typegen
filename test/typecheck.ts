/**
 * Examples of using the types. Exists only for type checking the example output
 */

import {
  CollectionRecords,
  Collections,
  EverythingRecord,
  EverythingSelectFieldOptions,
  IsoAutoDateString,
} from "./pocketbase-types-example"

// Utility function can to infer collection type
function getOne<T extends keyof CollectionRecords>(
  collection: T,
  id: string
): CollectionRecords[T] {
  console.log(collection, id)
  return JSON.parse("id") as CollectionRecords[T]
}

// Return type is correctly inferred
const thing = getOne(Collections.Everything, "a")

// Works when passing in JSON generic
const everythingRecordWithGeneric: EverythingRecord<{ a: "some string" }> = {
  id: "abc",
  bool_field: true,
  json_field: { a: "some string" },
  number_field: 1,
  created: '2025-04-02T00:46:53.108Z' as IsoAutoDateString
}

// Works without passing in JSON generic
const everythingRecordWithoutGeneric: EverythingRecord = {
  id: "abc",
  bool_field: true,
  json_field: { a: "some string" },
  number_field: 1,
  created: '2025-04-02T00:46:53.108Z' as IsoAutoDateString
}

// Test select option enums
const selectOptions: EverythingRecord = {
  id: "abc",
  select_field: EverythingSelectFieldOptions.optionA,
  select_field_no_values: "foo",
  created: '2025-04-02T00:46:53.108Z' as IsoAutoDateString
}

// Reference the created variables
console.log(
  thing,
  everythingRecordWithGeneric,
  everythingRecordWithoutGeneric,
  selectOptions
)
