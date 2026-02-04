export async function apiFetch(
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
}
