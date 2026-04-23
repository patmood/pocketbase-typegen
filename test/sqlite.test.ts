import { getSQLiteAdapter } from "../src/sqlite"

// Mock better-sqlite3 for the dynamic import inside createNodeAdapter
jest.mock("better-sqlite3", () => {
  const mockClose = jest.fn()
  const mockAll = jest.fn().mockReturnValue([
    { id: "1", name: "test", fields: "[]", schema: "[]" },
  ])
  const mockPrepare = jest.fn().mockReturnValue({ all: mockAll })
  const mockConstructor = jest.fn().mockReturnValue({
    prepare: mockPrepare,
    close: mockClose,
  })
  return {
    __esModule: true,
    default: mockConstructor,
  }
})

describe("getSQLiteAdapter", () => {
  it("returns an adapter with a queryAll method", async () => {
    const adapter = await getSQLiteAdapter()
    expect(adapter).toBeDefined()
    expect(typeof adapter.queryAll).toBe("function")
  })

  it("queryAll creates a readonly db, executes query, and closes", async () => {
    const mockConstructor = require("better-sqlite3").default as jest.Mock
    const adapter = await getSQLiteAdapter()

    const rows = adapter.queryAll(
      "/fake/db.sqlite",
      "SELECT * FROM _collections"
    )

    expect(mockConstructor).toHaveBeenCalledWith("/fake/db.sqlite", {
      readonly: true,
    })

    const mockInstance = mockConstructor.mock.results[0].value
    expect(mockInstance.prepare).toHaveBeenCalledWith(
      "SELECT * FROM _collections"
    )
    expect(mockInstance.close).toHaveBeenCalled()
    expect(Array.isArray(rows)).toBe(true)
  })
})
