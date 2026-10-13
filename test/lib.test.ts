import { describe, expect, it } from "vitest"

import { CollectionRecord, FieldSchema } from "../src/types"
import { createRecordType, createResponseType, generate } from "../src/lib"

describe("generate", () => {
  it("generates correct output given db input", () => {
    const collections: Array<CollectionRecord> = [
      {
        createRule: null,
        deleteRule: null,
        id: "123",
        listRule: null,
        name: "books",
        fields: [
          {
            id: "xyz",
            name: "title",
            required: false,
            system: false,
            type: "text",
            unique: false,
          },
        ],
        system: false,
        type: "base",
        updateRule: null,
        viewRule: null,
      },
    ]
    const result = generate(collections, { sdk: true })
    expect(result).toMatchSnapshot()
    // Verify no enum keyword in output
    expect(result).not.toMatch(/\benum\b/)
    // Verify as const pattern is used
    expect(result).toMatch(/as const/)
  })

  it("skips generatic sdk if told not to", () => {
    const collections: Array<CollectionRecord> = [
      {
        createRule: null,
        deleteRule: null,
        id: "123",
        listRule: null,
        name: "books",
        fields: [
          {
            id: "xyz",
            name: "title",
            required: false,
            system: false,
            type: "text",
            unique: false,
          },
        ],
        system: false,
        type: "base",
        updateRule: null,
        viewRule: null,
      },
    ]
    const result = generate(collections, { sdk: false })
    expect(result).not.toMatch(/import .* from 'pocketbase'/)
  })
})

describe("createRecordType", () => {
  it("creates type definition for a record", () => {
    const name = "books"
    const schema: FieldSchema[] = [
      {
        id: "hhnwjkke",
        name: "title",
        max: null,
        min: null,
        pattern: "",
        required: false,
        system: false,
        type: "text",
        unique: false,
      },
    ]
    const result = createRecordType(name, schema)
    expect(result).toMatchSnapshot()
  })

  it("handles file fields with multiple files", () => {
    const name = "books"
    const schema: FieldSchema[] = [
      {
        id: "hhnwjkke",
        name: "avatars",
        maxSelect: 2,
        required: false,
        system: false,
        type: "file",
        unique: false,
      },
    ]
    const result = createRecordType(name, schema)
    expect(result).toMatchSnapshot()
  })

  it("returns never when schema has no fields", () => {
    const name = "empty"
    const schema: FieldSchema[] = []
    const result = createRecordType(name, schema)
    expect(result).toContain("= never")
  })

  it("sorts fields alphabetically", () => {
    const name = "books"
    const schema: FieldSchema[] = [
      {
        id: "1",
        name: "banana",
        required: false,
        system: false,
        type: "text",
        unique: false,
      },
      {
        id: "1",
        name: "apple",
        required: false,
        system: false,
        type: "text",
        unique: false,
      },
    ]
    const result = createRecordType(name, schema)
    const aIndex = result.indexOf("apple")
    const bIndex = result.indexOf("banana")
    expect(aIndex).toBeGreaterThan(0)
    expect(bIndex).toBeGreaterThan(0)
    expect(aIndex).toBeLessThan(bIndex)
  })

  it("adds help text as JSDoc comments above fields", () => {
    const name = "books"
    const schema: FieldSchema[] = [
      {
        help: "The book title",
        id: "1",
        name: "title",
        required: true,
        system: false,
        type: "text",
        unique: false,
      },
      {
        help: "Short summary.\r\nShown on the */ listing page.",
        id: "2",
        name: "summary",
        required: false,
        system: false,
        type: "text",
        unique: false,
      },
      {
        help: "   ",
        id: "3",
        name: "pages",
        required: false,
        system: false,
        type: "number",
        unique: false,
      },
    ]
    const result = createRecordType(name, schema)
    expect(result).toEqual(`export type BooksRecord = {
\tpages?: number
\t/**
\t * Short summary.
\t * Shown on the *\\/ listing page.
\t */
\tsummary?: string
\t/** The book title */
\ttitle: string
}`)
    expect(result).toMatchSnapshot()
  })

  it("does not change field order when fields have help text", () => {
    const name = "books"
    const fields: FieldSchema[] = [
      {
        id: "1",
        name: "banana",
        required: false,
        system: false,
        type: "text",
        unique: false,
      },
      {
        id: "2",
        name: "cherry",
        required: true,
        system: false,
        type: "number",
        unique: false,
      },
      {
        id: "3",
        name: "apple",
        required: false,
        system: false,
        type: "bool",
        unique: false,
      },
    ]
    const withHelp: FieldSchema[] = fields.map((field, i) => ({
      ...field,
      // Help text that would sort in the reverse order of the field names
      help: i === 1 ? undefined : `${String.fromCharCode(122 - i)} help`,
    }))
    const stripComments = (output: string) =>
      output
        .split("\n")
        .filter((line) => !/^\t(\/\*\*| \*)/.test(line))
        .join("\n")

    const plain = createRecordType(name, fields)
    const commented = createRecordType(name, withHelp)
    expect(commented).not.toEqual(plain)
    expect(stripComments(commented)).toEqual(plain)
    expect(commented).toContain("\t/** z help */\n\tbanana?: string")
    expect(commented).toContain("\t/** x help */\n\tapple?: boolean")
  })

  it("keeps the original order of identical field lines", () => {
    const field: FieldSchema = {
      id: "1",
      name: "title",
      required: false,
      system: false,
      type: "text",
      unique: false,
    }
    const result = createRecordType("books", [
      { ...field, help: "first" },
      { ...field, help: "second" },
    ])
    expect(result.indexOf("first")).toBeLessThan(result.indexOf("second"))
  })
})

describe("createResponseType", () => {
  it("creates type definition for a response", () => {
    const row: CollectionRecord = {
      createRule: null,
      deleteRule: null,
      id: "123",
      listRule: null,
      name: "books",
      fields: [
        {
          id: "hhnwjkke",
          name: "title",
          max: null,
          min: null,
          pattern: "",
          required: false,
          system: false,
          type: "text",
          unique: false,
        },
      ],
      system: false,
      type: "base",
      updateRule: null,
      viewRule: null,
    }

    const result = createResponseType(row)
    expect(result).toMatchSnapshot()
  })

  it("handles file fields with multiple files", () => {
    const name = "books"
    const schema: FieldSchema[] = [
      {
        id: "hhnwjkke",
        name: "avatars",
        maxSelect: 2,
        required: false,
        system: false,
        type: "file",
        unique: false,
      },
    ]
    const result = createRecordType(name, schema)
    expect(result).toMatchSnapshot()
  })
})
