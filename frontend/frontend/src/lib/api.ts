/*export async function apiFetch(
  url: string,
  options?: RequestInit
) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  })

  let data = null

  try {
    data = await res.json()
  } catch {
    // backend no devolvió JSON
  }

  if (!res.ok) {
    throw new Error(
      data?.message || 'Error en la solicitud'
    )
  }

  return data
}*/

export async function apiFetch(
  url: string,
  options?: RequestInit
) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  if (!API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL no está definida')
  }

  const base = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL
  const finalUrl = url.startsWith('/api') ? `${base}${url}` : `${API_URL}${url}`

  const res = await fetch(finalUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  })

  return res
}
