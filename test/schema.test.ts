import { afterEach, describe, expect, it, vi } from "vitest"

import {
  fromDatabase,
  fromJSON,
  fromURLWithPassword,
  fromURLWithToken,
} from "../src/schema"

import { CollectionRecord } from "../src/types"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

vi.mock("../src/sqlite", () => ({
  getSQLiteAdapter: vi.fn(),
}))

vi.mock("../src/http", () => ({
  fetchWithAuth: vi.fn(),
  loginAndFetch: vi.fn(),
}))

import { getSQLiteAdapter } from "../src/sqlite"
import { fetchWithAuth, loginAndFetch } from "../src/http"

const mockGetSQLiteAdapter = vi.mocked(getSQLiteAdapter)
const mockFetchWithAuth = vi.mocked(fetchWithAuth)
const mockLoginAndFetch = vi.mocked(loginAndFetch)

describe("fromDatabase", () => {
  it("parses collections with fields JSON", async () => {
    mockGetSQLiteAdapter.mockResolvedValue({
      queryAll: vi.fn().mockReturnValue([
        {
          id: "1",
          name: "posts",
          type: "base",
          fields: '[{"id":"f1","name":"title","type":"text"}]',
          system: false,
          listRule: null,
          viewRule: null,
          createRule: null,
          updateRule: null,
          deleteRule: null,
        },
      ]),
    })

    const result = await fromDatabase("/fake/db.sqlite")
    expect(result[0].fields).toEqual([
      { id: "f1", name: "title", type: "text" },
    ])
  })

  it("falls back to schema when fields is undefined", async () => {
    mockGetSQLiteAdapter.mockResolvedValue({
      queryAll: vi.fn().mockReturnValue([
        {
          id: "2",
          name: "comments",
          type: "base",
          schema: '[{"id":"f2","name":"body","type":"text"}]',
          system: false,
          listRule: null,
          viewRule: null,
          createRule: null,
          updateRule: null,
          deleteRule: null,
        },
      ]),
    })

    const result = await fromDatabase("/fake/db.sqlite")
    expect(result[0].fields).toEqual([{ id: "f2", name: "body", type: "text" }])
  })

  it("falls back to empty object when both fields and schema are undefined", async () => {
    mockGetSQLiteAdapter.mockResolvedValue({
      queryAll: vi.fn().mockReturnValue([
        {
          id: "3",
          name: "minimal",
          type: "base",
          system: false,
          listRule: null,
          viewRule: null,
          createRule: null,
          updateRule: null,
          deleteRule: null,
        },
      ]),
    })

    const result = await fromDatabase("/fake/db.sqlite")
    expect(result[0].fields).toEqual({})
  })
})

describe("fromJSON", () => {
  it("reads and parses a JSON schema file", async () => {
    const result = await fromJSON(path.resolve(__dirname, "pb_schema.json"))
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })
})

describe("fromURLWithToken", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns items on success", async () => {
    const items: Array<CollectionRecord> = [
      {
        id: "1",
        name: "posts",
        type: "base",
        fields: [],
        system: false,
        listRule: null,
        viewRule: null,
        createRule: null,
        updateRule: null,
        deleteRule: null,
      },
    ]
    mockFetchWithAuth.mockResolvedValue({ items })

    const result = await fromURLWithToken("http://localhost:8090", "my-token")
    expect(result).toEqual(items)
    expect(mockFetchWithAuth).toHaveBeenCalledWith(
      "http://localhost:8090/api/collections?perPage=200",
      "my-token"
    )
  })

  it("uses default empty token when not provided", async () => {
    mockFetchWithAuth.mockResolvedValue({ items: [] })

    await fromURLWithToken("http://localhost:8090")

    expect(mockFetchWithAuth).toHaveBeenCalledWith(
      "http://localhost:8090/api/collections?perPage=200",
      ""
    )
  })

  it("throws a descriptive error on failure", async () => {
    mockFetchWithAuth.mockRejectedValue(new Error("Unauthorized"))

    await expect(
      fromURLWithToken("http://localhost:8090", "bad-token")
    ).rejects.toThrow("Failed to load schema from URL")
  })
})

describe("fromURLWithPassword", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns items on success", async () => {
    const items: Array<CollectionRecord> = [
      {
        id: "1",
        name: "posts",
        type: "base",
        fields: [],
        system: false,
        listRule: null,
        viewRule: null,
        createRule: null,
        updateRule: null,
        deleteRule: null,
      },
    ]
    mockLoginAndFetch.mockResolvedValue({ items })

    const result = await fromURLWithPassword(
      "http://localhost:8090",
      "admin@test.com",
      "secret"
    )
    expect(result).toEqual(items)
    expect(mockLoginAndFetch).toHaveBeenCalledWith(
      "http://localhost:8090",
      "admin@test.com",
      "secret"
    )
  })

  it("uses default empty email and password when not provided", async () => {
    mockLoginAndFetch.mockResolvedValue({ items: [] })

    await fromURLWithPassword("http://localhost:8090")

    expect(mockLoginAndFetch).toHaveBeenCalledWith(
      "http://localhost:8090",
      "",
      ""
    )
  })

  it("throws a descriptive error on failure", async () => {
    mockLoginAndFetch.mockRejectedValue(new Error("Unauthorized"))

    await expect(
      fromURLWithPassword("http://localhost:8090", "admin@test.com", "wrong")
    ).rejects.toThrow("Failed to load schema from URL")
  })
})
