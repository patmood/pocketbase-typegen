import {
  getGenericArgList,
  getGenericArgStringForRecord,
} from "../src/generics"
import { CollectionRecordWithRelations, FieldSchema } from "../src/types"

const createMockCollection = (
  fields: FieldSchema[]
): CollectionRecordWithRelations => ({
  id: "test",
  name: "test",
  type: "base",
  system: false,
  listRule: null,
  viewRule: null,
  createRule: null,
  updateRule: null,
  deleteRule: null,
  fields,
  relations: {},
})

const textField: FieldSchema = {
  id: "1",
  name: "field1",
  required: true,
  system: false,
  type: "text",
  unique: false,
}
const jsonField1: FieldSchema = {
  id: "2",
  name: "data1",
  required: true,
  system: false,
  type: "json",
  unique: false,
}
const jsonField2: FieldSchema = {
  id: "3",
  name: "data2",
  required: true,
  system: false,
  type: "json",
  unique: false,
}

describe("getGenericArgList", () => {
  it("returns a list of generic args", () => {
    expect(getGenericArgList(createMockCollection([jsonField1]))).toEqual([
      "Tdata1",
    ])
    expect(
      getGenericArgList(createMockCollection([textField, jsonField1, jsonField2]))
    ).toEqual(["Tdata1", "Tdata2"])
  })

  it("sorts the arg list", () => {
    expect(
      getGenericArgList(createMockCollection([jsonField2, jsonField1]))
    ).toEqual(["Tdata1", "Tdata2"])
  })
})

describe("getGenericArgStringForRecord", () => {
  it("empty string when no generic fields", () => {
    expect(getGenericArgStringForRecord(createMockCollection([textField]))).toEqual(
      ""
    )
  })

  it("returns a single generic string", () => {
    expect(
      getGenericArgStringForRecord(createMockCollection([textField, jsonField1]))
    ).toEqual("<Tdata1>")
  })

  it("multiple generics with a record", () => {
    expect(
      getGenericArgStringForRecord(
        createMockCollection([textField, jsonField1, jsonField2])
      )
    ).toEqual("<Tdata1, Tdata2>")
  })

  it("sorts the arguments", () => {
    expect(
      getGenericArgStringForRecord(
        createMockCollection([textField, jsonField2, jsonField1])
      )
    ).toEqual("<Tdata1, Tdata2>")
  })
})
