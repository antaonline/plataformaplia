
export async function apiFetch(
  url: string,
  options?: RequestInit
) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const isLocalApi = url.startsWith('/api')

  if (!isLocalApi && !API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL no está definida')
  }

  const base = API_URL?.endsWith('/api') ? API_URL.slice(0, -4) : API_URL
  const finalUrl = isLocalApi ? url : `${base}${url}`

  const res = await fetch(finalUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  })

  return res
}