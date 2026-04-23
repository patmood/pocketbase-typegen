import { afterEach, describe, expect, it, vi } from "vitest"

import { fetchWithAuth, loginAndFetch, FetchFn } from "../src/http"

function mockFetch(responses: Array<unknown>): FetchFn {
  let callIndex = 0
  return vi.fn(() => {
    const response = responses[callIndex++]
    return Promise.resolve(response)
  }) as unknown as FetchFn
}

function okResponse(json: unknown) {
  return {
    ok: true,
    json: () => Promise.resolve(json),
  }
}

function errorResponse() {
  return {
    ok: false,
    json: () => Promise.resolve({}),
  }
}

describe("fetchWithAuth", () => {
  it("calls fetch with authorization header", async () => {
    const fetch = mockFetch([okResponse({ items: [] })])

    const result = await fetchWithAuth(
      "http://localhost:8090/api/collections?perPage=200",
      "test-token",
      fetch
    )

    expect(result).toEqual({ items: [] })
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8090/api/collections?perPage=200",
      {
        headers: {
          Authorization: "test-token",
        },
      }
    )
  })

  it("throws when response is not ok", async () => {
    const err = errorResponse()
    const fetch = mockFetch([err])

    await expect(
      fetchWithAuth("http://localhost:8090/api/collections", "bad-token", fetch)
    ).rejects.toBe(err)
  })
})

describe("loginAndFetch", () => {
  it("logs in then fetches collections with the returned token", async () => {
    const fetch = mockFetch([
      okResponse({ token: "auth-token-123" }),
      okResponse({ items: [{ name: "posts" }] }),
    ])

    const result = await loginAndFetch(
      "http://localhost:8090",
      "admin@test.com",
      "secret",
      fetch
    )

    expect(result).toEqual({ items: [{ name: "posts" }] })

    // First call: login
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      "http://localhost:8090/api/collections/_superusers/auth-with-password",
      expect.objectContaining({ method: "POST" })
    )

    // Second call: fetchWithAuth with the token from login
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8090/api/collections?perPage=200",
      {
        headers: {
          Authorization: "auth-token-123",
        },
      }
    )
  })

  it("throws when login response is not ok", async () => {
    const err = errorResponse()
    const fetch = mockFetch([err])

    await expect(
      loginAndFetch("http://localhost:8090", "admin@test.com", "wrong", fetch)
    ).rejects.toBe(err)
  })
})

describe("fetchWithAuth default parameter", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("uses globalThis.fetch as default when fetchFn is not provided", async () => {
    const originalFetch = globalThis.fetch
    const mock = vi.fn(() => Promise.resolve(okResponse({ items: [] })))
    globalThis.fetch = mock as unknown as FetchFn

    const result = await fetchWithAuth(
      "http://localhost:8090/api/collections?perPage=200",
      "test-token"
    )

    expect(result).toEqual({ items: [] })
    expect(mock).toHaveBeenCalledWith(
      "http://localhost:8090/api/collections?perPage=200",
      {
        headers: { Authorization: "test-token" },
      }
    )

    globalThis.fetch = originalFetch
  })
})

describe("loginAndFetch default parameter", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("uses globalThis.fetch as default when fetchFn is not provided", async () => {
    const originalFetch = globalThis.fetch
    const mock = vi
      .fn()
      .mockResolvedValueOnce(okResponse({ token: "auth-token-123" }))
      .mockResolvedValueOnce(okResponse({ items: [{ name: "posts" }] }))
    globalThis.fetch = mock as unknown as FetchFn

    const result = await loginAndFetch(
      "http://localhost:8090",
      "admin@test.com",
      "secret"
    )

    expect(result).toEqual({ items: [{ name: "posts" }] })
    expect(mock).toHaveBeenCalledTimes(2)

    globalThis.fetch = originalFetch
  })
})
