import {
  createCollectionEnum,
  createCollectionRecords,
  createCollectionResponses,
  createEnhancedPocketBase,
} from "../src/collections"
import { CollectionRecordWithRelations } from "../src/types"

const mockCollections: CollectionRecordWithRelations[] = [
  {
    id: "1",
    name: "book",
    type: "base",
    system: false,
    fields: [],
    relations: {},
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
  },
  {
    id: "2",
    name: "magazine",
    type: "base",
    system: false,
    fields: [],
    relations: {},
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
  },
]

describe("createCollectionEnum", () => {
  it("creates enum of collection names", () => {
    const names = ["book", "magazine"]
    expect(createCollectionEnum(names)).toMatchSnapshot()
  })
})

describe("createCollectionRecords", () => {
  it("creates mapping of collection name to record type", () => {
    expect(createCollectionRecords(mockCollections)).toMatchSnapshot()
  })
})

describe("createCollectionResponses", () => {
  it("creates mapping of collection name to response type", () => {
    expect(createCollectionResponses(mockCollections)).toMatchSnapshot()
  })
})

describe("createEnhancedPocketBase", () => {
  it("creates typed variant of PocketBase client", () => {
    expect(createEnhancedPocketBase(mockCollections)).toMatchSnapshot()
  })
})
