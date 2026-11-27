import { describe, expect, it } from "vitest"

import {
  createCollectionEnum,
  createCollectionRecords,
  createCollectionResponses,
} from "../src/collections"

const names = new Map([
  ["book", "Book"],
  ["magazine", "Magazine"],
])

describe("createCollectionEnum", () => {
  it("creates as const object of collection names", () => {
    expect(createCollectionEnum(names)).toMatchSnapshot()
  })
})

describe("createCollectionRecords", () => {
  it("creates mapping of collection name to record type", () => {
    expect(createCollectionRecords(names)).toMatchSnapshot()
  })
})

describe("createCollectionResponses", () => {
  it("creates mapping of collection name to response type", () => {
    expect(createCollectionResponses(names)).toMatchSnapshot()
  })
})
