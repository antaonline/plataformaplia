"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Bell, ArrowLeft, Mail, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ComingSoonGateProps {
  /**
   * Si está en false (default), muestra la pantalla "Próximamente" en lugar
   * de los children. Útil para tapar features en desarrollo sin borrar el
   * código.
   */
  enabled?: boolean;
  /**
   * Si el usuario tiene este token en `?preview=...` ve los children igual.
   * Útil para que el admin siga trabajando mientras el público ve "Próximamente".
   * Si no se define, no hay bypass por query param.
   */
  previewToken?: string;
  /** Título principal de la pantalla "Próximamente". */
  title?: string;
  /** Subtítulo descriptivo. */
  subtitle?: string;
  /** El contenido real (la feature). Solo se muestra si enabled=true o ?preview=match. */
  children: React.ReactNode;
}

/**
 * Wrapper que oculta una página/sección detrás de una pantalla "Próximamente"
 * mientras la feature está en desarrollo. Permite que el admin la siga viendo
 * con un token de preview en la URL.
 *
 * Uso típico:
 *   <ComingSoonGate
 *     enabled={process.env.NEXT_PUBLIC_IACHAT_LANDING_ENABLED === 'true'}
 *     previewToken={process.env.NEXT_PUBLIC_PREVIEW_KEY}
 *     title="PLIA Studio"
 *     subtitle="..."
 *   >
 *     <MiPaginaCompleta />
 *   </ComingSoonGate>
 */
export function ComingSoonGate({
  enabled = false,
  previewToken,
  title = 'Próximamente',
  subtitle = 'Estamos puliendo los últimos detalles. Vuelve muy pronto.',
  children,
}: ComingSoonGateProps) {
  const [allowed, setAllowed] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (enabled) {
      setAllowed(true);
      return;
    }
    if (typeof window === 'undefined') return;
    if (previewToken && previewToken.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const candidate = params.get('preview');
      if (candidate && candidate === previewToken) {
        // Persistimos el bypass en sessionStorage para que el usuario admin
        // no tenga que ponerlo en cada refresh durante su sesión.
        sessionStorage.setItem('plia_preview_ok', '1');
        setAllowed(true);
        return;
      }
      if (sessionStorage.getItem('plia_preview_ok') === '1') {
        setAllowed(true);
        return;
      }
    }
    setAllowed(false);
  }, [enabled, previewToken]);

  // SSR / primer render: para evitar flash de "Próximamente" al admin con
  // sessionStorage, esperamos al efecto en el cliente.
  if (allowed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-2 w-2 rounded-full bg-cta animate-pulse" />
      </div>
    );
  }

  if (allowed) return <>{children}</>;

  // SEO: cuando mostramos "Proximamente" no queremos que Google indexe
  // esta pantalla como contenido oficial. Inyectamos noindex client-side
  // (el head ya esta renderizado por el layout, asi que usamos un hack
  // de modificar document.head desde useEffect).
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background px-6 py-20">
      <ComingSoonNoIndex />
      {/* Halo decorativo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-cta/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-2xl w-full text-center"
      >
        {/* Badge "PRÓXIMAMENTE" */}
        <motion.div
          initial={{ scale: 0, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 14 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cta/15 border border-cta/30 mb-6"
        >
          <Sparkles className="w-4 h-4 text-foreground" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-foreground">
            Próximamente
          </span>
        </motion.div>

        {/* Título */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-5 leading-tight"
        >
          {title}
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-xl mx-auto"
        >
          {subtitle}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button variant="cta" size="lg" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/contacto">
              <Bell className="w-4 h-4" />
              Avísame cuando esté lista
            </Link>
          </Button>
        </motion.div>

        {/* Sub-CTAs de contacto rápido */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-12 pt-8 border-t border-border/50"
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground/70 font-semibold mb-4">
            ¿Necesitas tu web ahora?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <a
              href="https://wa.me/51958617185?text=Hola%20%F0%9F%91%8B%20me%20interesa%20PLIA%20y%20quiero%20info%20sobre%20los%20planes."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-foreground hover:text-cta-foreground transition-colors font-medium"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
            <span className="text-muted-foreground/40">·</span>
            <a
              href="mailto:hola@plia.pe"
              className="inline-flex items-center gap-2 text-foreground hover:text-cta-foreground transition-colors font-medium"
            >
              <Mail className="w-4 h-4" />
              hola@plia.pe
            </a>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}

/**
 * Inyecta <meta name="robots" content="noindex, nofollow"> en el <head>
 * mientras la pantalla "Próximamente" está visible. Sin esto, Google
 * indexaría esa pantalla como contenido oficial del dominio y al habilitar
 * la página real Google tardaría semanas en re-indexarla.
 */
function ComingSoonNoIndex() {
  React.useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    meta.dataset.pliaComingSoon = '1';
    document.head.appendChild(meta);
    return () => {
      const existing = document.head.querySelector(
        'meta[data-plia-coming-soon="1"]',
      );
      if (existing) existing.remove();
    };
  }, []);
  return null;
}
