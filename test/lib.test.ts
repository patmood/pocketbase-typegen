import { runInNewContext } from "node:vm"
import ts from "typescript"
import { describe, expect, it } from "vitest"

import { generateFromSchema } from "../src/index"
import { CollectionRecord, FieldSchema } from "../src/types"
import { createRecordType, createResponseType, generate } from "../src/lib"

function collection(
  name: string,
  field: Partial<FieldSchema>
): CollectionRecord {
  return {
    createRule: null,
    deleteRule: null,
    fields: [
      {
        id: "field-id",
        name: "size",
        required: false,
        system: false,
        type: "text",
        unique: false,
        ...field,
      },
    ],
    id: name,
    listRule: null,
    name,
    system: false,
    type: "base",
    updateRule: null,
    viewRule: null,
  }
}

function compileGeneratedTypes(source: string) {
  const filename = "generated.ts"
  const options: ts.CompilerOptions = {
    module: ts.ModuleKind.CommonJS,
    strict: true,
    types: [],
  }
  const host = ts.createCompilerHost(options)
  const getSourceFile = host.getSourceFile
  host.getSourceFile = (path, languageVersion, ...rest) =>
    path === filename
      ? ts.createSourceFile(path, source, languageVersion)
      : getSourceFile(path, languageVersion, ...rest)

  const program = ts.createProgram([filename], options, host)
  expect(
    ts.getPreEmitDiagnostics(program).map(({ messageText }) => messageText)
  ).toEqual([])

  const exports: Record<string, Record<string, string>> = {}
  program.emit(undefined, (_, output) => runInNewContext(output, { exports }))
  return exports
}

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

  it.each(['5" pipe', "first\nsecond", "C:\\temp"])(
    "round-trips select option %j",
    (value) => {
      const source = generateFromSchema(
        [collection("parts", { type: "select", values: [value] })],
        { sdk: false }
      )
      const { PartsSizeOptions } = compileGeneratedTypes(source)
      expect(Object.entries(PartsSizeOptions)).toEqual([[value, value]])
    }
  )

  it("keeps a leading digit in collection names while generating valid identifiers", () => {
    const source = generateFromSchema(
      [collection("2fa_codes", { type: "select", values: ["sms"] })],
      { sdk: false }
    )
    const { Collections } = compileGeneratedTypes(`${source}
type RecordSize = CollectionRecords["2fa_codes"]["size"]
const recordSize: RecordSize = "sms"
const responseSize: CollectionResponses["2fa_codes"]["size"] = recordSize
`)
    expect(Collections).toEqual({ _2faCodes: "2fa_codes" })
  })

  it("keeps collections with the same PascalCase name distinct", () => {
    const source = generateFromSchema(
      [
        collection("user_posts", { type: "select", values: ["draft"] }),
        collection("userPosts", { type: "select", values: ["published"] }),
      ],
      { sdk: false }
    )
    const { Collections } = compileGeneratedTypes(`${source}
const draft: CollectionRecords["user_posts"]["size"] = "draft"
const published: CollectionResponses["userPosts"]["size"] = "published"
// @ts-expect-error The two collections have distinct select options
const wrong: CollectionRecords["userPosts"]["size"] = draft
`)
    expect(Object.values(Collections).sort()).toEqual([
      "userPosts",
      "user_posts",
    ])
  })

  it("keeps select options with the same generated key distinct", () => {
    const values = ["1", "E1", "E1_2"]
    const source = generateFromSchema(
      [collection("parts", { type: "select", values })],
      { sdk: false }
    )
    const { PartsSizeOptions } = compileGeneratedTypes(source)
    expect(Object.values(PartsSizeOptions)).toEqual(values)
    expect(PartsSizeOptions.E1_2).toBe("E1_2")
  })
})

describe("createRecordType", () => {
  it("creates type definition for a record", () => {
    const name = "Books"
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
    const name = "Books"
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
    const name = "Empty"
    const schema: FieldSchema[] = []
    const result = createRecordType(name, schema)
    expect(result).toContain("= never")
  })

  it("sorts fields alphabetically", () => {
    const name = "Books"
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
    const name = "Books"
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
    const name = "Books"
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
    const result = createRecordType("Books", [
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

    const result = createResponseType(row, "Books")
    expect(result).toMatchSnapshot()
  })

  it("handles file fields with multiple files", () => {
    const name = "Books"
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
