export type FetchFn = typeof fetch

async function throwResponseError(
  res: Response | undefined,
  context: string
): Promise<never> {
  const status = res?.status ?? "unknown"
  const statusText = res?.statusText ? ` ${res.statusText}` : ""
  let body = ""
  try {
    body = res?.text ? await res.text() : ""
  } catch {
    // Ignore errors reading the response body
  }
  throw new Error(
    `${context} failed with status ${status}${statusText}${
      body ? `: ${body}` : ""
    }`
  )
}

export async function fetchWithAuth(
  url: string,
  token: string,
  fetchFn: FetchFn = globalThis.fetch
): Promise<unknown> {
  const res = await fetchFn(url, {
    headers: {
      Authorization: token,
    },
  })
  if (!res?.ok) await throwResponseError(res, `Fetching ${url}`)
  return res.json()
}

export async function loginAndFetch(
  url: string,
  email: string,
  password: string,
  fetchFn: FetchFn = globalThis.fetch
): Promise<unknown> {
  const formData = new FormData()
  formData.append("identity", email)
  formData.append("password", password)

  const loginRes = await fetchFn(
    `${url}/api/collections/_superusers/auth-with-password`,
    {
      body: formData,
      method: "POST",
    }
  )
  if (!loginRes?.ok) {
    await throwResponseError(loginRes, "PocketBase authentication")
  }
  const loginData = (await loginRes.json()) as { token: string }

  return fetchWithAuth(
    `${url}/api/collections?perPage=200`,
    loginData.token,
    fetchFn
  )
}
