export type FetchFn = typeof fetch

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
  if (!res?.ok) throw res
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
  if (!loginRes?.ok) throw loginRes
  const loginData = (await loginRes.json()) as { token: string }

  return fetchWithAuth(
    `${url}/api/collections?perPage=200`,
    loginData.token,
    fetchFn
  )
}
