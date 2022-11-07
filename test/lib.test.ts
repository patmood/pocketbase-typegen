import { CollectionRecord, FieldSchema } from "../src/types"
import {
  createCollectionEnum,
  createCollectionRecord,
  createRecordType,
  createResponseType,
  createTypeField,
  generate,
} from "../src/lib"

const defaultFieldSchema: FieldSchema = {
  id: "abc",
  system: false,
  unique: false,
  options: {},
  name: "defaultName",
  required: true,
  type: "text",
}

describe("generate", () => {
  it("generates correct output given db input", () => {
    const collections: Array<CollectionRecord> = [
      {
        name: "books",
        id: "123",
        type: "base",
        system: false,
        listRule: null,
        viewRule: null,
        createRule: null,
        updateRule: null,
        deleteRule: null,
        schema: [
          {
            name: "title",
            type: "text",
            required: false,
            id: "xyz",
            system: false,
            unique: false,
            options: {},
          },
        ],
      },
    ]
    const result = generate(collections)
    expect(result).toMatchSnapshot()
  })
})

describe("createCollectionEnum", () => {
  it("creates enum of collection names", () => {
    const names = ["book", "magazine"]
    expect(createCollectionEnum(names)).toMatchSnapshot()
  })
})

describe("createCollectionRecord", () => {
  it("creates mapping of collection name to record type", () => {
    const names = ["book", "magazine"]
    expect(createCollectionRecord(names)).toMatchSnapshot()
  })
})

describe("createRecordType", () => {
  it("creates type definition for a record", () => {
    const name = "books"
    const schema: FieldSchema[] = [
      {
        system: false,
        id: "hhnwjkke",
        name: "title",
        type: "text",
        required: false,
        unique: false,
        options: { min: null, max: null, pattern: "" },
      },
    ]
    const result = createRecordType(name, schema)
    expect(result).toMatchSnapshot()
  })

  it("handles file fields with multiple files", () => {
    const name = "books"
    const schema: FieldSchema[] = [
      {
        system: false,
        id: "hhnwjkke",
        name: "avatars",
        type: "file",
        required: false,
        unique: false,
        options: { maxSelect: 2 },
      },
    ]
    const result = createRecordType(name, schema)
    expect(result).toMatchSnapshot()
  })
})

describe("createResponseType", () => {
  it("creates type definition for a response", () => {
    const row: CollectionRecord = {
      type: "base",
      id: "123",
      system: false,
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      name: "books",
      schema: [
        {
          system: false,
          id: "hhnwjkke",
          name: "title",
          type: "text",
          required: false,
          unique: false,
          options: { min: null, max: null, pattern: "" },
        },
      ],
    }

    const result = createResponseType(row)
    expect(result).toMatchSnapshot()
  })

  it("handles file fields with multiple files", () => {
    const name = "books"
    const schema: FieldSchema[] = [
      {
        system: false,
        id: "hhnwjkke",
        name: "avatars",
        type: "file",
        required: false,
        unique: false,
        options: { maxSelect: 2 },
      },
    ]
    const result = createRecordType(name, schema)
    expect(result).toMatchSnapshot()
  })
})

describe("createTypeField", () => {
  it("handles required and optional fields", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        required: false,
      })
    ).toEqual("\tdefaultName?: string\n")
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        required: true,
      })
    ).toEqual("\tdefaultName: string\n")
  })

  it("converts default types to typescript", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
      })
    ).toEqual("\tdefaultName: string\n")
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "textField",
      })
    ).toEqual("\ttextField: string\n")
  })

  it("converts number type", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "numberField",
        type: "number",
      })
    ).toEqual("\tnumberField: number\n")
  })

  it("converts bool type", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "boolField",
        type: "bool",
      })
    ).toEqual("\tboolField: boolean\n")
  })

  it("converts email type", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "emailField",
        type: "email",
      })
    ).toEqual("\temailField: string\n")
  })

  it("converts url type", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "urlField",
        type: "url",
      })
    ).toEqual("\turlField: string\n")
  })

  it("converts date type", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "dateField",
        type: "date",
      })
    ).toEqual("\tdateField: IsoDateString\n")
  })

  it("converts select type", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "selectField",
        type: "select",
      })
    ).toEqual("\tselectField: string\n")
  })

  it("converts select type with value", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "selectFieldWithOpts",
        type: "select",
        options: {
          values: ["one", "two", "three"],
        },
      })
    ).toEqual(
      `\tselectFieldWithOpts: TestCollectionSelectFieldWithOptsOptions\n`
    )
  })

  it("converts json type", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "jsonField",
        type: "json",
      })
    ).toEqual("\tjsonField: null | TjsonField\n")
  })

  it("converts file type", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "fileField",
        type: "file",
      })
    ).toEqual("\tfileField: string\n")
  })

  it("converts file type with multiple files", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "fileField",
        type: "file",
        options: {
          maxSelect: 3,
        },
      })
    ).toEqual("\tfileField: string[]\n")
  })

  it("converts relation type", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "relationField",
        type: "relation",
      })
    ).toEqual("\trelationField: RecordIdString\n")
  })

  it("converts relation type", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "relationFieldMany",
        type: "relation",
        options: {
          maxSelect: 3,
        },
      })
    ).toEqual("\trelationFieldMany: RecordIdString[]\n")
  })

  it("throws for unexpected types", () => {
    expect(() =>
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        // @ts-ignore
        type: "unknowntype",
      })
    ).toThrowError("unknown type unknowntype found in schema")
  })
})
