import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL! // ej: http://localhost:3002

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Reenviamos la IP real del cliente para el rate limiting del backend.
    const xff =
      req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? ''

    const res = await fetch(`${BACKEND_URL}/api/auth/verify-2fa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(xff ? { 'x-forwarded-for': xff } : {}),
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message ?? 'Error verificando 2FA' },
        { status: res.status },
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error interno verify-2fa' },
      { status: 500 },
    )
  }
}
