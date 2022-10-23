import { CollectionRecord, FieldSchema } from "../src/types"
import {
  createCollectionEnum,
  createCollectionRecord,
  createRecordType,
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

describe("createTypeField", () => {
  it("handles required and optional fields", () => {
    expect(
      createTypeField({
        ...defaultFieldSchema,
        required: false,
      })
    ).toEqual("\tdefaultName?: string\n")
    expect(
      createTypeField({
        ...defaultFieldSchema,
        required: true,
      })
    ).toEqual("\tdefaultName: string\n")
  })

  it("converts pocketbase schema types to typescript", () => {
    expect(
      createTypeField({
        ...defaultFieldSchema,
      })
    ).toEqual("\tdefaultName: string\n")
    expect(
      createTypeField({
        ...defaultFieldSchema,
        name: "textField",
      })
    ).toEqual("\ttextField: string\n")
    expect(
      createTypeField({
        ...defaultFieldSchema,
        name: "numberField",
        type: "number",
      })
    ).toEqual("\tnumberField: number\n")
    expect(
      createTypeField({
        ...defaultFieldSchema,
        name: "boolField",
        type: "bool",
      })
    ).toEqual("\tboolField: boolean\n")
    expect(
      createTypeField({
        ...defaultFieldSchema,
        name: "emailField",
        type: "email",
      })
    ).toEqual("\temailField: string\n")
    expect(
      createTypeField({
        ...defaultFieldSchema,
        name: "urlField",
        type: "url",
      })
    ).toEqual("\turlField: string\n")
    expect(
      createTypeField({
        ...defaultFieldSchema,
        name: "dateField",
        type: "date",
      })
    ).toEqual("\tdateField: string\n")
    expect(
      createTypeField({
        ...defaultFieldSchema,
        name: "selectField",
        type: "select",
      })
    ).toEqual("\tselectField: string\n")
    expect(
      createTypeField({
        ...defaultFieldSchema,
        name: "selectFieldWithOpts",
        type: "select",
        options: {
          values: ["one", "two", "three"],
        },
      })
    ).toEqual(`\tselectFieldWithOpts: "one" | "two" | "three"\n`)
    expect(
      createTypeField({
        ...defaultFieldSchema,
        name: "jsonField",
        type: "json",
      })
    ).toEqual("\tjsonField: null | TjsonField\n")
    expect(
      createTypeField({
        ...defaultFieldSchema,
        name: "fileField",
        type: "file",
      })
    ).toEqual("\tfileField: string\n")
    expect(
      createTypeField({
        ...defaultFieldSchema,
        name: "fileField",
        type: "file",
        options: {
          maxSelect: 3,
        },
      })
    ).toEqual("\tfileField: string[]\n")
    expect(
      createTypeField({
        ...defaultFieldSchema,
        name: "relationField",
        type: "relation",
      })
    ).toEqual("\trelationField: string\n")
    expect(
      createTypeField({
        ...defaultFieldSchema,
        name: "userField",
        type: "user",
      })
    ).toEqual("\tuserField: string\n")
  })

  it("throws for unexpected types", () => {
    expect(() =>
      // @ts-ignore
      createTypeField({ ...defaultFieldSchema, type: "unknowntype" })
    ).toThrowError("unknown type unknowntype found in schema")
  })
})
