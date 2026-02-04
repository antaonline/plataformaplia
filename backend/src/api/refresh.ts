export async function refreshToken() {
  const res = await fetch('http://localhost:3000/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  })

  if (!res.ok) throw new Error('No refresh')

  const data = await res.json()
  localStorage.setItem('access_token', data.access_token)
}
