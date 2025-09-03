import {
  getGenericArgList,
  getGenericArgStringForRecord,
  getGenericArgStringWithDefault,
  getGenericArgForExpand,
} from "../src/generics"
import { FieldSchema, RelationNode, CollectionRecord } from "../src/types"

const mockField = (overrides: Partial<FieldSchema>): FieldSchema => ({
  id: crypto.randomUUID(),
  name: "default_name",
  type: "text",
  required: false,
  system: false,
  unique: false,
  ...overrides,
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
    id: crypto.randomUUID(),
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
    opts: Pick<RelationNode, "name"> & Partial<RelationNode>
  ): RelationNode => ({
    children: new Map(),
    parents: new Map(),
    ...mockCollection(opts),
  })

  const addRelationship = (
    parentNode: RelationNode,
    childNode: RelationNode,
    fieldName: string
  ) => {
    const field = mockField({
      name: fieldName,
      type: "relation",
      options: {
        collectionId: parentNode.id,
      },
    })
    childNode.fields.push(field)
    parentNode.children.set(field, childNode)
    childNode.parents.set(field, parentNode)
  }

  it("returns unknown for non-existent collection", () => {
    const result = getGenericArgForExpand("non-existent", [])
    expect(result).toBe("unknown")
  })

  it("returns unknown for collection with no relationships", () => {
    const node = mockRelationNode({ name: "books" })
    const result = getGenericArgForExpand("collection1", [node])
    expect(result).toBe("unknown")
  })

  describe("for defined relationships", () => {
    const authors = mockRelationNode({
      name: "authors_collection",
    })
    const courses = mockRelationNode({
      name: "courses_collection",
    })
    const chapters = mockRelationNode({
      name: "chapters_collection",
    })

    addRelationship(authors, courses, "author_field")
    addRelationship(courses, chapters, "course_field")
    addRelationship(chapters, chapters, "parent_chapter")

    it("generates expand type for collection with owner relationships", () => {
      const result = getGenericArgForExpand(courses.id, [
        courses,
        chapters,
        authors,
      ])

      expect(result).toBe(`{
\tauthor_field?: AuthorsCollectionResponse,
\tchapters_collection_via_course_field?: ChaptersCollectionResponse[]
}`)

      const result2 = getGenericArgForExpand(authors.id, [
        courses,
        chapters,
        authors,
      ])

      expect(result2).toBe(`{
\tcourses_collection_via_author_field?: CoursesCollectionResponse[]
}`)
    })

    it("generates expand type for hierarchical relationships", () => {
      const result = getGenericArgForExpand(chapters.id, [
        courses,
        chapters,
        authors,
      ])

      expect(result).toBe(`{
\tcourse_field?: CoursesCollectionResponse,
\tparent_chapter?: ChaptersCollectionResponse,
\tchapters_collection_via_parent_chapter?: ChaptersCollectionResponse[]
}`)
    })
  })
})
