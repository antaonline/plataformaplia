export async function login(email: string, password: string) {
  const res = await fetch('http://localhost:3002/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // 🔥 IMPORTANTE Refresh token
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    throw new Error('Credenciales inválidas')
  }

  return res.json()
}
