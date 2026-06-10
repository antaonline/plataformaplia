'use client';

/**
 * MetaPixel — Componente para incluir el Meta Pixel en el layout raíz.
 *
 * CÓMO USAR:
 * 1. Agregar NEXT_PUBLIC_META_PIXEL_ID a .env.local y .env.production
 * 2. Importar <MetaPixel /> en frontend/app/layout.tsx dentro del <body>
 *
 * El componente:
 * - Inyecta el script base del pixel
 * - Dispara PageView automáticamente en cada navegación (usando usePathname)
 * - No hace nada si NEXT_PUBLIC_META_PIXEL_ID no está definido
 */

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { META_PIXEL_ID } from '@/lib/meta-pixel';

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!META_PIXEL_ID) return;
    if (typeof window === 'undefined') return;
    if (!(window as any).fbq) return;

    // Dispara PageView en cada cambio de ruta (SPA navigation)
    (window as any).fbq('track', 'PageView');
  }, [pathname, searchParams]);

  return null;
}

export default function MetaPixel() {
  if (!META_PIXEL_ID) return null;

  return (
    <>
      {/* Script base del pixel — carga después del render interactivo */}
      <Script
        id="meta-pixel-base"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      {/* noscript fallback para usuarios sin JavaScript */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      {/* Tracker de rutas SPA — envuelto en Suspense porque usa useSearchParams */}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}
