import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Globe, ShieldCheck, Smartphone, Search, Headset, Server,
  Check, ArrowRight, X as XIcon, Zap, Clock, Sparkles,
  CreditCard, LogIn, Rocket,
} from 'lucide-react';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://plia.pe';

export const metadata: Metadata = {
  title: 'Página Web Económica en Perú — Profesional y sin precios de agencia | PLIA',
  description:
    'Página web profesional económica en Perú. Hosting, diseño, seguridad y soporte incluidos en un solo precio accesible. Sin costos ocultos, lista en 24 horas.',
  keywords: [
    'página web económica Perú',
    'página web barata Perú',
    'página web profesional barata Perú',
    'web económica Lima',
    'crear página web económica Perú',
    'página web precio accesible Perú',
    'web barata profesional Perú',
    'diseño web económico Lima',
  ],
  alternates: { canonical: '/pagina-web-economica-peru' },
  openGraph: {
    title: 'Página Web Económica en Perú — Profesional y sin precios de agencia | PLIA',
    description:
      'Web profesional con hosting, seguridad y soporte incluidos. Sin pagar como agencia, sin el riesgo del freelancer. Lista en 24 horas.',
    url: '/pagina-web-economica-peru',
    type: 'website',
  },
};

// CTA único y CONSTANTE de esta landing: todo el tráfico de ads va al mismo
// destino de pago. La económica corresponde al plan Landing del checkout.
const CHECKOUT_HREF = '/checkout?plan=landing';
const CTA_LABEL = 'Crear mi web ahora';

function PrimaryCTA({ className = '' }: { className?: string }) {
  return (
    <Link
      href={CHECKOUT_HREF}
      className={`bg-cta text-cta-foreground font-semibold px-7 py-3.5 rounded-full hover:opacity-90 transition inline-flex items-center justify-center gap-2 ${className}`}
    >
      {CTA_LABEL} <ArrowRight size={18} />
    </Link>
  );
}

// Barra fija en móvil: el CTA siempre visible mientras el visitante hace scroll.
function MobileCtaBar() {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-foreground/95 backdrop-blur px-4 py-3">
      <Link
        href={CHECKOUT_HREF}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-cta text-cta-foreground font-semibold px-6 py-3.5"
      >
        {CTA_LABEL} <ArrowRight size={18} />
      </Link>
    </div>
  );
}

const trust = ['Hosting gratis 1 año', 'Sin costos ocultos', 'Lista en 24 horas', 'Soporte en español'];

const opciones = [
  {
    titulo: 'Agencia de diseño',
    badge: 'Costoso',
    badgeColor: 'bg-red-100 text-red-600',
    items: [
      { ok: false, t: 'Cobra S/ 3,000 o más solo por el diseño' },
      { ok: false, t: 'El hosting y el dominio van aparte' },
      { ok: false, t: 'El proceso tarda semanas o meses' },
      { ok: false, t: 'Cambios futuros tienen costo adicional' },
      { ok: true,  t: 'Diseño profesional de calidad' },
    ],
  },
  {
    titulo: 'Freelancer de OLX',
    badge: 'Riesgoso',
    badgeColor: 'bg-orange-100 text-orange-600',
    items: [
      { ok: false, t: 'Precio variable, sin garantía de calidad' },
      { ok: false, t: 'Sin soporte después de la entrega' },
      { ok: false, t: 'Puede desaparecer antes de terminar' },
      { ok: false, t: 'Hosting y dominio te los consigues tú' },
      { ok: true,  t: 'Precio inicial bajo (a veces)' },
    ],
  },
  {
    titulo: 'DIY (Wix / Webnode)',
    badge: 'Básico',
    badgeColor: 'bg-yellow-100 text-yellow-700',
    items: [
      { ok: false, t: 'Lleva semanas y queda amateur' },
      { ok: false, t: 'Muestra publicidad o el subdominio de la plataforma' },
      { ok: false, t: 'Mensualidad que crece con cada función' },
      { ok: false, t: 'Soporte en inglés y por chatbot' },
      { ok: true,  t: 'Autonomía total para editar' },
    ],
  },
  {
    titulo: 'PLIA',
    badge: 'Recomendado',
    badgeColor: 'bg-cta/15 text-cta-foreground',
    highlight: true,
    items: [
      { ok: true, t: 'Precio accesible, todo incluido' },
      { ok: true, t: 'Hosting gratis 1 año + SSL + subdominio en el mismo plan' },
      { ok: true, t: 'Lista en 24 horas (48 h web institucional)' },
      { ok: true, t: 'Soporte en español post-entrega' },
      { ok: true, t: 'Diseño profesional adaptado a tu sector' },
    ],
  },
];

const incluye = [
  { icon: Globe, t: 'Tu dominio, conectado', d: 'Subdominio gratis al instante, y vinculamos tu dominio propio (.pe o .com) sin costo.' },
  { icon: Server, t: 'Hosting gratis por 1 año', d: 'Alojamiento rápido y seguro incluido sin costo el primer año. Pasado el año, renuevas solo el hosting.' },
  { icon: ShieldCheck, t: 'Certificado HTTPS', d: 'Seguridad SSL sin costo extra.' },
  { icon: Smartphone, t: 'Diseño responsive', d: 'Perfecta en celular, tablet y computadora.' },
  { icon: Search, t: 'SEO configurado', d: 'Lista para que Google te encuentre desde el primer día.' },
  { icon: Headset, t: 'Soporte en español', d: 'Un equipo peruano para cambios y dudas.' },
];

const sinCostosOcultos = [
  'Hosting gratis el primer año (sin mensualidad)',
  'Sin cobro por conectar tu dominio propio',
  'Sin cobro por certificado de seguridad (SSL)',
  'Sin tarifa por "activación" o "configuración"',
  'Sin pagar más para que la web cargue rápido',
  'Sin costo adicional por diseño responsive',
];

const paraQuien = [
  { icon: '🛍️', t: 'Emprendedores que recién empiezan', d: 'Tu primera web profesional sin invertir como empresa grande.' },
  { icon: '🏠', t: 'Negocios familiares', d: 'Proyecta tu negocio con profesionalismo sin complicaciones.' },
  { icon: '👩‍💼', t: 'Profesionales independientes', d: 'Médicos, abogados, consultores — tu carta de presentación online.' },
  { icon: '🏪', t: 'Tiendas y negocios locales', d: 'Llega a más clientes de tu ciudad sin salir de tu presupuesto.' },
];

const pasos = [
  { n: '01', t: 'Nos cuentas de tu negocio', d: 'Qué ofreces, cómo te llamas y qué quieres lograr con tu web. Sin formularios largos.' },
  { n: '02', t: 'Diseñamos tu web', d: 'La adaptamos a tu sector y tu marca. Colores, contenido y estructura pensados para ti.' },
  { n: '03', t: 'La publicas en 24 horas', d: 'Con hosting y seguridad incluidos. Tu web live sin complicaciones técnicas.' },
];

const diferenciadores = [
  {
    icon: Zap,
    t: 'Calidad sin el precio de agencia',
    d: 'Diseño profesional adaptado a tu negocio. Sin pagar los costos de una agencia grande.',
  },
  {
    icon: Clock,
    t: 'Lista en 24 horas',
    d: 'Sin meses de espera ni reuniones eternas. Tu web funcionando este mismo día.',
  },
  {
    icon: Sparkles,
    t: 'Todo en un solo precio',
    d: 'Hosting, diseño, seguridad y soporte incluidos. Sabes exactamente lo que pagas.',
  },
];

const faqs = [
  {
    q: '¿La web es realmente profesional aunque sea económica?',
    a: 'Sí. El precio accesible viene de nuestra plataforma propia que reduce los tiempos de producción, no de recortar en calidad. Recibes el mismo diseño y atención que cualquier cliente.',
  },
  {
    q: '¿Hay costos adicionales después de contratarla?',
    a: 'No. El hosting, SSL y soporte ya van incluidos en el plan, con subdominio gratis. Si quieres tu dominio propio, lo registras tú y lo conectamos sin costo. No recibirás cobros sorpresa por mantenimiento.',
  },
  {
    q: '¿Qué pasa si quiero hacer cambios después?',
    a: 'Tienes soporte disponible para cambios de contenido, actualizaciones y ajustes. Coordinamos contigo directamente en español.',
  },
  {
    q: '¿Puedo empezar con la web económica y mejorarla después?',
    a: 'Sí. Puedes empezar con una landing page económica y luego ampliar a una web institucional de varias páginas o agregar una tienda online cuando tu negocio crezca.',
  },
  {
    q: '¿En cuánto tiempo estará lista?',
    a: 'Una landing page está lista en 24 horas. Una web de varias páginas en 48 horas. Desde que nos confirmas el pedido.',
  },
  {
    q: '¿Necesito saber de tecnología?',
    a: 'No. Tú nos das la información de tu negocio y nosotros resolvemos todo: diseño, hosting, publicación y la conexión de tu dominio. Sin complicaciones.',
  },
];

export default function PaginaWebEconomicaPeru() {
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Diseño de página web económica',
    name: 'Página web económica en Perú',
    provider: { '@type': 'Organization', name: 'PLIA', url: siteUrl },
    areaServed: { '@type': 'Country', name: 'Perú' },
    url: `${siteUrl}/pagina-web-economica-peru`,
    description:
      'Diseño de página web profesional económica en Perú con hosting, seguridad y soporte incluidos. Lista en 24 horas sin costos ocultos.',
  };
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Página web económica en Perú', item: `${siteUrl}/pagina-web-economica-peru` },
    ],
  };

  return (
    <div className="pb-20 md:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="bg-foreground text-background relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-[460px] h-[460px] rounded-full bg-cta/5 pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-72 h-72 rounded-full bg-cta/5 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 pt-36 pb-20 md:pt-44 md:pb-28 text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-cta bg-cta/10 px-3 py-1.5 rounded-full mb-6">
            Web económica · Perú
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">
            Página web profesional<br />
            <span className="text-cta">sin pagar precio de agencia</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-background/75 max-w-2xl mx-auto">
            Diseño, seguridad, soporte y{' '}
            <strong className="text-background">hosting gratis por 1 año</strong>, todo
            incluido en un solo precio accesible. Sin costos ocultos. Lista en 24 horas.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <PrimaryCTA />
            <Link
              href="/contacto"
              className="bg-background/10 border border-background/20 font-semibold px-7 py-3.5 rounded-full hover:bg-background/20 transition"
            >
              Tengo una pregunta
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-background/60">
            {trust.map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <Check size={13} className="text-cta" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARACIÓN ──────────────────────────────────────────────── */}
      <section className="bg-[#f7f7f5] px-4 py-20 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cta-foreground mb-3">La diferencia</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              No todas las opciones son iguales
            </h2>
            <p className="mt-3 text-muted-foreground text-lg">
              Antes de contratar a cualquiera, compara lo que realmente recibes.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {opciones.map((op) => (
              <div
                key={op.titulo}
                className={`rounded-3xl border p-7 flex flex-col ${
                  op.highlight
                    ? 'bg-cta/5 border-cta/30 ring-2 ring-cta/20'
                    : 'bg-white border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-base">{op.titulo}</h3>
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${op.badgeColor}`}>
                    {op.badge}
                  </span>
                </div>
                <ul className="space-y-3 flex-1">
                  {op.items.map((item) => (
                    <li key={item.t} className="flex items-start gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          item.ok ? 'bg-cta/20' : 'bg-red-100'
                        }`}
                      >
                        {item.ok ? (
                          <Check size={10} className="text-cta-foreground" />
                        ) : (
                          <XIcon size={10} className="text-red-500" />
                        )}
                      </div>
                      <span className={`text-[13px] leading-snug ${item.ok ? '' : 'text-foreground/60'}`}>
                        {item.t}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <PrimaryCTA />
          </div>
        </div>
      </section>

      {/* ── ASÍ FUNCIONA: AUTOMATIZADO / ÚNICO EN PERÚ ───────────────── */}
      <section className="bg-foreground text-background px-4 py-20 md:py-24 relative overflow-hidden">
        <div className="absolute -right-24 top-10 w-80 h-80 rounded-full bg-cta/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 bottom-0 w-72 h-72 rounded-full bg-cta/5 blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-cta bg-cta/10 px-3 py-1.5 rounded-full mb-5">
              No es un servicio convencional
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.05]">
              Pagas y el sistema hace el resto.{' '}
              <span className="text-cta">Automático.</span>
            </h2>
            <p className="mt-5 text-background/70 text-lg leading-relaxed">
              Nada de esperar días por correos ni coordinar mil reuniones. Apenas
              confirmas tu pago, nuestra plataforma configura tu hosting sola, te da
              acceso al instante, y tu web queda publicada en 24 horas. Tú solo esperas
              a verla lista.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: CreditCard, n: '01', t: 'Pagas una vez', d: 'Eliges tu plan y pagas de forma segura. Un solo paso, sin trámites.' },
              { icon: Server, n: '02', t: 'El sistema configura tu hosting', d: 'Automáticamente y al instante. Nadie tiene que hacerlo a mano ni hacerte esperar.' },
              { icon: LogIn, n: '03', t: 'Accedes a tu cuenta', d: 'Entras a tu panel de inmediato y nos cuentas de tu negocio.' },
              { icon: Rocket, n: '04', t: 'Tu web publicada en 24 h', d: 'La diseñamos y la ponemos online con tu hosting listo. Tú solo esperas a verla.' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.n} className="rounded-3xl bg-background/5 border border-background/10 p-7">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-cta/15 text-cta grid place-items-center">
                      <Icon size={22} />
                    </div>
                    <span className="text-4xl font-black text-background/10">{s.n}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1.5">{s.t}</h3>
                  <p className="text-background/65 text-[14px] leading-relaxed">{s.d}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <p className="text-xl md:text-3xl font-black tracking-tight">
              No hay ningún otro servicio igual en todo el Perú.
            </p>
            <p className="mt-3 text-background/60 max-w-2xl mx-auto">
              Pago, configuración de hosting, publicación y soporte — todo automatizado
              en una sola plataforma peruana. Así de simple, así de rápido.
            </p>
            <div className="mt-8">
              <PrimaryCTA />
            </div>
          </div>
        </div>
      </section>

      {/* ── TODO INCLUIDO ────────────────────────────────────────────── */}
      <section className="px-4 py-20 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cta-foreground mb-3">Todo en un solo precio</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Nada de contratar por separado</h2>
            <p className="mt-3 text-muted-foreground text-lg">
              Un plan que lo resuelve todo: diseño, hosting, seguridad y soporte. Y conectamos tu dominio gratis.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {incluye.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.t} className="bg-white rounded-3xl border border-border p-7 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-2xl bg-cta/15 text-cta-foreground grid place-items-center mb-4">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{f.t}</h3>
                  <p className="text-muted-foreground text-[15px]">{f.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SIN COSTOS OCULTOS ───────────────────────────────────────── */}
      <section className="bg-foreground text-background px-4 py-20 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cta mb-4">Transparencia total</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                Sin letras chicas.<br />Sin sorpresas.<br />Sin costos ocultos.
              </h2>
              <p className="mt-5 text-background/65 text-lg leading-relaxed">
                Sabemos que en Perú es común que te cobren el diseño y después aparezcan
                más cargos. Con PLIA, lo que ves es lo que pagas.
              </p>
              <PrimaryCTA className="mt-7" />
            </div>
            <div className="bg-background/5 rounded-3xl border border-background/10 p-8">
              <p className="text-sm font-bold uppercase tracking-wider text-background/50 mb-5">
                Lo que no te cobraremos extra
              </p>
              <ul className="space-y-4">
                {sinCostosOcultos.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-cta/15 flex items-center justify-center shrink-0">
                      <Check size={11} className="text-cta" />
                    </div>
                    <span className="text-[15px] text-background/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── PARA QUIÉN ES ────────────────────────────────────────────── */}
      <section className="px-4 py-20 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cta-foreground mb-3">¿Para quién es?</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Para negocios peruanos que quieren más clientes sin gastar de más
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {paraQuien.map((p) => (
              <div key={p.t} className="bg-white rounded-3xl border border-border p-7 flex gap-5 hover:shadow-lg transition-shadow">
                <span className="text-4xl">{p.icon}</span>
                <div>
                  <h3 className="font-bold text-lg mb-1.5">{p.t}</h3>
                  <p className="text-muted-foreground text-[15px]">{p.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POR QUÉ PLIA ─────────────────────────────────────────────── */}
      <section className="bg-[#f7f7f5] px-4 py-20 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cta-foreground mb-3">¿Por qué PLIA?</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Calidad profesional. Precio que tiene sentido.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {diferenciadores.map((d) => {
              const Icon = d.icon;
              return (
                <div key={d.t} className="bg-white rounded-3xl border border-border p-8 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-2xl bg-cta/15 text-cta-foreground grid place-items-center mb-5">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold text-xl mb-2">{d.t}</h3>
                  <p className="text-muted-foreground leading-relaxed">{d.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PROCESO ──────────────────────────────────────────────────── */}
      <section className="px-4 py-20 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cta-foreground mb-3">Cómo funciona</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Tu web en 3 pasos</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {pasos.map((p) => (
              <div key={p.t}>
                <div className="text-7xl font-black text-cta-foreground/10 leading-none mb-3">{p.n}</div>
                <h3 className="text-xl font-bold mb-2">{p.t}</h3>
                <p className="text-muted-foreground leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="bg-[#f7f7f5] px-4 py-20 md:py-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-10">
            Preguntas frecuentes
          </h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="group bg-white rounded-2xl border border-border p-6">
                <summary className="font-bold cursor-pointer list-none flex justify-between items-center gap-4">
                  {f.q}
                  <span className="text-2xl text-cta-foreground group-open:rotate-45 transition-transform shrink-0">+</span>
                </summary>
                <p className="mt-3 text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLUSTER BLOG ─────────────────────────────────────────────── */}
      <section className="px-4 py-14">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-semibold mb-3">Lee más antes de decidir</p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <Link href="/blog/cuanto-cuesta-una-pagina-web-en-peru" className="underline underline-offset-2 text-cta-foreground font-medium">
              ¿Cuánto cuesta una página web en Perú?
            </Link>
            <Link href="/blog/plantilla-vs-pagina-web-a-medida" className="underline underline-offset-2 text-cta-foreground font-medium">
              Plantilla vs página web a medida
            </Link>
            <Link href="/blog/mejores-opciones-para-hacer-tu-pagina-web-peru" className="underline underline-offset-2 text-cta-foreground font-medium">
              Las mejores opciones para hacer tu web
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────────── */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto rounded-[2.5rem] bg-foreground text-background px-8 py-16 text-center relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-cta/10 pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-cta/5 pointer-events-none" />
          <div className="relative">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-cta bg-cta/10 px-3 py-1.5 rounded-full mb-5">
              Empieza hoy
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Tu web profesional al precio justo
            </h2>
            <p className="mt-3 text-background/70 max-w-xl mx-auto text-lg">
              Lista en 24 horas, hosting y seguridad incluidos, sin costos ocultos.
              El paso que tu negocio necesita para crecer online.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <PrimaryCTA />
              <Link
                href="/contacto"
                className="bg-background/10 border border-background/20 font-semibold px-7 py-3.5 rounded-full hover:bg-background/20 transition"
              >
                Tengo una pregunta
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MobileCtaBar />
    </div>
  );
}
