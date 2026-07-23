import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, ArrowRight, Globe, ShieldCheck, Smartphone, Search, Headset, Server } from 'lucide-react';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://plia.pe';

export const metadata: Metadata = {
  title: 'Diseño de Páginas Web en Perú — Tu web lista en 24h, todo incluido',
  description:
    'Diseño de páginas web en Perú con hosting, seguridad y soporte incluidos. Tu página profesional lista en 24 horas a precio accesible. Landing, web institucional y tiendas online.',
  keywords: [
    'diseño de páginas web Perú',
    'diseño web Perú',
    'páginas web Perú',
    'diseño de páginas web Lima',
    'crear página web Perú',
    'empresa de diseño de páginas web',
  ],
  alternates: { canonical: '/diseno-de-paginas-web-peru' },
  openGraph: {
    title: 'Diseño de Páginas Web en Perú — Tu web lista en 24h | PLIA',
    description: 'Páginas web profesionales con hosting, seguridad y soporte incluidos. Listas en 24 horas.',
    url: '/diseno-de-paginas-web-peru',
    type: 'website',
  },
};

const incluye = [
  { icon: Globe, t: 'Tu dominio, conectado', d: 'Subdominio gratis al instante, y vinculamos tu dominio propio (.pe o .com) sin costo.' },
  { icon: Server, t: 'Hosting rápido', d: 'Alojamiento veloz y seguro para que tu web vuele.' },
  { icon: ShieldCheck, t: 'Seguridad HTTPS', d: 'El candadito de confianza, sin costo extra.' },
  { icon: Smartphone, t: 'Diseño responsive', d: 'Se ve perfecta en celular, tablet y computadora.' },
  { icon: Search, t: 'Optimización para Google', d: 'Lista para que te encuentren cuando te buscan.' },
  { icon: Headset, t: 'Soporte', d: 'Un equipo a quién acudir para cambios y dudas.' },
];

const tipos = [
  { t: 'Página web económica', d: 'Una página enfocada en vender o captar contactos. Ideal para empezar.', href: '/pagina-web-economica-peru' },
  { t: 'Web institucional', d: 'Varias páginas para proyectar tu empresa con profesionalismo.', href: '/pagina-web-institucional-peru' },
  { t: 'Tienda online', d: 'Vende tus productos por internet con pagos y envíos.', href: '/tienda-online-peru' },
];

// Testimonios reales de clientes (los mismos que se muestran en el home).
// Aportan prueba social y señales E-E-A-T a la página bandera.
const testimonios = [
  { txt: 'No sabía nada de páginas web y tenía miedo de que fuera muy difícil. PLIA me hizo todo fácil, ahora mis clientes me encuentran en Google y mis pedidos aumentaron.', n: 'María García', r: 'Pastelería Dulce María — Lima' },
  { txt: 'Pensé que tener una web era solo para empresas grandes. Con PLIA tuve mi página en menos de una semana y el precio fue muy accesible.', n: 'Carlos Mendoza', r: 'Taller Mecánico El Rayo — Arequipa' },
  { txt: 'El equipo de PLIA entendió exactamente lo que necesitaba. Mi web se ve muy profesional y mis pacientes pueden agendar citas fácilmente.', n: 'Ana Lucía Torres', r: 'Consultorio Dental Sonrisa — Trujillo' },
];

const proceso = [
  { t: 'Nos cuentas de tu negocio', d: 'Preguntas simples: qué ofreces, a quién y qué quieres lograr.' },
  { t: 'Diseñamos tu web', d: 'La adaptamos a tu marca: colores, contenido real y estructura por rubro.' },
  { t: 'Publicamos en 24 horas', d: 'Con hosting, seguridad y soporte, lista para recibir clientes en tu subdominio o tu dominio propio.' },
];

const faqs = [
  { q: '¿Cuánto cuesta una página web en Perú?', a: 'Depende del tipo: una landing va desde precios accesibles y una web institucional o tienda online cuestan más. Lo importante es que con PLIA el hosting, la seguridad y el soporte ya van incluidos, sin sorpresas.' },
  { q: '¿En cuánto tiempo está lista mi página web?', a: 'Tu página web está lista en 24 horas. Una web institucional de varias páginas toma 48 horas.' },
  { q: '¿El dominio y el hosting están incluidos?', a: 'El hosting, el certificado de seguridad y el soporte vienen incluidos, más un subdominio gratis para publicar de inmediato. El dominio propio (.pe o .com) lo registras tú con el proveedor que prefieras y nosotros lo vinculamos a tu web sin costo.' },
  { q: '¿Necesito saber de tecnología?', a: 'No. Tú nos cuentas de tu negocio y nosotros resolvemos toda la parte técnica. Recibes tu web lista para usar.' },
  { q: '¿La página se verá bien en el celular?', a: 'Sí. Todas nuestras páginas son responsive: se ven perfectas en celular, tablet y computadora.' },
];

export default function DisenoWebPeru() {
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Diseño de páginas web',
    name: 'Diseño de páginas web en Perú',
    provider: { '@type': 'Organization', name: 'PLIA', url: siteUrl },
    areaServed: { '@type': 'Country', name: 'Perú' },
    url: `${siteUrl}/diseno-de-paginas-web-peru`,
    description: 'Diseño de páginas web profesionales en Perú con hosting, seguridad y soporte incluidos. Listas en 24 horas.',
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
      { '@type': 'ListItem', position: 2, name: 'Diseño de páginas web en Perú', item: `${siteUrl}/diseno-de-paginas-web-peru` },
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
            Diseño web · Perú
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">
            Diseño de páginas web en Perú
          </h1>
          <p className="mt-6 text-lg md:text-xl text-background/75 max-w-2xl mx-auto">
            Tu página web profesional <strong className="text-background">lista en 24 horas</strong>, con hosting,
            seguridad y soporte <strong className="text-background">incluidos</strong>. Sin complicaciones técnicas y a precio accesible.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/planes" className="bg-cta text-cta-foreground font-semibold px-7 py-3.5 rounded-full hover:opacity-90 transition inline-flex items-center gap-2">
              Ver planes <ArrowRight size={18} />
            </Link>
            <Link href="/contacto" className="bg-background/10 border border-background/20 font-semibold px-7 py-3.5 rounded-full hover:bg-background/20 transition">
              Escríbenos
            </Link>
          </div>
        </div>
      </section>

      {/* INTRO SEO — contenido rico en keywords para la página bandera */}
      <section className="px-4 py-16 md:py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-5">
            Diseño de páginas web profesional para negocios peruanos
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-4">
            En PLIA hacemos <strong className="text-foreground">diseño de páginas web en Perú</strong> pensado
            para emprendedores, pymes y empresas que necesitan una presencia online seria sin complicarse con
            la parte técnica. Nos cuentas de tu negocio y nosotros nos encargamos del diseño, el contenido, el
            hosting y la publicación — tú solo apruebas y empiezas a recibir clientes.
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed mb-4">
            A diferencia de contratar un freelance por tu cuenta o pelearte con una plantilla de Wix, con
            nosotros tienes un equipo peruano detrás: diseño a medida de tu rubro, optimización para que
            aparezcas en Google, versión perfecta para celular y soporte en español cuando lo necesites.
            Ya sea una <strong className="text-foreground">landing económica</strong>, una{' '}
            <strong className="text-foreground">web institucional</strong> o una{' '}
            <strong className="text-foreground">tienda online</strong>, la dejamos lista y funcionando.
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Todo incluido en un solo lugar: sin coordinar tres proveedores, sin sorpresas de costos y sin
            tecnicismos. Así es como más de 500 negocios peruanos ya tienen su página web con PLIA.
          </p>
        </div>
      </section>

      {/* TODO INCLUIDO */}
      <section className="bg-[#f7f7f5] px-4 py-20 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cta-foreground mb-3">Todo incluido</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Una sola plataforma, todo resuelto</h2>
            <p className="mt-3 text-muted-foreground text-lg">Olvídate de contratar hosting, diseño y soporte por separado. En PLIA va todo junto, y te ayudamos a conectar tu dominio.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {incluye.map((f) => {
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

      {/* TIPOS DE WEB */}
      <section className="px-4 py-20 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cta-foreground mb-3">¿Qué necesitas?</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">El tipo de web ideal para tu negocio</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {tipos.map((t) => (
              <Link key={t.t} href={t.href} className="group bg-white rounded-3xl border border-border p-8 hover:shadow-xl hover:-translate-y-1 transition-all">
                <h3 className="font-bold text-xl mb-2">{t.t}</h3>
                <p className="text-muted-foreground">{t.d}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-cta-foreground">Ver más <ArrowRight size={15} className="group-hover:translate-x-0.5 transition" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESO */}
      <section className="bg-[#f7f7f5] px-4 py-20 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cta-foreground mb-3">Cómo funciona</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Tu web en 3 pasos</h2>
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

      {/* TESTIMONIOS — prueba social */}
      <section className="bg-[#f7f7f5] px-4 py-20 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cta-foreground mb-3">Clientes felices</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Negocios peruanos que ya confían en PLIA</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonios.map((t) => (
              <figure key={t.n} className="bg-white rounded-3xl border border-border p-7 flex flex-col">
                <blockquote className="text-[15px] leading-relaxed text-foreground/85 flex-1">“{t.txt}”</blockquote>
                <figcaption className="mt-5">
                  <p className="font-bold">{t.n}</p>
                  <p className="text-sm text-muted-foreground">{t.r}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-20 md:py-24">
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

      {/* RECURSOS (cluster interno hacia el blog) */}
      <section className="bg-[#f7f7f5] px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-bold mb-4">¿Quieres saber más antes de decidir?</h2>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <Link href="/blog/cuanto-cuesta-una-pagina-web-en-peru" className="underline text-cta-foreground font-medium">¿Cuánto cuesta una página web?</Link>
            <Link href="/blog/como-crear-una-pagina-web-para-tu-negocio-peru" className="underline text-cta-foreground font-medium">Cómo crear tu web paso a paso</Link>
            <Link href="/blog/checklist-pagina-web-debe-tener-para-vender" className="underline text-cta-foreground font-medium">Checklist de una web que vende</Link>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto rounded-[2.5rem] bg-foreground text-background px-8 py-14 text-center">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">¿Listo para tu página web?</h2>
          <p className="mt-3 text-background/70 max-w-xl mx-auto">Lista en 24 horas, con hosting, seguridad y soporte incluidos. A precio accesible.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/planes" className="bg-cta text-cta-foreground font-semibold px-7 py-3.5 rounded-full hover:opacity-90 transition inline-flex items-center gap-2">
              Ver planes <Check size={18} />
            </Link>
            <Link href="/contacto" className="bg-background/10 border border-background/20 font-semibold px-7 py-3.5 rounded-full hover:bg-background/20 transition">Escríbenos</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
