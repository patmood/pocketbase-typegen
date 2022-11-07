import {
  getOptionEnumName,
  getSystemFields,
  sanitizeFieldName,
  toPascalCase,
} from "../src/utils"

describe("toPascalCase", () => {
  it("return pascal case string", () => {
    expect(toPascalCase("foo bar")).toEqual("FooBar")
    expect(toPascalCase("Foo Bar")).toEqual("FooBar")
    expect(toPascalCase("fooBar")).toEqual("FooBar")
    expect(toPascalCase("FooBar")).toEqual("FooBar")
    expect(toPascalCase("--foo-bar--")).toEqual("FooBar")
    expect(toPascalCase("__FOO_BAR__")).toEqual("FooBar")
    expect(toPascalCase("!--foo-¿?-bar--121-**%")).toEqual("FooBar121")
    expect(toPascalCase("Here i am")).toEqual("HereIAm")
    expect(toPascalCase("FOO BAR")).toEqual("FooBar")
    expect(toPascalCase("ça.roule")).toEqual("ÇaRoule")
    expect(toPascalCase("добрий-день")).toEqual("ДобрийДень")
  })
})

describe("sanitizeFieldName", () => {
  it("returns valid typescript fields", () => {
    expect(sanitizeFieldName("foo_bar")).toEqual("foo_bar")
    expect(sanitizeFieldName("4number")).toEqual('"4number"')
  })
})

describe("getSystemFields", () => {
  it("returns the system field type name for a given collection type", () => {
    expect(getSystemFields("base")).toBe("BaseSystemFields")
    expect(getSystemFields("auth")).toBe("AuthSystemFields")
  })
})

describe("getOptionEnumName", () => {
  it("returns the enum name for select field options", () => {
    expect(getOptionEnumName("orders", "type")).toBe("OrdersTypeOptions")
  })
})
