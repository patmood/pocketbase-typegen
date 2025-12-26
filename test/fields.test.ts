import {
  createSelectOptions,
  createTypeField,
  getSelectOptionEnumName,
} from "../src/fields"

import { FieldSchema } from "../src/types"

const defaultFieldSchema: FieldSchema = {
  id: "abc",
  name: "defaultName",
  required: true,
  system: false,
  type: "text",
  unique: false,
}

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
        values: ["one", "two", "three"],
        type: "select",
      })
    ).toEqual(`\tselectFieldWithOpts: TestCollectionSelectFieldWithOptsOptions`)
  })

  it("converts multi-select type", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "selectField",
        maxSelect: 2,
        type: "select",
      })
    ).toEqual("\tselectField: string[]")
  })

  it("converts multi-select type with values", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "selectFieldWithOpts",
        maxSelect: 2,
        values: ["one", "two", "three"],
        type: "select",
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

  it("converts editor type", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "editorField",
        type: "editor",
      })
    ).toEqual("\teditorField: HTMLString")
  })

  it("converts file type", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "fileField",
        type: "file",
      })
    ).toEqual("\tfileField: FileNameString")
  })

  it("converts file type with multiple files", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "fileField",
        maxSelect: 3,
        type: "file",
      })
    ).toEqual("\tfileField: FileNameString[]")
  })

  it("converts relation type", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "relationField",
        type: "relation",
      })
    ).toEqual("\trelationField: RecordIdString")
  })

  it("converts relation type with multiple options", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "relationFieldMany",
        maxSelect: 3,
        type: "relation",
      })
    ).toEqual("\trelationFieldMany: RecordIdString[]")
  })

  it("converts relation type with unset maxSelect", () => {
    expect(
      createTypeField("test_collection", {
        ...defaultFieldSchema,
        name: "relationFieldMany",
        maxSelect: null,
        type: "relation",
      })
    ).toEqual("\trelationFieldMany: RecordIdString")
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

  it("warns when encountering unexpected types", () => {
    const logSpy = jest.spyOn(console, "log")
    createTypeField("test_collection", {
      ...defaultFieldSchema,
      // @ts-ignore
      type: "unknowntype",
    })
    expect(logSpy).toHaveBeenCalledWith(
      'WARNING: unknown type "unknowntype" found in schema'
    )
  })
})

describe("createSelectOptions", () => {
  it("creates enum types for select options", () => {
    const name = "choose"
    const schema: FieldSchema[] = [
      {
        id: "hhnwjkke",
        name: "title",
        values: ["one", "one", "two", "space space", "$@#*(&#%"],
        required: false,
        system: false,
        type: "select",
        unique: false,
      },
    ]
    const result = createSelectOptions(name, schema)
    expect(result).toMatchSnapshot()
  })
})

describe("getSelectOptionEnumName", () => {
  it("uses the select option value as the enum name", () => {
    expect(getSelectOptionEnumName("hello")).toEqual("hello")
    expect(getSelectOptionEnumName("2022X")).toEqual("2022X")
  })

  it("prefixes the enum name when the value is a number", () => {
    expect(getSelectOptionEnumName("2022")).toEqual("E2022")
    expect(getSelectOptionEnumName("0")).toEqual("E0")
    expect(getSelectOptionEnumName("0123")).toEqual("E0123")
  })
})
