import {
  canExpand,
  getGenericArgList,
  getGenericArgStringForRecord,
  getGenericArgStringWithDefault,
} from "../src/generics"

import { FieldSchema } from "../src/types"

const textField: FieldSchema = {
  id: "1",
  system: false,
  unique: false,
  options: {},
  name: "field1",
  required: true,
  type: "text",
}
const jsonField1: FieldSchema = {
  id: "2",
  system: false,
  unique: false,
  options: {},
  name: "data1",
  required: true,
  type: "json",
}
const jsonField2: FieldSchema = {
  id: "3",
  system: false,
  unique: false,
  options: {},
  name: "data2",
  required: true,
  type: "json",
}
const expandField: FieldSchema = {
  id: "4",
  system: false,
  unique: false,
  options: {},
  name: "post_relation_field",
  required: true,
  type: "relation",
}

describe("getGenericArgList", () => {
  it("returns a list of generic args", () => {
    expect(getGenericArgList([jsonField1])).toEqual(["Tdata1"])
    expect(getGenericArgList([textField, jsonField1, jsonField2])).toEqual([
      "Tdata1",
      "Tdata2",
    ])
  })

  it("sorts the arg list", () => {
    expect(getGenericArgList([jsonField2, jsonField1])).toEqual([
      "Tdata1",
      "Tdata2",
    ])
  })
})

describe("getGenericArgStringWithDefault", () => {
  it("empty string when no generic fields", () => {
    expect(
      getGenericArgStringWithDefault([textField], { includeExpand: false })
    ).toEqual("")
  })

  it("returns a single generic string", () => {
    expect(
      getGenericArgStringWithDefault([textField, jsonField1], {
        includeExpand: false,
      })
    ).toEqual("<Tdata1 = unknown>")
  })

  it("multiple generics with a record", () => {
    expect(
      getGenericArgStringWithDefault([textField, jsonField1, jsonField2], {
        includeExpand: false,
      })
    ).toEqual("<Tdata1 = unknown, Tdata2 = unknown>")
  })

  it("sorts the arguments", () => {
    expect(
      getGenericArgStringWithDefault([textField, jsonField2, jsonField1], {
        includeExpand: false,
      })
    ).toEqual("<Tdata1 = unknown, Tdata2 = unknown>")
  })

  it("includes generic arg for expand fields", () => {
    expect(
      getGenericArgStringWithDefault(
        [textField, jsonField2, jsonField1, expandField],
        {
          includeExpand: true,
        }
      )
    ).toEqual("<Tdata1 = unknown, Tdata2 = unknown, Texpand = unknown>")
  })
})

describe("getGenericArgStringForRecord", () => {
  it("empty string when no generic fields", () => {
    expect(getGenericArgStringForRecord([textField])).toEqual("")
  })

  it("returns a single generic string", () => {
    expect(getGenericArgStringForRecord([textField, jsonField1])).toEqual(
      "<Tdata1>"
    )
  })

  it("multiple generics with a record", () => {
    expect(
      getGenericArgStringForRecord([textField, jsonField1, jsonField2])
    ).toEqual("<Tdata1, Tdata2>")
  })

  it("sorts the arguments", () => {
    expect(
      getGenericArgStringForRecord([textField, jsonField2, jsonField1])
    ).toEqual("<Tdata1, Tdata2>")
  })
})

describe("canExpand", () => {
  it("detects collections that can be expanded", () => {
    expect(canExpand([textField, jsonField1, expandField])).toEqual(true)
  })
  it("detects collections that cannot be expanded", () => {
    expect(canExpand([textField, jsonField1])).toEqual(false)
  })
})
