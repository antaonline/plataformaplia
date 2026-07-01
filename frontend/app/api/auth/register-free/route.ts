import { NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL!

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Reenviamos la IP real del cliente para que el rate limiting del backend
    // (5 registros/10min por IP) cuente por usuario y no por el servidor Next.
    const xff =
      req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? ''

    const res = await fetch(`${API_URL}/api/auth/register-free`, {
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
        { message: data.message ?? 'No se pudo crear la cuenta.' },
        { status: res.status },
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error interno al crear la cuenta.' },
      { status: 500 },
    )
  }
}
