import { NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL!

export async function POST(req: Request) {
  const body = await req.json()

  // Reenviamos la IP real del cliente. Sin esto, el backend ve la IP del
  // servidor Next para TODOS los logins y el rate limiting (5/min por IP)
  // bloquearía a todos los usuarios juntos tras 5 intentos.
  const xff =
    req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? ''

  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(xff ? { 'x-forwarded-for': xff } : {}),
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
