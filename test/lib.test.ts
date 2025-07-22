import { CollectionRecord, FieldSchema } from "../src/types"
import {
  createRecordType,
  createRelationshipGraph,
  createResponseType,
  generate,
} from "../src/lib"

describe("generate", () => {
  it("generates correct output given db input", () => {
    const collections: Array<CollectionRecord> = [
      {
        createRule: null,
        deleteRule: null,
        id: "123",
        listRule: null,
        name: "books",
        fields: [
          {
            id: "xyz",
            name: "title",
            required: false,
            system: false,
            type: "text",
            unique: false,
          },
        ],
        system: false,
        type: "base",
        updateRule: null,
        viewRule: null,
      },
    ]
    const result = generate(collections, { sdk: true })
    expect(result).toMatchSnapshot()
  })

  it("skips generatic sdk if told not to", () => {
    const collections: Array<CollectionRecord> = [
      {
        createRule: null,
        deleteRule: null,
        id: "123",
        listRule: null,
        name: "books",
        fields: [
          {
            id: "xyz",
            name: "title",
            required: false,
            system: false,
            type: "text",
            unique: false,
          },
        ],
        system: false,
        type: "base",
        updateRule: null,
        viewRule: null,
      },
    ]
    const result = generate(collections, { sdk: false })
    expect(result).not.toMatch(/import .* from 'pocketbase'/)
  })
})

describe("createRecordType", () => {
  it("creates type definition for a record", () => {
    const name = "books"
    const schema: FieldSchema[] = [
      {
        id: "hhnwjkke",
        name: "title",
        max: null,
        min: null,
        pattern: "",
        required: false,
        system: false,
        type: "text",
        unique: false,
      },
    ]
    const result = createRecordType(name, schema)
    expect(result).toMatchSnapshot()
  })

  it("handles file fields with multiple files", () => {
    const name = "books"
    const schema: FieldSchema[] = [
      {
        id: "hhnwjkke",
        name: "avatars",
        maxSelect: 2,
        required: false,
        system: false,
        type: "file",
        unique: false,
      },
    ]
    const result = createRecordType(name, schema)
    expect(result).toMatchSnapshot()
  })

  it("sorts fields alphabetically", () => {
    const name = "books"
    const schema: FieldSchema[] = [
      {
        id: "1",
        name: "banana",
        required: false,
        system: false,
        type: "text",
        unique: false,
      },
      {
        id: "1",
        name: "apple",
        required: false,
        system: false,
        type: "text",
        unique: false,
      },
    ]
    const result = createRecordType(name, schema)
    const aIndex = result.indexOf("apple")
    const bIndex = result.indexOf("banana")
    expect(aIndex).toBeGreaterThan(0)
    expect(bIndex).toBeGreaterThan(0)
    expect(aIndex).toBeLessThan(bIndex)
  })
})

describe("createResponseType", () => {
  it("creates type definition for a response", () => {
    const row: CollectionRecord = {
      createRule: null,
      deleteRule: null,
      id: "123",
      listRule: null,
      name: "books",
      fields: [
        {
          id: "hhnwjkke",
          name: "title",
          max: null,
          min: null,
          pattern: "",
          required: false,
          system: false,
          type: "text",
          unique: false,
        },
      ],
      system: false,
      type: "base",
      updateRule: null,
      viewRule: null,
    }

    const result = createResponseType(row, [])
    expect(result).toMatchSnapshot()
  })

  it("handles file fields with multiple files", () => {
    const name = "books"
    const schema: FieldSchema[] = [
      {
        id: "hhnwjkke",
        name: "avatars",
        maxSelect: 2,
        required: false,
        system: false,
        type: "file",
        unique: false,
      },
    ]
    const result = createRecordType(name, schema)
    expect(result).toMatchSnapshot()
  })
})

describe("createRelationshipGraph", () => {
  const mockField = (overrides: Partial<FieldSchema>): FieldSchema => ({
    id: crypto.randomUUID(),
    name: "default_name",
    type: "text",
    required: false,
    system: false,
    unique: false,
    ...overrides,
  })

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

  it("creates empty graph from empty collections", () => {
    const result = createRelationshipGraph([])
    expect(result).toEqual([])
  })

  it("creates graph with no relationships for standalone collections", () => {
    const collections = [
      mockCollection({ name: "users" }),
      mockCollection({ name: "posts" }),
    ]
    const graph = createRelationshipGraph(collections)

    expect(graph).toHaveLength(2)
    expect(graph[0].children.size).toBe(0)
    expect(graph[0].parents.size).toBe(0)
    expect(graph[1].children.size).toBe(0)
    expect(graph[1].parents.size).toBe(0)
  })

  it("creates parent-child relationships correctly", () => {
    const authors = mockCollection({
      name: "authors",
      fields: [mockField({ name: "name", type: "text" })],
    })
    const courses = mockCollection({
      name: "courses",
      fields: [
        mockField({ name: "name", type: "text" }),
        mockField({
          name: "author",
          type: "relation",
          options: { collectionId: authors.id },
        }),
      ],
    })
    const chaptersId = crypto.randomUUID()
    const chapters = mockCollection({
      id: chaptersId,
      name: "chapters",
      fields: [
        mockField({ name: "title", type: "text" }),
        mockField({
          name: "course",
          type: "relation",
          options: { collectionId: courses.id },
        }),
        mockField({
          name: "parent",
          type: "relation",
          options: { collectionId: chaptersId },
        }),
      ],
    })
    const graph = createRelationshipGraph([courses, chapters, authors])

    const authorNode = graph.find((n) => n.id === authors.id)!
    const chapterNode = graph.find((n) => n.id === chapters.id)!
    const courseNode = graph.find((n) => n.id === courses.id)!

    expect(chapterNode.children.size).toBe(1)
    expect(chapterNode.parents.size).toBe(2)
    const [[chapterChildrenField, chapterChildrenCollection]] =
      chapterNode.children
    expect(chapterChildrenField.name).toBe("parent")
    expect(chapterChildrenCollection).toBe(chapterNode)
    const [
      [chapterOwnerField1, chapterOwner1],
      [chapterOwnerField2, chapterOwner2],
    ] = chapterNode.parents
    expect(chapterOwner1).toBe(courseNode)
    expect(chapterOwnerField1.name).toBe("course")
    expect(chapterOwner2).toBe(chapterNode)
    expect(chapterOwnerField2.name).toBe("parent")

    expect(courseNode.children.size).toBe(1)
    expect(courseNode.parents.size).toBe(1)
    const [[courseChildrenField, courseChildrenCollection]] =
      courseNode.children
    expect(courseChildrenField.name).toBe("course")
    expect(courseChildrenCollection).toBe(chapterNode)
    const [[courseOwnerField1, courseOwner1]] = courseNode.parents
    expect(courseOwner1).toBe(authorNode)
    expect(courseOwnerField1.name).toBe("author")

    expect(authorNode.children.size).toBe(1)
    expect(authorNode.parents.size).toBe(0)
    const [[authorChildrenField, authorChildrenCollection]] =
      authorNode.children
    expect(authorChildrenField.name).toBe("author")
    expect(authorChildrenCollection).toBe(courseNode)
  })

  it("handles broken relationship references gracefully", () => {
    const collections = [
      mockCollection({
        id: "post_id",
        name: "posts",
        fields: [
          mockField({
            id: "1",
            name: "author",
            type: "relation",
            options: {
              collectionId: "non_existent_id",
            },
          }),
        ],
      }),
    ]

    const graph = createRelationshipGraph(collections)
    expect(graph[0].parents.size).toBe(0)
    expect(graph[0].children.size).toBe(0)
  })
})
