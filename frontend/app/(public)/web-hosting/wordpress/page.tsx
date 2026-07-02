import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, Gauge, ShieldCheck, RefreshCcw, Headset, Database, Zap } from 'lucide-react';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://plia.pe';

export const metadata: Metadata = {
  title: 'Hosting WordPress en Perú — LiteSpeed, NVMe y soporte 24/7',
  description:
    'Hosting WordPress en Perú optimizado con LiteSpeed Enterprise, discos NVMe y SSL gratis. Instalación en 1 clic, caché a nivel de servidor y soporte experto 24/7.',
  alternates: { canonical: '/web-hosting/wordpress' },
  openGraph: {
    title: 'Hosting WordPress en Perú — LiteSpeed, NVMe y soporte 24/7 | PLIA',
    description:
      'WordPress optimizado con LiteSpeed Enterprise, discos NVMe y SSL gratis. Instalación en 1 clic y soporte experto 24/7.',
    url: '/web-hosting/wordpress',
    type: 'website',
  },
};

const beneficios = [
  { icon: Zap, t: 'LiteSpeed Enterprise', d: 'Caché a nivel de servidor: tu WordPress carga hasta 20 veces más rápido que en hosting tradicional.' },
  { icon: Gauge, t: 'Discos NVMe', d: 'Almacenamiento de última generación para que cada página y cada plugin respondan al instante.' },
  { icon: ShieldCheck, t: 'Seguridad blindada', d: 'WAF, protección DDoS y escáner de malware 24/7 pensados para las vulnerabilidades típicas de WordPress.' },
  { icon: RefreshCcw, t: 'Backups automáticos', d: 'Copias de seguridad restaurables en 1 clic. Un plugin roto nunca más será una tragedia.' },
  { icon: Database, t: 'Instalación en 1 clic', d: 'WordPress listo en segundos desde el panel, sin tocar bases de datos ni FTP.' },
  { icon: Headset, t: 'Soporte que sí responde', d: 'Equipo experto en WordPress, en español y disponible 24/7.' },
];

const proceso = [
  { t: 'Elige tu plan de hosting', d: 'Todos los planes de PLIA están optimizados para WordPress desde el primer día.' },
  { t: 'Instala WordPress en 1 clic', d: 'Desde el panel, sin conocimientos técnicos. SSL activado automáticamente.' },
  { t: 'Publica y crece', d: 'Con caché LiteSpeed, backups y soporte incluidos. Tú te enfocas en tu contenido.' },
];

const faqs = [
  { q: '¿Qué hace que un hosting sea "optimizado para WordPress"?', a: 'La combinación de servidor LiteSpeed con caché a nivel de servidor (LSCache), discos NVMe y reglas de seguridad específicas para WordPress. Eso se traduce en tiempos de carga menores y menos vulnerabilidades, sin que tengas que configurar nada.' },
  { q: '¿Puedo migrar mi WordPress actual a PLIA?', a: 'Sí, migramos tu WordPress gratis: archivos, base de datos y correos, sin caídas de servicio. Solo necesitamos los accesos de tu proveedor actual.' },
  { q: '¿El SSL está incluido?', a: 'Sí, todos los planes incluyen certificados SSL gratuitos e ilimitados de Let’s Encrypt con renovación automática.' },
  { q: '¿Sirve para WooCommerce?', a: 'Sí. LiteSpeed Enterprise y los discos NVMe hacen una gran diferencia en tiendas WooCommerce, donde la velocidad afecta directamente las ventas.' },
  { q: '¿Necesito saber de servidores para usarlo?', a: 'No. El panel de PLIA está diseñado para no técnicos: instalar WordPress, crear correos y ver estadísticas se hace en un par de clics.' },
];

export default function HostingWordPressPeru() {
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'WordPress Hosting',
    name: 'Hosting WordPress en Perú',
    provider: { '@type': 'Organization', name: 'PLIA', url: siteUrl },
    areaServed: { '@type': 'Country', name: 'Perú' },
    url: `${siteUrl}/web-hosting/wordpress`,
    description:
      'Hosting WordPress optimizado en Perú: LiteSpeed Enterprise, discos NVMe, SSL gratis, backups automáticos y soporte 24/7.',
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
      { '@type': 'ListItem', position: 3, name: 'Hosting WordPress en Perú', item: `${siteUrl}/web-hosting/wordpress` },
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
            Hosting WordPress · Perú
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">
            Hosting WordPress en Perú
          </h1>
          <p className="mt-6 text-lg md:text-xl text-background/75 max-w-2xl mx-auto">
            WordPress <strong className="text-background">hasta 20x más rápido</strong> con LiteSpeed Enterprise,
            discos NVMe, SSL gratis y soporte experto 24/7. Instalación en 1 clic, sin tecnicismos.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/web-hosting#planes-hosting" className="bg-cta text-cta-foreground font-semibold px-7 py-3.5 rounded-full hover:opacity-90 transition inline-flex items-center gap-2">
              Ver planes de hosting <ArrowRight size={18} />
            </Link>
            <Link href="/contacto" className="bg-background/10 border border-background/20 font-semibold px-7 py-3.5 rounded-full hover:bg-background/20 transition">
              Escríbenos
            </Link>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="bg-[#f7f7f5] px-4 py-20 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cta-foreground mb-3">Optimizado de verdad</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Todo lo que tu WordPress necesita para volar</h2>
            <p className="mt-3 text-muted-foreground text-lg">La velocidad de carga afecta tu posicionamiento en Google y tus ventas. Nuestra infraestructura está afinada para WordPress.</p>
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
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Tu WordPress online en 3 pasos</h2>
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
            <Link href="/web-hosting/migracion" className="underline text-cta-foreground font-medium">Migra tu web gratis a PLIA</Link>
            <Link href="/blog/cuanto-cuesta-el-hosting-en-peru" className="underline text-cta-foreground font-medium">¿Cuánto cuesta el hosting en Perú?</Link>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto rounded-[2.5rem] bg-foreground text-background px-8 py-14 text-center">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">Dale a tu WordPress el hosting que merece</h2>
          <p className="mt-3 text-background/70 max-w-xl mx-auto">LiteSpeed, NVMe, SSL y soporte 24/7. Garantía de reembolso de 30 días.</p>
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
