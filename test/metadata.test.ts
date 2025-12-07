import { createFieldMetadata } from "../src/metadata"
import { FieldSchema } from "../src/types"

describe("createFieldMetadata", () => {
  it("creates min/max metadata", () => {
    const schema: FieldSchema[] = [
      {
        id: "text3208210256",
        name: "id",
        type: "text",
        min: 15,
        max: 15,
        required: true,
        system: true,
        unique: false,
      },
    ]

    const result = createFieldMetadata("users", schema)

    expect(result).toMatchSnapshot()
  })

  it("generates metadata for the everything collection", () => {
    const schema: FieldSchema[] = [
      {
        id: "text3208210256",
        name: "id",
        type: "text",
        min: 15,
        max: 15,
        pattern: "^[a-z0-9]+$",
        required: true,
        system: true,
        unique: false,
      },
      {
        id: "select1",
        name: "select_field",
        type: "select",
        maxSelect: 1,
        values: ["optionA", "OptionA", "optionB"],
        required: false,
        system: false,
        unique: false,
      },
      {
        id: "json1",
        name: "json_field",
        type: "json",
        maxSize: 2000000,
        required: false,
        system: false,
        unique: false,
      },
      {
        id: "file1",
        name: "three_files_field",
        type: "file",
        maxSelect: 99,
        required: false,
        system: false,
        unique: false,
      },
      {
        id: "rel1",
        name: "custom_relation_field",
        type: "relation",
        maxSelect: 999,
        required: false,
        system: false,
        unique: false,
      },
      {
        id: "autodate1",
        name: "created",
        type: "autodate",
        onCreate: true,
        onUpdate: false,
        required: false,
        system: false,
        unique: false,
      },
      {
        id: "autodate2",
        name: "updated",
        type: "autodate",
        onCreate: false,
        onUpdate: true,
        required: false,
        system: false,
        unique: false,
      },
    ]

    const result = createFieldMetadata("everything", schema)

    expect(result).toMatchSnapshot()
  })

  it("includes other metadata fields when present", () => {
    const schema: FieldSchema[] = [
      {
        id: "file1",
        name: "avatar",
        type: "file",
        maxSelect: 1,
        maxSize: 1024,
        mimeTypes: ["image/png"],
        required: false,
        unique: true,
        pattern: "^abc$",
        values: ["a", "b"],
        onCreate: true,
        onUpdate: false,
        system: false,
      },
    ]

    const result = createFieldMetadata("media", schema)

    expect(result).toMatchSnapshot()
  })
})
