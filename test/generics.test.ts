import {
  getGenericArgList,
  getGenericArgStringForRecord,
  getGenericArgStringWithDefault,
  getGenericArgForExpand,
} from "../src/generics"
import { FieldSchema, RelationNode, CollectionRecord } from "../src/types"

const mockField = ({
  id,
  name,
  type,
  ...rest
}: Pick<FieldSchema, "id" | "name" | "type"> &
  Partial<Omit<FieldSchema, "id" | "name" | "type">>): FieldSchema => ({
  id,
  name,
  type,
  required: false,
  system: false,
  unique: false,
  ...rest,
})

const textField = mockField({
  id: "1",
  name: "field1",
  type: "text",
  required: true,
})
const jsonField1 = mockField({
  id: "2",
  name: "data1",
  type: "json",
  required: true,
})
const jsonField2 = mockField({
  id: "3",
  name: "data2",
  type: "json",
  required: true,
})
const expandField = mockField({
  id: "4",
  name: "post_relation_field",
  type: "relation",
  required: true,
})

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
          relationGraph: [],
          collectionId: "collection1",
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

describe("getGenericArgForExpand", () => {
  const mockCollection = (
    overrides: Partial<CollectionRecord>
  ): CollectionRecord => ({
    id: "default_id",
    name: "default_name",
    type: "base",
    system: false,
    fields: [],
    createRule: null,
    deleteRule: null,
    listRule: null,
    updateRule: null,
    viewRule: null,
    ...overrides,
  })

  const mockRelationNode = (
    opts: Pick<RelationNode, "name" | "id"> & Partial<RelationNode>
  ): RelationNode => ({
    ...opts,
    children: new Map(),
    owners: new Map(),
    ...mockCollection(opts),
  })

  it("returns unknown for non-existent collection", () => {
    const result = getGenericArgForExpand("non-existent", [])
    expect(result).toBe("unknown")
  })

  it("returns unknown for collection with no relationships", () => {
    const node = mockRelationNode({ id: "collection1", name: "books" })
    const result = getGenericArgForExpand("collection1", [node])
    expect(result).toBe("unknown")
  })

  it("generates expand type for collection with owner relationships", () => {
    const authorField = mockField({
      id: "field1",
      name: "author_field",
      type: "relation",
    })
    const authorNode = mockRelationNode({
      id: "author1",
      name: "authors_collection",
    })
    const bookNode = mockRelationNode({
      id: "book1",
      name: "books",
      children: new Map(),
      owners: new Map([[authorField, authorNode]]),
    })

    const result = getGenericArgForExpand("book1", [authorNode, bookNode])
    expect(result).toBe(`{
\tauthor_field?: AuthorsCollectionRecord
}`)
  })

  it("generates expand type for collection with child relationships", () => {
    const booksField = mockField({
      id: "field2",
      name: "books_field",
      type: "relation",
    })
    const bookNode = mockRelationNode({
      id: "book1",
      name: "books_collection",
    })
    const authorNode = mockRelationNode({
      id: "author1",
      name: "authors_collection",
      children: new Map([[booksField, bookNode]]),
    })

    const result = getGenericArgForExpand("author1", [authorNode, bookNode])
    expect(result).toBe(`{
\tbooks_collection_via_books_field?: BooksCollectionRecord[]
}`)
  })

  it("generates expand type with both owner and child relationships", () => {
    const authorField = mockField({
      id: "field1",
      name: "author_field",
      type: "relation",
    })
    const reviewField = mockField({
      id: "field3",
      name: "reviews_field",
      type: "relation",
    })
    const bookNode = mockRelationNode({
      id: "book1",
      name: "books_collection",
    })
    const authorNode = mockRelationNode({
      id: "author1",
      name: "authors_collection",
    })
    const reviewNode = mockRelationNode({
      id: "review1",
      name: "reviews_collection",
    })

    bookNode.children = new Map([[reviewField, reviewNode]])
    bookNode.owners = new Map([[authorField, authorNode]])

    const result = getGenericArgForExpand("book1", [
      authorNode,
      bookNode,
      reviewNode,
    ])
    expect(result).toBe(`{
\tauthor_field?: AuthorsCollectionRecord,
\treviews_collection_via_reviews_field?: ReviewsCollectionRecord[]
}`)
  })
})
