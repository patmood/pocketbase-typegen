import { CollectionRecord, FieldSchema } from "../src/types"
import {
  createCollectionEnum,
  createCollectionRecords,
  createRecordType,
  createResponseType,
  generate,
} from "../src/lib"

describe("generate", () => {
  it("generates correct output given db input", () => {
    const collections: Array<CollectionRecord> = [
      {
        createRule: null,
        deleteRule: null,
        id: "123",
        listRule: null,
        name: "books",
        schema: [
          {
            id: "xyz",
            name: "title",
            options: {},
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
        id: "hhnwjkke",
        name: "title",
        options: { max: null, min: null, pattern: "" },
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
        options: { maxSelect: 2 },
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

describe("createResponseType", () => {
  it("creates type definition for a response", () => {
    const row: CollectionRecord = {
      createRule: null,
      deleteRule: null,
      id: "123",
      listRule: null,
      name: "books",
      schema: [
        {
          id: "hhnwjkke",
          name: "title",
          options: { max: null, min: null, pattern: "" },
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
        options: { maxSelect: 2 },
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
