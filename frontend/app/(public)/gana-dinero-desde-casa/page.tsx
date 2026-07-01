import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Wallet, Share2, TrendingUp, Rocket, Users, ArrowRight,
  Smartphone, Link2, Banknote, Megaphone,
  MessageCircle, Video, Store, Sparkles, HelpCircle, ShieldCheck, Clock, Gift,
} from 'lucide-react';
import { EarningsCalculator } from '@/components/afiliados/EarningsCalculator';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://plia.pe';

export const metadata: Metadata = {
  title: 'Gana Dinero desde Casa por Internet en Perú — Programa de Afiliados PLIA',
  description:
    'Gana dinero desde casa recomendando páginas web e hosting. Únete gratis al programa de afiliados de PLIA en Perú: comisiones reales en soles, sin invertir, cobras por Yape o banco. Empieza hoy desde tu celular.',
  keywords: [
    'ganar dinero desde casa',
    'gana dinero desde casa',
    'ganar dinero por internet',
    'cómo ganar dinero por internet',
    'ganar dinero en internet Perú',
    'ganar dinero desde casa Perú',
    'trabajar desde casa Perú',
    'ingresos extra desde casa',
    'programa de afiliados Perú',
    'marketing de afiliados Perú',
    'ganar dinero sin invertir',
    'ganar dinero desde el celular',
    'ingresos pasivos Perú',
  ],
  alternates: { canonical: '/gana-dinero-desde-casa' },
  openGraph: {
    title: 'Gana Dinero desde Casa por Internet — Afiliados PLIA Perú',
    description:
      'Comparte tu link, y por cada página web u hosting que se venda, ganas comisión en soles. Gratis, sin invertir, cobras por Yape o banco.',
    url: '/gana-dinero-desde-casa',
    type: 'website',
  },
};

const trust = [
  { icon: Gift, t: 'Gratis, sin invertir' },
  { icon: Banknote, t: 'Cobras por Yape o banco' },
  { icon: Clock, t: 'Pago en 3 días hábiles' },
  { icon: Smartphone, t: '100% desde tu celular' },
];

const pasosGanar = [
  { icon: Rocket, n: '01', t: 'Crea tu cuenta gratis', d: 'Regístrate en segundos y entra a la sección "Afiliados" de tu panel. No pagas nada, no necesitas experiencia.' },
  { icon: Share2, n: '02', t: 'Comparte tu link', d: 'Copia tu enlace personal y compártelo en WhatsApp, Instagram, TikTok, grupos de Facebook o con negocios de tu zona.' },
  { icon: Wallet, n: '03', t: 'Cobra tus comisiones', d: 'Cuando alguien compra con tu link, ganas tu comisión al instante. Pides tu retiro y te pagamos por Yape o banco.' },
];

const servicios = [
  { t: 'Plan Landing', precio: 'S/ 20', d: 'Por cada página de aterrizaje (1 sola página) que se venda con tu link.', destacado: false },
  { t: 'Web Institucional', precio: 'S/ 40', d: 'Por cada web completa de varias páginas vendida con tu link.', destacado: true },
  { t: 'Hosting', precio: '5%', d: 'El 5% de cada plan de hosting: desde S/ 12 hasta S/ 154 según el plan y el plazo.', destacado: false },
];

const estrategias = [
  { icon: Link2, t: 'Pon tu link en tu bio', d: 'Instagram, TikTok, tu estado de WhatsApp. Que tu enlace esté siempre a un clic de distancia.' },
  { icon: Store, t: 'Ofrece a negocios locales', d: 'Bodegas, restaurantes, salones, profesionales… Muchos aún no tienen web. Tú les llevas la solución.' },
  { icon: MessageCircle, t: 'Publica en grupos', d: 'Grupos de emprendedores, de tu barrio o rubro en WhatsApp y Facebook. Ahí hay gente que necesita una web.' },
  { icon: Video, t: 'Graba un video corto', d: 'Muestra ejemplos reales de plia.pe/ejemplos. Un reel o TikTok de 20 segundos convierte muchísimo.' },
  { icon: Megaphone, t: 'Usa los links por producto', d: 'Además del link principal, tienes enlaces directos a Landing, Web y Hosting para campañas específicas.' },
  { icon: Sparkles, t: 'Comparte contenido de valor', d: 'Tips tipo "cómo tener una web en 24 horas" atraen clientes y te posicionan como el que sabe.' },
];

const tutorial = [
  { t: 'Regístrate y entra a tu panel', d: 'Crea tu cuenta gratis y accede a tu Dashboard de PLIA.' },
  { t: 'Abre la sección "Afiliados"', d: 'En el menú lateral (o el menú ☰ en el celular) toca "Afiliados".' },
  { t: 'Configura tu medio de cobro', d: 'Elige Yape o cuenta bancaria. Ese será el método por el que recibirás tus pagos.' },
  { t: 'Copia tu link principal', d: 'Es el enlace recomendado. Con él, cuente lo que compre tu referido en 30 días, ganas la comisión.' },
  { t: 'Compártelo y vende', d: 'Difúndelo en tus redes y grupos. Cuando haya ventas, verás la bolita de notificación en el menú.' },
  { t: 'Revisa tus ganancias', d: 'En "Mis ventas" ves cada comisión: producto, monto y estado (Disponible, Pagada).' },
  { t: 'Solicita tu retiro', d: 'Con un mínimo de S/ 50 disponibles, pides tu retiro y te pagamos en máximo 3 días hábiles.' },
];

const faqs = [
  { q: '¿Necesito invertir o pagar algo para ser afiliado?', a: 'No. Unirte al programa de afiliados de PLIA es totalmente gratis. No compras stock, no pagas membresía y no arriesgas dinero. Solo compartes tu link.' },
  { q: '¿Cuánto dinero puedo ganar?', a: 'Ganas S/ 20 por cada plan Landing, S/ 40 por cada Web Institucional y el 5% del total en cada plan de hosting (entre S/ 12 y S/ 154). No hay límite: mientras más vendas, más ganas.' },
  { q: '¿Cómo y cuándo cobro mis comisiones?', a: 'Cobras por Yape o cuenta bancaria. Cuando acumulas al menos S/ 50 disponibles, solicitas tu retiro desde tu panel y te pagamos en un máximo de 3 días hábiles.' },
  { q: '¿Necesito experiencia o conocimientos técnicos?', a: 'No. Nosotros diseñamos, entregamos y damos soporte a cada web. Tú solo recomiendas y compartes tu enlace. Si sabes usar WhatsApp y redes sociales, puedes hacerlo.' },
  { q: '¿Puedo ganar dinero desde casa solo con mi celular?', a: 'Sí. Todo el proceso —crear tu cuenta, copiar tu link, compartirlo y cobrar— se hace desde el celular. Es ideal para ganar dinero desde casa en tu tiempo libre.' },
  { q: '¿La comisión es por una sola vez o cada mes?', a: 'La comisión se paga una vez por cada venta que generes (en la primera compra del cliente). Si traes muchos clientes, sumas muchas comisiones.' },
];

// CTA reutilizable
const ctaPrimary =
  'inline-flex items-center justify-center gap-2 rounded-full bg-cta text-cta-foreground font-bold px-7 py-3.5 hover:opacity-90 transition shadow-sm';
const ctaGhost =
  'inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white font-semibold px-6 py-3 hover:bg-muted transition';

export default function GanaDineroPage() {
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className="bg-white text-foreground overflow-x-hidden">
      <style>{`
        @keyframes gdGrow { from { transform: scaleY(0.05); opacity:.3 } to { transform: scaleY(1); opacity:1 } }
        @keyframes gdFloat { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-7px) } }
        @keyframes gdRise { from { transform: translateY(10px); opacity:0 } to { transform: translateY(0); opacity:1 } }
      `}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      {/* ══ HERO ══ */}
      <section className="relative bg-gradient-to-b from-cta/[0.07] to-white">
        <div className="max-w-6xl mx-auto px-4 pt-24 md:pt-28 pb-14 md:pb-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-cta/15 text-cta-foreground text-xs font-bold px-3 py-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Programa de Afiliados PLIA · Perú
            </span>
            <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight">
              Gana dinero desde casa <span className="text-cta-foreground bg-cta/20 px-2 rounded-lg">recomendando páginas web</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl">
              Comparte tu link y, por cada persona que compre una página web u hosting con él, ganas una <strong className="text-foreground">comisión real en soles</strong>. Sin invertir, sin experiencia, sin stock. Cobras por Yape o banco.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link href="/registro" className={ctaPrimary}>
                Crear mi cuenta gratis <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="#calculadora" className={ctaGhost}>
                Calcular cuánto gano
              </Link>
            </div>
            <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {trust.map((t) => (
                <div key={t.t} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <t.icon className="w-4 h-4 text-cta-foreground shrink-0" />
                  <span>{t.t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ilustración SVG animada (reemplazable por una imagen luego) */}
          <div className="relative">
            <svg viewBox="0 0 400 320" className="w-full h-auto" role="img" aria-label="Ilustración de ganancias creciendo">
              <rect x="30" y="40" width="340" height="240" rx="20" fill="#ffffff" stroke="#e5e7eb" />
              <g style={{ transformOrigin: '200px 250px' }}>
                {[
                  { x: 80, h: 70, d: '0s' },
                  { x: 140, h: 110, d: '.15s' },
                  { x: 200, h: 150, d: '.3s' },
                  { x: 260, h: 190, d: '.45s' },
                ].map((b) => (
                  <rect
                    key={b.x}
                    x={b.x}
                    y={250 - b.h}
                    width="40"
                    height={b.h}
                    rx="8"
                    fill="hsl(var(--cta))"
                    style={{ transformOrigin: `${b.x + 20}px 250px`, animation: `gdGrow .8s ease-out ${b.d} both` }}
                  />
                ))}
                <path d="M70 210 L150 160 L210 120 L300 60" fill="none" stroke="#111827" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="300" cy="60" r="7" fill="#111827" />
              </g>
              <g style={{ animation: 'gdFloat 3s ease-in-out infinite' }}>
                <circle cx="320" cy="110" r="26" fill="hsl(var(--cta))" stroke="#111827" strokeWidth="2" />
                <text x="320" y="118" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#111827">S/</text>
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* ══ PARA QUIÉN ══ */}
      <section className="max-w-6xl mx-auto px-4 py-4">
        <p className="text-center text-sm text-muted-foreground">
          Ideal para <strong className="text-foreground">estudiantes, mamás en casa, creadores de contenido, community managers</strong> y cualquier persona con redes sociales que quiera generar ingresos extra.
        </p>
      </section>

      {/* ══ CÓMO GANAS ══ */}
      <section className="max-w-6xl mx-auto px-4 py-14 md:py-20">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-2xl md:text-3xl font-bold leading-snug">
            ¿A fin de mes el dinero ya no alcanza?{' '}
            <span className="text-muted-foreground font-semibold">
              No estás solo. Conseguir un ingreso extra no debería significar más horas fuera de casa ni un segundo trabajo agotador.
            </span>
          </p>
        </div>
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black">Así de simple es ganar</h2>
          <p className="mt-3 text-muted-foreground">Tres pasos. Sin complicaciones. Empiezas hoy y compartes en minutos.</p>
        </div>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {pasosGanar.map((p) => (
            <div key={p.n} className="relative rounded-3xl border border-border bg-white p-7 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-cta/15 flex items-center justify-center">
                <p.icon className="w-6 h-6 text-cta-foreground" />
              </div>
              <span className="absolute top-6 right-7 text-4xl font-black text-cta/25">{p.n}</span>
              <h3 className="mt-4 text-xl font-bold">{p.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/registro" className={ctaPrimary}>Empezar gratis ahora <ArrowRight className="w-5 h-5" /></Link>
        </div>
      </section>

      {/* ══ QUÉ VENDES ══ */}
      <section className="bg-muted/30 border-y border-border">
        <div className="max-w-6xl mx-auto px-4 py-14 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-black">Recomiendas productos que todos necesitan</h2>
              <p className="mt-4 text-muted-foreground">
                Hoy cualquier negocio necesita estar en internet. Tú solo recomiendas; <strong className="text-foreground">PLIA diseña, entrega y da el soporte</strong>. Estas son tus comisiones por venta:
              </p>
              <div className="mt-6 space-y-3">
                {servicios.map((s) => (
                  <div key={s.t} className={`flex items-center justify-between rounded-2xl border p-4 ${s.destacado ? 'border-cta bg-cta/5' : 'border-border bg-white'}`}>
                    <div>
                      <p className="font-bold">{s.t}</p>
                      <p className="text-xs text-muted-foreground max-w-xs">{s.d}</p>
                    </div>
                    <span className="text-2xl font-black text-cta-foreground shrink-0 ml-3">{s.precio}</span>
                  </div>
                ))}
              </div>
            </div>
            <img
              src="/afiliados/mockups-1.webp"
              alt="Ejemplos de páginas web profesionales que puedes vender como afiliado de PLIA"
              loading="lazy"
              className="w-full h-auto rounded-2xl"
            />
          </div>
        </div>
      </section>

      {/* ══ CALCULADORA ══ */}
      <section id="calculadora" className="max-w-6xl mx-auto px-4 py-14 md:py-20 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-cta/15 text-cta-foreground text-xs font-bold px-3 py-1.5"><TrendingUp className="w-3.5 h-3.5" /> Calculadora de ganancias</span>
          <h2 className="mt-4 text-3xl md:text-4xl font-black">¿Cuánto puedes ganar al mes?</h2>
          <p className="mt-3 text-muted-foreground">Mueve los números y mira cuánto ganarías según las ventas que logres. Es solo un estimado para que te motives.</p>
        </div>
        <EarningsCalculator />
      </section>

      {/* ══ ESTRATEGIAS ══ */}
      <section className="bg-foreground text-white">
        <div className="max-w-6xl mx-auto px-4 py-14 md:py-20">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black">Estrategias para vender más</h2>
            <p className="mt-3 text-white/70">Las mejores formas de conseguir ventas de afiliado, aunque estés empezando de cero.</p>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {estrategias.map((e) => (
              <div key={e.t} className="rounded-2xl bg-white/5 border border-white/10 p-6">
                <div className="w-11 h-11 rounded-xl bg-cta/20 flex items-center justify-center">
                  <e.icon className="w-5 h-5 text-cta" />
                </div>
                <h3 className="mt-4 font-bold">{e.t}</h3>
                <p className="mt-1.5 text-sm text-white/60 leading-relaxed">{e.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/registro" className={ctaPrimary}>Quiero mi link de afiliado <ArrowRight className="w-5 h-5" /></Link>
          </div>
        </div>
      </section>

      {/* ══ TUTORIAL PASO A PASO ══ */}
      <section className="max-w-5xl mx-auto px-4 py-14 md:py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black">Cómo funciona el panel de afiliados</h2>
          <p className="mt-3 text-muted-foreground">Paso a paso, para que sepas exactamente qué hacer desde el primer día.</p>
        </div>
        <div className="mt-10 space-y-6">
          {tutorial.map((s, i) => (
            <div key={i} className="grid md:grid-cols-2 gap-5 items-center">
              <div className={i % 2 === 1 ? 'md:order-2' : ''}>
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 shrink-0 rounded-full bg-cta text-cta-foreground font-black flex items-center justify-center">{i + 1}</span>
                  <h3 className="text-lg font-bold">{s.t}</h3>
                </div>
                <p className="mt-2 text-muted-foreground text-sm md:pl-12">{s.d}</p>
              </div>
              <img
                src={`/afiliados/comofunciona-${i + 1}.webp`}
                alt={`Paso ${i + 1}: ${s.t} — cómo usar el panel de afiliados de PLIA`}
                loading="lazy"
                className={`w-full h-auto rounded-2xl border border-border shadow-sm ${i % 2 === 1 ? 'md:order-1' : ''}`}
              />
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/registro" className={ctaPrimary}>Crear mi cuenta y empezar <ArrowRight className="w-5 h-5" /></Link>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="bg-muted/30 border-y border-border">
        <div className="max-w-3xl mx-auto px-4 py-14 md:py-20">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-cta/15 text-cta-foreground text-xs font-bold px-3 py-1.5"><HelpCircle className="w-3.5 h-3.5" /> Preguntas frecuentes</span>
            <h2 className="mt-4 text-3xl md:text-4xl font-black">Todo lo que necesitas saber</h2>
          </div>
          <div className="mt-8 space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-border bg-white px-5 py-4">
                <summary className="flex items-center justify-between cursor-pointer list-none font-semibold">
                  {f.q}
                  <span className="ml-3 text-2xl text-cta-foreground transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA FINAL ══ */}
      <section className="max-w-5xl mx-auto px-4 py-16 md:py-24 text-center">
        <div className="rounded-3xl bg-foreground text-white p-10 md:p-16">
          <Users className="w-10 h-10 mx-auto text-cta" />
          <h2 className="mt-4 text-3xl md:text-4xl font-black">Empieza a ganar dinero desde casa hoy</h2>
          <p className="mt-4 text-white/70 max-w-xl mx-auto">
            Crear tu cuenta es gratis y toma menos de un minuto. Consigue tu link, compártelo y empieza a sumar comisiones en soles.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/registro" className={ctaPrimary}>Crear mi cuenta gratis <ArrowRight className="w-5 h-5" /></Link>
            <Link href="/planes" className={`${ctaGhost} !bg-transparent !text-white !border-white/25 hover:!bg-white/10`}>Ver los planes que venderás</Link>
          </div>
          <p className="mt-5 text-xs text-white/50 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Sin inversión · Sin permanencia · Cobras por Yape o banco
          </p>
        </div>
      </section>
    </div>
  );
}
