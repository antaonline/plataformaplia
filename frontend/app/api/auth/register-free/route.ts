import { NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL!

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const res = await fetch(`${API_URL}/api/auth/register-free`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
