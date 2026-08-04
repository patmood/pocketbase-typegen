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

function errorResponse(
  status = 400,
  statusText = "Bad Request",
  body = "something went wrong"
) {
  return {
    json: () => Promise.resolve({}),
    ok: false,
    status,
    statusText,
    text: () => Promise.resolve(body),
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

  it("throws a descriptive error when response is not ok", async () => {
    const fetch = mockFetch([
      errorResponse(401, "Unauthorized", "invalid token"),
    ])

    await expect(
      fetchWithAuth("http://localhost:8090/api/collections", "bad-token", fetch)
    ).rejects.toThrow(
      "Fetching http://localhost:8090/api/collections failed with status 401 Unauthorized: invalid token"
    )
  })

  it("throws a descriptive error when response body cannot be read", async () => {
    const fetch = mockFetch([
      {
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: () => Promise.reject(new Error("stream error")),
      },
    ])

    await expect(
      fetchWithAuth("http://localhost:8090/api/collections", "token", fetch)
    ).rejects.toThrow(
      "Fetching http://localhost:8090/api/collections failed with status 500 Internal Server Error"
    )
  })

  it("throws a descriptive error when response has no status details", async () => {
    const fetch = mockFetch([{ ok: false }])

    await expect(
      fetchWithAuth("http://localhost:8090/api/collections", "token", fetch)
    ).rejects.toThrow(
      "Fetching http://localhost:8090/api/collections failed with status unknown"
    )
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

  it("throws a descriptive error when login response is undefined", async () => {
    const fetch = mockFetch([undefined])

    await expect(
      loginAndFetch("http://localhost:8090", "admin@test.com", "wrong", fetch)
    ).rejects.toThrow("PocketBase authentication failed with status unknown")
  })

  it("throws a descriptive error when login response is not ok", async () => {
    const fetch = mockFetch([
      errorResponse(400, "Bad Request", "Failed to authenticate."),
    ])

    await expect(
      loginAndFetch("http://localhost:8090", "admin@test.com", "wrong", fetch)
    ).rejects.toThrow(
      "PocketBase authentication failed with status 400 Bad Request: Failed to authenticate."
    )
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
