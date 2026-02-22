import { NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL!

export async function POST(req: Request) {
  const body = await req.json()

  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  console.log('API_URL:', API_URL)

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
