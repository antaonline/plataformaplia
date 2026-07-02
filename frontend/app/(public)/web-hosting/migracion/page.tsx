import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, ShieldCheck, Clock, RefreshCcw, Headset, FileCheck, Zap } from 'lucide-react';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://plia.pe';

export const metadata: Metadata = {
  title: 'Migración de hosting gratis en Perú — Sin caídas ni pérdida de datos',
  description:
    'Migra tu página web a PLIA gratis: archivos, base de datos y correos, sin caídas de servicio. Hosting LiteSpeed con NVMe, SSL gratis y soporte 24/7 en Perú.',
  alternates: { canonical: '/web-hosting/migracion' },
  openGraph: {
    title: 'Migración de hosting gratis en Perú | PLIA',
    description:
      'Migramos tu web gratis: archivos, base de datos y correos, sin caídas. Hosting LiteSpeed con NVMe y soporte 24/7.',
    url: '/web-hosting/migracion',
    type: 'website',
  },
};

const beneficios = [
  { icon: FileCheck, t: 'Migración completa', d: 'Archivos, base de datos, correos y configuraciones. Nos encargamos de todo el traslado.' },
  { icon: Clock, t: 'Sin caídas de servicio', d: 'Tu web sigue funcionando durante la migración. El cambio de DNS se coordina contigo.' },
  { icon: ShieldCheck, t: 'Sin pérdida de datos', d: 'Verificamos la integridad de todo antes de dar por concluida la migración.' },
  { icon: Zap, t: 'Mejora inmediata', d: 'Al llegar a servidores LiteSpeed con discos NVMe, tu web carga notablemente más rápido.' },
  { icon: RefreshCcw, t: 'SSL reactivado', d: 'Certificado SSL gratuito activado automáticamente en tu nuevo hosting.' },
  { icon: Headset, t: 'Acompañamiento humano', d: 'Un especialista te guía por WhatsApp o correo durante todo el proceso.' },
];

const proceso = [
  { t: 'Contrata tu plan y envíanos tus accesos', d: 'Solo necesitamos los datos de tu proveedor actual (cPanel, FTP o backup).' },
  { t: 'Nosotros migramos todo', d: 'Archivos, base de datos y correos. Probamos que todo funcione igual o mejor.' },
  { t: 'Apuntamos tu dominio', d: 'Coordinamos el cambio de DNS contigo para que no haya ni un minuto de caída.' },
];

const faqs = [
  { q: '¿La migración de mi web realmente es gratis?', a: 'Sí. La migración de tu página web (archivos, base de datos y correos) está incluida sin costo en todos los planes de hosting de PLIA.' },
  { q: '¿Cuánto tarda la migración?', a: 'La mayoría de migraciones se completan en menos de 24 horas. Sitios muy grandes o con configuraciones especiales pueden tomar algo más; te lo diremos antes de empezar.' },
  { q: '¿Mi web se caerá durante la migración?', a: 'No. Tu web sigue operando en tu proveedor actual mientras copiamos todo. Solo cuando verificamos que la copia funciona perfecto, coordinamos contigo el cambio de DNS.' },
  { q: '¿Migran sitios WordPress?', a: 'Sí, WordPress y WooCommerce son los casos más comunes. También migramos sitios HTML, PHP y la mayoría de CMS populares.' },
  { q: '¿Qué necesito darles para empezar?', a: 'Los accesos de tu hosting actual (usuario y contraseña del panel, o un backup completo). Con eso nuestro equipo se encarga del resto.' },
];

export default function MigracionHosting() {
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Website Migration',
    name: 'Migración de hosting gratis en Perú',
    provider: { '@type': 'Organization', name: 'PLIA', url: siteUrl },
    areaServed: { '@type': 'Country', name: 'Perú' },
    url: `${siteUrl}/web-hosting/migracion`,
    description:
      'Migración gratuita de páginas web a los servidores de PLIA: archivos, base de datos y correos, sin caídas de servicio ni pérdida de datos.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'PEN' },
  };
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Hosting Web en Perú', item: `${siteUrl}/web-hosting` },
      { '@type': 'ListItem', position: 3, name: 'Migración de hosting gratis', item: `${siteUrl}/web-hosting/migracion` },
    ],
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* HERO oscuro */}
      <section className="bg-foreground text-background">
        <div className="max-w-5xl mx-auto px-4 pt-36 pb-20 md:pt-44 md:pb-28 text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-cta bg-cta/10 px-3 py-1.5 rounded-full mb-6">
            Migración gratuita · Perú
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">
            Migra tu web a PLIA, gratis
          </h1>
          <p className="mt-6 text-lg md:text-xl text-background/75 max-w-2xl mx-auto">
            ¿Tu hosting actual es lento o el soporte no responde? Trasladamos tu página web
            <strong className="text-background"> sin costo, sin caídas y sin pérdida de datos</strong>.
            Tú no tocas nada.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/web-hosting#planes-hosting" className="bg-cta text-cta-foreground font-semibold px-7 py-3.5 rounded-full hover:opacity-90 transition inline-flex items-center gap-2">
              Ver planes de hosting <ArrowRight size={18} />
            </Link>
            <Link href="/contacto" className="bg-background/10 border border-background/20 font-semibold px-7 py-3.5 rounded-full hover:bg-background/20 transition">
              Quiero migrar mi web
            </Link>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="bg-[#f7f7f5] px-4 py-20 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cta-foreground mb-3">Sin riesgo</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Cambiar de hosting no tiene por qué doler</h2>
            <p className="mt-3 text-muted-foreground text-lg">El miedo a &quot;romper la web&quot; mantiene a muchos negocios atados a un mal hosting. Nosotros eliminamos ese riesgo.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {beneficios.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.t} className="bg-white rounded-3xl border border-border p-7">
                  <div className="w-12 h-12 rounded-2xl bg-cta/15 text-cta-foreground grid place-items-center mb-4"><Icon size={22} /></div>
                  <h3 className="font-bold text-lg mb-1">{f.t}</h3>
                  <p className="text-muted-foreground text-[15px]">{f.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROCESO */}
      <section className="px-4 py-20 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cta-foreground mb-3">Cómo funciona</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Migración en 3 pasos</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {proceso.map((p, i) => (
              <div key={p.t}>
                <div className="text-6xl font-black text-cta-foreground/15">0{i + 1}</div>
                <h3 className="text-xl font-bold mt-2 mb-2">{p.t}</h3>
                <p className="text-muted-foreground">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#f7f7f5] px-4 py-20 md:py-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-10">Preguntas frecuentes</h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="group bg-white rounded-2xl border border-border p-6">
                <summary className="font-bold cursor-pointer list-none flex justify-between items-center gap-4">
                  {f.q}
                  <span className="text-2xl text-cta-foreground group-open:rotate-45 transition shrink-0">+</span>
                </summary>
                <p className="mt-3 text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* RECURSOS (cluster interno) */}
      <section className="px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-bold mb-4">Sigue explorando</h2>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <Link href="/web-hosting" className="underline text-cta-foreground font-medium">Hosting web en Perú: planes y precios</Link>
            <Link href="/web-hosting/wordpress" className="underline text-cta-foreground font-medium">Hosting WordPress en Perú</Link>
            <Link href="/blog/cuanto-cuesta-el-hosting-en-peru" className="underline text-cta-foreground font-medium">¿Cuánto cuesta el hosting en Perú?</Link>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto rounded-[2.5rem] bg-foreground text-background px-8 py-14 text-center">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">Deja atrás tu hosting lento hoy mismo</h2>
          <p className="mt-3 text-background/70 max-w-xl mx-auto">Migración gratis, sin caídas y con garantía de reembolso de 30 días.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/web-hosting#planes-hosting" className="bg-cta text-cta-foreground font-semibold px-7 py-3.5 rounded-full hover:opacity-90 transition inline-flex items-center gap-2">
              Ver planes <Check size={18} />
            </Link>
            <Link href="/contacto" className="bg-background/10 border border-background/20 font-semibold px-7 py-3.5 rounded-full hover:bg-background/20 transition">Escríbenos</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
