import { afterEach, describe, expect, it, vi } from "vitest"

import {
  getOptionEnumName,
  getOptionValues,
  getSystemFields,
  sanitizeFieldName,
  toPascalCase,
} from "../src/utils"

import { FieldSchema } from "../src/types"

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
    expect(getSystemFields("auth")).toBe("AuthSystemFields")
    expect(getSystemFields("base")).toBe("BaseSystemFields")
    expect(getSystemFields("view")).toBe("BaseSystemFields")
  })
})

describe("getOptionEnumName", () => {
  it("returns the enum name for select field options", () => {
    expect(getOptionEnumName("orders", "type")).toBe("OrdersTypeOptions")
    expect(getOptionEnumName("orders_with_underscore", "type_underscore")).toBe(
      "OrdersWithUnderscoreTypeUnderscoreOptions"
    )
  })
})

describe("getOptionValues", () => {
  it("returns empty array when no select field values", () => {
    const fieldWithoutValues: FieldSchema = {
      id: "1",
      name: "myfield",
      required: false,
      system: false,
      type: "text",
      unique: false,
    }
    expect(getOptionValues(fieldWithoutValues)).toEqual([])
  })

  it("returns deduped select field values", () => {
    const fieldWithValues: FieldSchema = {
      id: "1",
      name: "myfield",
      values: ["one", "one", "one", "two"],
      required: false,
      system: false,
      type: "text",
      unique: false,
    }
    expect(getOptionValues(fieldWithValues)).toEqual(["one", "two"])
  })
})

const { mockWriteFile } = vi.hoisted(() => ({
  mockWriteFile: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("fs")>()
  return {
    ...actual,
    promises: {
      ...actual.promises,
      writeFile: mockWriteFile,
    },
  }
})

describe("saveFile", () => {
  afterEach(() => {
    mockWriteFile.mockClear()
  })

  it("writes the file and logs the path", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {})

    const { saveFile } = await import("../src/utils")
    await saveFile("/tmp/output.ts", "type Foo = string")

    expect(mockWriteFile).toHaveBeenCalledWith(
      "/tmp/output.ts",
      "type Foo = string",
      "utf8"
    )
    expect(logSpy).toHaveBeenCalledWith(
      "Created typescript definitions at /tmp/output.ts"
    )

    logSpy.mockRestore()
  })
})
