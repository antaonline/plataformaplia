'use client'

import { useEffect } from 'react'

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002'
const apiBase = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`

function getCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return m ? decodeURIComponent(m[1]) : null
}

// Registra el click de referido cuando la URL trae ?ref=. El dedupe por
// visitante lo hace el backend. No renderiza nada.
export default function AffiliateTracker() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const ref = params.get('ref')
      if (!ref) return
      fetch(`${apiBase}/affiliates/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: ref,
          visitorId: getCookie('plia_vid') ?? undefined,
          landingPath: window.location.pathname,
        }),
        keepalive: true,
      }).catch(() => {})
    } catch {
      /* noop */
    }
  }, [])

  return null
}
