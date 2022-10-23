import { FieldSchema } from "../src/types"
import { getGenericArgString } from "../src/generics"

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
describe("getGenericArgString", () => {
  it("empty string when no generic fields", () => {
    expect(getGenericArgString([textField])).toBe("")
  })

  it("returns a single generic string", () => {
    expect(getGenericArgString([textField, jsonField1])).toBe(
      "<Tdata1 = unknown>"
    )
  })

  it("multiple generics with a record", () => {
    expect(getGenericArgString([textField, jsonField1, jsonField2])).toBe(
      "<Tdata1 = unknown, Tdata2 = unknown>"
    )
  })
})
