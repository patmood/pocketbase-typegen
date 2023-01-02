import { CollectionRecord, FieldSchema } from "../src/types"
import {
  createCollectionEnum,
  createCollectionRecords,
  createRecordType,
  createResponseType,
  createSelectOptions,
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
    expect(createCollectionRecords(names)).toMatchSnapshot()
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
    ).toEqual("\tdefaultName?: string")
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        required: true,
      })
    ).toEqual("\tdefaultName: string")
  })

  it("converts default types to typescript", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
      })
    ).toEqual("\tdefaultName: string")
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "textField",
      })
    ).toEqual("\ttextField: string")
  })

  it("converts number type", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "numberField",
        type: "number",
      })
    ).toEqual("\tnumberField: number")
  })

  it("converts bool type", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "boolField",
        type: "bool",
      })
    ).toEqual("\tboolField: boolean")
  })

  it("converts email type", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "emailField",
        type: "email",
      })
    ).toEqual("\temailField: string")
  })

  it("converts url type", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "urlField",
        type: "url",
      })
    ).toEqual("\turlField: string")
  })

  it("converts date type", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "dateField",
        type: "date",
      })
    ).toEqual("\tdateField: IsoDateString")
  })

  it("converts select type", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "selectField",
        type: "select",
      })
    ).toEqual("\tselectField: string")
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
    ).toEqual(`\tselectFieldWithOpts: TestCollectionSelectFieldWithOptsOptions`)
  })

  it("converts multi-select type", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "selectField",
        type: "select",
        options: {
          maxSelect: 2,
        },
      })
    ).toEqual("\tselectField: string[]")
  })

  it("converts multi-select type with values", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "selectFieldWithOpts",
        type: "select",
        options: {
          values: ["one", "two", "three"],
          maxSelect: 2,
        },
      })
    ).toEqual(
      `\tselectFieldWithOpts: TestCollectionSelectFieldWithOptsOptions[]`
    )
  })

  it("converts json type", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "jsonField",
        type: "json",
      })
    ).toEqual("\tjsonField: null | TjsonField")
  })

  it("converts file type", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "fileField",
        type: "file",
      })
    ).toEqual("\tfileField: string")
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
    ).toEqual("\tfileField: string[]")
  })

  it("converts relation type", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "relationField",
        type: "relation",
      })
    ).toEqual("\trelationField: RecordIdString[]")
  })

  it("converts relation type with multiple options", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "relationFieldMany",
        type: "relation",
        options: {
          maxSelect: 3,
        },
      })
    ).toEqual("\trelationFieldMany: RecordIdString[]")
  })

  it("converts relation type with unset maxSelect", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "relationFieldMany",
        type: "relation",
        options: {
          maxSelect: null,
        },
      })
    ).toEqual("\trelationFieldMany: RecordIdString[]")
  })

  // DEPRECATED: This was removed in PocketBase v0.8
  it("converts user relation type", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "userRelationField",
        type: "user",
      })
    ).toEqual("\tuserRelationField: RecordIdString")
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

describe("createSelectOptions", () => {
  it("creates enum types for select options", () => {
    const name = "choose"
    const schema: FieldSchema[] = [
      {
        system: false,
        id: "hhnwjkke",
        name: "title",
        type: "select",
        required: false,
        unique: false,
        options: { values: ["one", "one", "two", "space space", "$@#*(&#%"] },
      },
    ]
    const result = createSelectOptions(name, schema)
    expect(result).toMatchSnapshot()
  })
})
