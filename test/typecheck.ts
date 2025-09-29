/**
 * Examples of using the types. Exists only for type checking the example output
 */

import type PocketBase from "pocketbase"
import {
  // Main
  Collections,
  TypedPocketBase,
  // Records
  EverythingRecord,
  // Responses
  UsersResponse,
  PostsResponse,
  // Enums
  EverythingSelectFieldOptions,
  TagsResponse,
  ImagesResponse,
} from "./pocketbase-types-example"

// =================================================================
// 1. Original Tests (with fixes)
// =================================================================

// Utility function can to infer collection type
// (Assuming CollectionRecords is available for other utilities if needed)
import { CollectionRecords } from "./pocketbase-types-example"
function getOne<T extends keyof CollectionRecords>(
  collection: T,
  id: string
): CollectionRecords[T] {
  console.log(collection, id)
  return JSON.parse("id") as CollectionRecords[T]
}

// Return type is correctly inferred
const thing = getOne(Collections.Everything, "a")

// FIX: EverythingRecord requires 2 generic arguments. Provide `unknown` for the one not being tested.
// Works when passing in JSON generic for the SECOND json field ('json_field')
const everythingRecordWithGeneric: EverythingRecord<
  unknown,
  { a: "some string" }
> = {
  id: "abc",
  bool_field: true,
  json_field: { a: "some string" },
  number_field: 1,
}

// FIX: EverythingRecord requires 2 generic arguments. Provide `unknown` for both.
// Works without passing in JSON generic
const everythingRecordWithoutGeneric: EverythingRecord<unknown, unknown> = {
  id: "abc",
  bool_field: true,
  json_field: { a: "some string" },
  number_field: 1,
}

// FIX: EverythingRecord requires 2 generic arguments. Provide `unknown` for both.
// Test select option enums
const selectOptions: EverythingRecord<unknown, unknown> = {
  id: "abc",
  select_field: EverythingSelectFieldOptions.optionA,
  select_field_no_values: "foo",
}

// =================================================================
// 2. New Tests for TypedPocketBase with Expand Inference
// =================================================================

// This async function acts as our test suite for type inference.
// If this file compiles without TypeScript errors, the tests are considered "passed".
async function testTypeInference(pb: TypedPocketBase) {
  // Test 1: No expand parameter
  const recordWithoutExpand = await pb
    .collection(Collections.Everything)
    .getOne("RECORD_ID")
  // expand should be `never` or `undefined`.
  if (recordWithoutExpand.expand) {
    console.log(recordWithoutExpand.expand)
  }

  const recordWithEmptyExpandString = await pb
    .collection(Collections.Everything)
    .getOne("RECORD_ID", { expand: "" })
  if (recordWithEmptyExpandString.expand) {
    console.log(recordWithEmptyExpandString.expand)
  }

  // Test 2: Expanding a single, one-to-one relation
  const recordWithSingleExpand = await pb
    .collection(Collections.Everything)
    .getOne("RECORD_ID", {
      expand: "user_relation_field",
    })
  // `expand` is now defined and strongly typed.
  // `user_relation_field` should be of type `UsersResponse | undefined`.
  const userEmail: string | undefined =
    recordWithSingleExpand.expand.user_relation_field?.email

  // Test 3: Expanding multiple comma-separated relations
  const recordWithMultiExpand = await pb
    .collection(Collections.Everything)
    .getFullList({
      expand: "user_relation_field,post_relation_field.tags.images",
    })
  // Inference works on array items from `getFullList`.
  const firstItem = recordWithMultiExpand[0]
  if (firstItem) {
    // Both fields should be present and typed correctly.
    const user: UsersResponse | undefined = firstItem.expand.user_relation_field
    const post = firstItem.expand.post_relation_field
    const tags: TagsResponse<"images">[] | undefined = post?.expand.tags
    const firstTag = tags?.at(0)
    if (firstTag) {
      // `images` should be ImagesResponse[]
      const images: ImagesResponse[] = firstTag.expand.images
      console.log(images)
    }
    console.log(user?.name, post?.nonempty_field, tags)
  }

  // Test 4: Expanding a one-to-many relation
  const recordWithOneToMany = await pb
    .collection(Collections.Everything)
    .getOne("RECORD_ID", {
      expand: "custom_relation_field",
    })
  // `custom_relation_field` should be an array: `CustomAuthResponse[] | undefined`.
  recordWithOneToMany.expand.custom_relation_field?.forEach((customAuth) => {
    const customField: string = customAuth.custom_field
    console.log(customField)
  })

  // Test 5: Testing on a different collection (a View)
  const viewRecord = await pb.collection(Collections.MyView).getOne("VIEW_ID", {
    expand: "post_relation_field",
  })
  // The expand on the view should be correctly typed.
  const postFromView: PostsResponse | undefined =
    viewRecord.expand.post_relation_field

  // This should be valid and type-checked
  const isNonEmpty: boolean | undefined = postFromView?.nonempty_bool

  // Test 6: Testing an invalid expand
  const recordWithInvalidExpand = await pb.collection(Collections.Everything).getOne("RECORD_ID", {
    expand: "user_relation_field.invalid_field",
  })
  if (recordWithInvalidExpand.expand) {
    // Never executes
    console.log(recordWithInvalidExpand.expand)
  }

  console.log("Type inference tests passed:", { userEmail, isNonEmpty })
}

// Reference the created variables to prevent "unused variable" warnings
console.log(
  thing,
  everythingRecordWithGeneric,
  everythingRecordWithoutGeneric,
  selectOptions,
  testTypeInference // Reference the test function
)
