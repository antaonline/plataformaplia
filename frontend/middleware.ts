import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Atribución de afiliados: cuando alguien llega con ?ref=CODIGO a cualquier
// página de plia.pe, guardamos el código en la cookie `plia_ref` por 30 días.
// El checkout lee esa cookie y atribuye la venta. `plia_vid` es un id anónimo
// del visitante para deduplicar clicks.
const REF_COOKIE = 'plia_ref'
const VID_COOKIE = 'plia_vid'
const REF_MAX_AGE = 60 * 60 * 24 * 30 // 30 días
const VID_MAX_AGE = 60 * 60 * 24 * 365 // 1 año

export function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const ref = req.nextUrl.searchParams.get('ref')
  if (ref) {
    res.cookies.set(REF_COOKIE, ref.slice(0, 64), {
      maxAge: REF_MAX_AGE,
      path: '/',
      sameSite: 'lax',
    })
  }

  if (!req.cookies.get(VID_COOKIE)) {
    res.cookies.set(VID_COOKIE, crypto.randomUUID(), {
      maxAge: VID_MAX_AGE,
      path: '/',
      sameSite: 'lax',
    })
  }

  return res
}

export const config = {
  // Corre en páginas, no en assets ni en las API routes de Next.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
