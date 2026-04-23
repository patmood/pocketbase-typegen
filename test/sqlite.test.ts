import { describe, expect, it, vi } from "vitest"

import { getSQLiteAdapter } from "../src/sqlite"

// Mock better-sqlite3 for the dynamic import inside createNodeAdapter
vi.mock("better-sqlite3", () => {
  const mockClose = vi.fn()
  const mockAll = vi
    .fn()
    .mockReturnValue([{ id: "1", name: "test", fields: "[]", schema: "[]" }])
  const mockPrepare = vi.fn().mockReturnValue({ all: mockAll })
  const mockConstructor = vi.fn().mockReturnValue({
    prepare: mockPrepare,
    close: mockClose,
  })
  return {
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
    const mockConstructor = (await import("better-sqlite3"))
      .default as unknown as ReturnType<typeof vi.fn>
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
