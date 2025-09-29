import { CollectionRecord, FieldSchema } from "../src/types"
import { createRecordType, createResponseType, generate } from "../src/lib"

const mockField: FieldSchema = {
  id: "xyz",
  name: "title",
  required: false,
  system: false,
  type: "text",
  unique: false,
}

const mockCollection: CollectionRecord = {
  createRule: null,
  deleteRule: null,
  id: "123",
  listRule: null,
  name: "books",
  fields: [mockField],
  system: false,
  type: "base",
  updateRule: null,
  viewRule: null,
}

describe("generate", () => {
  it("generates correct output given db input", () => {
    const result = generate([mockCollection], { sdk: true })
    expect(result).toMatchSnapshot()
  })

  it("skips generating sdk if told not to", () => {
    const result = generate([mockCollection], { sdk: false })
    expect(result).not.toMatch(/import .* from 'pocketbase'/)
  })
})

describe("createRecordType", () => {
  it("creates type definition for a record", () => {
    const collection = {
      ...mockCollection,
      name: "books",
      fields: [mockField],
      relations: {},
    }
    const result = createRecordType(collection)
    expect(result).toMatchSnapshot()
  })

  it("handles file fields with multiple files", () => {
    const fileField: FieldSchema = {
      id: "hhnwjkke",
      name: "avatars",
      maxSelect: 2,
      required: false,
      system: false,
      type: "file",
      unique: false,
    }
    const collection = { ...mockCollection, fields: [fileField], relations: {} }
    const result = createRecordType(collection)
    expect(result).toMatchSnapshot()
  })

  it("sorts fields alphabetically", () => {
    const bananaField: FieldSchema = { ...mockField, id: "1", name: "banana" }
    const appleField: FieldSchema = { ...mockField, id: "2", name: "apple" }
    const collection = {
      ...mockCollection,
      fields: [bananaField, appleField],
      relations: {},
    }
    const result = createRecordType(collection)
    const aIndex = result.indexOf("apple")
    const bIndex = result.indexOf("banana")
    expect(aIndex).toBeGreaterThan(0)
    expect(bIndex).toBeGreaterThan(0)
    expect(aIndex).toBeLessThan(bIndex)
  })
})

describe("createResponseType", () => {
  it("creates type definition for a response", () => {
    const result = createResponseType({ ...mockCollection, relations: {} })
    expect(result).toMatchSnapshot()
  })

  it("handles file fields with multiple files", () => {
    const fileField: FieldSchema = {
      id: "hhnwjkke",
      name: "avatars",
      maxSelect: 2,
      required: false,
      system: false,
      type: "file",
      unique: false,
    }
    const collection = {
      ...mockCollection,
      fields: [fileField],
      relations: {},
    }
    const result = createRecordType(collection)
    expect(result).toMatchSnapshot()
  })
})
