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

  it("creates empty graph from empty collections", () => {
    const result = createRelationshipGraph([])
    expect(result).toEqual([])
  })

  it("creates graph with no relationships for standalone collections", () => {
    const collections = [
      mockCollection({ id: "1", name: "users" }),
      mockCollection({ id: "2", name: "posts" }),
    ]
    const graph = createRelationshipGraph(collections)

    expect(graph).toHaveLength(2)
    expect(graph[0].children.size).toBe(0)
    expect(graph[0].owners.size).toBe(0)
    expect(graph[1].children.size).toBe(0)
    expect(graph[1].owners.size).toBe(0)
  })

  it("creates parent-child relationships correctly", () => {
    const authorCollection = mockCollection({
      id: "collection1",
      name: "authors",
      fields: [mockField({ id: "1", name: "name", type: "text" })],
    })
    const bookCollection = mockCollection({
      id: "collection2",
      name: "books",
      fields: [
        mockField({ id: "1", name: "title", type: "text" }),
        mockField({
          id: "1",
          name: "author",
          type: "relation",
          options: {
            collectionId: "collection1",
          },
        }),
      ],
    })
    const graph = createRelationshipGraph([authorCollection, bookCollection])
    console.log("🤖 graph", graph[1].fields)

    const authorNode = graph.find((n) => n.id === authorCollection.id)!
    const bookNode = graph.find((n) => n.id === bookCollection.id)!

    expect(bookNode.children.size).toBe(0)

    expect(authorNode.children.size).toBe(1)
    const [[, authorChildrenCollection]] = authorNode.children
    expect(authorChildrenCollection).toBe(bookNode)

    expect(bookNode.owners.size).toBe(1)
    const [[, bookOwnerCollection]] = bookNode.owners
    expect(bookOwnerCollection).toBe(authorNode)
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
    expect(graph[0].owners.size).toBe(0)
    expect(graph[0].children.size).toBe(0)
  })
})
