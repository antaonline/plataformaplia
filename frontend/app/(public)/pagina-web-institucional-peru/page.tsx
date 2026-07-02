import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Globe, ShieldCheck, Smartphone, Search, Headset, Server,
  Check, ArrowRight, FileText, Users, MapPin, Phone,
  Clock, Building2, Star,
} from 'lucide-react';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://plia.pe';

export const metadata: Metadata = {
  title: 'Página Web Institucional en Perú — Profesional y lista en 48h | PLIA',
  description:
    'Diseño de página web institucional para empresas en Perú. Hasta 5 páginas personalizadas, hosting, seguridad y soporte incluidos. Lista en 48 horas.',
  keywords: [
    'página web institucional Perú',
    'web institucional Perú',
    'diseño web para empresas Perú',
    'página web para empresa Lima',
    'web empresarial Perú',
    'crear página web para empresa Perú',
    'diseño web corporativo Lima',
    'web profesional para negocio Perú',
  ],
  alternates: { canonical: '/pagina-web-institucional-peru' },
  openGraph: {
    title: 'Página Web Institucional en Perú — Hasta 5 páginas, lista en 48h | PLIA',
    description:
      'Web profesional para tu empresa en Perú. Hosting, seguridad y soporte incluidos. Lista en 48 horas.',
    url: '/pagina-web-institucional-peru',
    type: 'website',
  },
};

const trust = ['Hasta 5 páginas', 'Hosting incluido', 'Subdominio gratis', 'Lista en 48 horas'];

const porQueNecesitas = [
  {
    stat: '75 %',
    t: 'juzgan por la web',
    d: 'Los usuarios evalúan la credibilidad de una empresa por su sitio web antes de hacer cualquier consulta.',
  },
  {
    stat: '48 h',
    t: 'y estás en internet',
    d: 'Tu web profesional, con diseño a tu medida y tu dominio conectado, lista antes de que termine la semana.',
  },
  {
    stat: '5',
    t: 'páginas personalizadas',
    d: 'Todo lo que tu empresa necesita: inicio, quiénes somos, servicios, contacto y más.',
  },
];

const paginas = [
  { n: '01', t: 'Inicio', d: 'Tu presentación principal. Quién eres, qué haces y por qué elegirte.' },
  { n: '02', t: 'Sobre nosotros', d: 'Historia, equipo, valores y lo que te hace diferente de la competencia.' },
  { n: '03', t: 'Servicios', d: 'Todo lo que ofreces, explicado con claridad para que te contacten listos para contratar.' },
  { n: '04', t: 'Contacto', d: 'Formulario, teléfono, WhatsApp y ubicación en el mapa. Fácil de encontrar.' },
  { n: '05', t: 'Blog o sección extra', d: 'Contenido para posicionarte en Google o una sección extra según tu rubro.' },
];

const incluye = [
  { icon: Globe, t: 'Tu dominio, conectado', d: 'Subdominio gratis al instante, y vinculamos tu dominio propio (.pe o .com) sin costo.' },
  { icon: Server, t: 'Hosting rápido y seguro', d: 'Alojamiento veloz para que tu web cargue en segundos.' },
  { icon: ShieldCheck, t: 'Certificado HTTPS', d: 'El candado de seguridad que transmite confianza a tus visitantes.' },
  { icon: Smartphone, t: 'Diseño responsive', d: 'Perfecta en celular, tablet y computadora. Donde esté tu cliente, ahí está tu web.' },
  { icon: Search, t: 'SEO básico configurado', d: 'Titles, meta descriptions y estructura lista para que Google te encuentre.' },
  { icon: Phone, t: 'Formulario de contacto', d: 'Tus clientes te escriben directo desde la web, sin depender solo del WhatsApp.' },
  { icon: MapPin, t: 'Mapa de ubicación', d: 'Tus clientes te encuentran fácilmente con Google Maps integrado.' },
  { icon: Headset, t: 'Soporte post-entrega', d: 'Un equipo peruano para cambios, dudas y actualizaciones después de lanzar.' },
];

const sectores = [
  { icon: '🏥', t: 'Salud y consultorios' },
  { icon: '⚖️', t: 'Estudios de derecho' },
  { icon: '🏗️', t: 'Construcción y acabados' },
  { icon: '🎓', t: 'Colegios e institutos' },
  { icon: '💄', t: 'Salones y estética' },
  { icon: '📊', t: 'Consultoría y finanzas' },
  { icon: '🏠', t: 'Inmobiliarias' },
  { icon: '🔧', t: 'Servicios técnicos' },
  { icon: '🐾', t: 'Veterinarias' },
  { icon: '🍽️', t: 'Restaurantes y catering' },
  { icon: '🏋️', t: 'Gimnasios y deportes' },
  { icon: '📐', t: 'Arquitectura y diseño' },
];

const pasos = [
  { n: '01', t: 'Nos cuentas de tu empresa', d: 'Qué ofreces, quiénes son tus clientes y cómo quieres proyectar tu marca en internet.' },
  { n: '02', t: 'Diseñamos tu web institucional', d: 'Adaptamos el diseño a tu sector y tu identidad. Colores, contenido real, estructura profesional.' },
  { n: '03', t: 'Publicamos en 48 horas', d: 'Con hosting, seguridad y soporte. Tu empresa en internet antes de que termine la semana.' },
];

const diferenciadores = [
  {
    icon: Building2,
    t: 'Hecha para tu sector',
    d: 'No es una plantilla genérica. Adaptamos el diseño, el contenido y la estructura a tu tipo de negocio.',
  },
  {
    icon: Clock,
    t: 'Lista en 48 horas',
    d: 'Cero reuniones eternas. Cero meses de espera. Tu web funcionando antes de que termine la semana.',
  },
  {
    icon: Star,
    t: 'Todo en una sola plataforma',
    d: 'Hosting, seguridad y soporte incluidos. Sin contratar nada por separado, y conectamos tu dominio gratis.',
  },
];

const faqs = [
  {
    q: '¿Cuántas páginas incluye la web institucional?',
    a: 'Hasta 5 páginas personalizadas: inicio, sobre nosotros, servicios, contacto y una sección adicional (blog, galería u otra según tu negocio).',
  },
  {
    q: '¿Puedo actualizar el contenido yo mismo después?',
    a: 'Sí. Te entregamos acceso para actualizar textos, fotos y datos de contacto sin necesitar conocimientos técnicos.',
  },
  {
    q: '¿La página web aparecerá en Google?',
    a: 'Sí. La entregamos con SEO básico configurado: estructura correcta, velocidad optimizada y datos para que Google te indexe desde el primer día.',
  },
  {
    q: '¿El dominio y el hosting están incluidos en el precio?',
    a: 'El hosting, la seguridad y el soporte van en un solo plan, más un subdominio gratis para publicar de inmediato. El dominio propio (.pe o .com) lo registras tú y nosotros lo vinculamos a tu web sin costo.',
  },
  {
    q: '¿En cuánto tiempo estará lista mi web institucional?',
    a: 'Tu web institucional de hasta 5 páginas está lista en 48 horas desde que nos confirmas el pedido y nos envías tu información.',
  },
  {
    q: '¿Qué necesito tener listo para empezar?',
    a: 'Solo los datos básicos de tu empresa: nombre, descripción de lo que ofreces, fotos (si tienes) y datos de contacto. El resto lo coordinamos contigo.',
  },
];

export default function PaginaWebInstitucionalPeru() {
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Diseño de página web institucional',
    name: 'Página web institucional para empresas en Perú',
    provider: { '@type': 'Organization', name: 'PLIA', url: siteUrl },
    areaServed: { '@type': 'Country', name: 'Perú' },
    url: `${siteUrl}/pagina-web-institucional-peru`,
    description:
      'Diseño de página web institucional para empresas en Perú. Hasta 5 páginas personalizadas, hosting, seguridad y soporte incluidos. Lista en 48 horas.',
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
      { '@type': 'ListItem', position: 2, name: 'Página web institucional en Perú', item: `${siteUrl}/pagina-web-institucional-peru` },
    ],
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="bg-foreground text-background relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-[460px] h-[460px] rounded-full bg-cta/5 pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-72 h-72 rounded-full bg-cta/5 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 pt-36 pb-20 md:pt-44 md:pb-28 text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-cta bg-cta/10 px-3 py-1.5 rounded-full mb-6">
            Web institucional · Perú
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">
            Tu empresa en internet —<br />
            <span className="text-cta">donde tus clientes ya te buscan</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-background/75 max-w-2xl mx-auto">
            Una web institucional profesional con hasta 5 páginas. Hosting, seguridad y soporte{' '}
            <strong className="text-background">todo incluido</strong>, lista en 48 horas.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/planes"
              className="bg-cta text-cta-foreground font-semibold px-7 py-3.5 rounded-full hover:opacity-90 transition inline-flex items-center gap-2"
            >
              Ver planes y precios <ArrowRight size={18} />
            </Link>
            <Link
              href="/contacto"
              className="bg-background/10 border border-background/20 font-semibold px-7 py-3.5 rounded-full hover:bg-background/20 transition"
            >
              Escríbenos ahora
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

      {/* ── ESTADÍSTICAS / POR QUÉ ───────────────────────────────────── */}
      <section className="bg-[#f7f7f5] px-4 py-20 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cta-foreground mb-3">Por qué importa</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Sin web profesional, tu empresa pierde credibilidad antes de hablar
            </h2>
            <p className="mt-3 text-muted-foreground text-lg">
              Cuando alguien te busca en Google y no te encuentra — o encuentra una web amateur — elige a tu competencia.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {porQueNecesitas.map((item) => (
              <div key={item.t} className="bg-white rounded-3xl border border-border p-8">
                <div className="text-5xl font-black text-cta-foreground mb-3">{item.stat}</div>
                <h3 className="font-bold text-lg mb-2">{item.t}</h3>
                <p className="text-muted-foreground text-[15px] leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PÁGINAS INCLUIDAS ─────────────────────────────────────────── */}
      <section className="px-4 py-20 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cta-foreground mb-3">Lo que incluye</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Hasta 5 páginas diseñadas para tu negocio
            </h2>
            <p className="mt-3 text-muted-foreground text-lg">
              Cada sección pensada para convertir visitas en llamadas, mensajes y ventas.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {paginas.map((p) => (
              <div key={p.t} className="bg-white rounded-3xl border border-border p-6 hover:border-cta/40 hover:shadow-md transition-all">
                <div className="text-3xl font-black text-cta-foreground/20 mb-3">{p.n}</div>
                <h3 className="font-bold text-base mb-1.5">{p.t}</h3>
                <p className="text-muted-foreground text-[13px] leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TODO INCLUIDO ────────────────────────────────────────────── */}
      <section className="bg-[#f7f7f5] px-4 py-20 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cta-foreground mb-3">Todo incluido</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Una sola plataforma, todo resuelto</h2>
            <p className="mt-3 text-muted-foreground text-lg">
              Hosting, diseño, seguridad y soporte en un solo lugar. Sin contratar nada aparte, y conectamos tu dominio gratis.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            {incluye.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.t} className="bg-white rounded-3xl border border-border p-6 hover:shadow-lg transition-shadow">
                  <div className="w-11 h-11 rounded-xl bg-cta/15 text-cta-foreground grid place-items-center mb-4">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-bold text-[15px] mb-1">{f.t}</h3>
                  <p className="text-muted-foreground text-[13px] leading-relaxed">{f.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── POR QUÉ PLIA ─────────────────────────────────────────────── */}
      <section className="bg-foreground text-background px-4 py-20 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cta mb-3">¿Por qué PLIA?</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              La plataforma peruana que entiende tu negocio
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {diferenciadores.map((d) => {
              const Icon = d.icon;
              return (
                <div key={d.t} className="rounded-3xl bg-background/5 border border-background/10 p-8">
                  <div className="w-12 h-12 rounded-2xl bg-cta/10 text-cta grid place-items-center mb-5">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold text-xl mb-2">{d.t}</h3>
                  <p className="text-background/65 leading-relaxed">{d.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECTORES ─────────────────────────────────────────────────── */}
      <section className="px-4 py-20 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cta-foreground mb-3">Para cualquier rubro</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Webs institucionales para todo tipo de empresa
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {sectores.map((s) => (
              <div key={s.t} className="bg-white rounded-2xl border border-border px-4 py-3.5 flex items-center gap-2.5 hover:border-cta/40 transition">
                <span className="text-xl">{s.icon}</span>
                <span className="text-[14px] font-semibold">{s.t}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-muted-foreground text-sm text-center">
            ¿No ves tu rubro?{' '}
            <Link href="/contacto" className="text-cta-foreground font-semibold underline underline-offset-2">
              Escríbenos
            </Link>{' '}
            — seguro podemos ayudarte.
          </p>
        </div>
      </section>

      {/* ── PROCESO ──────────────────────────────────────────────────── */}
      <section className="bg-[#f7f7f5] px-4 py-20 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cta-foreground mb-3">Cómo funciona</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Tu web institucional en 3 pasos</h2>
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
      <section className="px-4 py-20 md:py-24">
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
      <section className="bg-[#f7f7f5] px-4 py-14">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-semibold mb-3">Lee más antes de decidir</p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <Link href="/blog/pagina-web-para-empresas-web-institucional" className="underline underline-offset-2 text-cta-foreground font-medium">
              Web institucional: todo lo que debes saber
            </Link>
            <Link href="/blog/cuanto-cuesta-una-pagina-web-en-peru" className="underline underline-offset-2 text-cta-foreground font-medium">
              ¿Cuánto cuesta una página web?
            </Link>
            <Link href="/blog/checklist-pagina-web-debe-tener-para-vender" className="underline underline-offset-2 text-cta-foreground font-medium">
              Checklist de una web que vende
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
              Tu empresa merece estar en internet
            </h2>
            <p className="mt-3 text-background/70 max-w-xl mx-auto text-lg">
              Web institucional lista en 48 horas, con hosting, seguridad y soporte incluidos.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/planes"
                className="bg-cta text-cta-foreground font-semibold px-7 py-3.5 rounded-full hover:opacity-90 transition inline-flex items-center gap-2"
              >
                Ver planes y precios <ArrowRight size={18} />
              </Link>
              <Link
                href="/contacto"
                className="bg-background/10 border border-background/20 font-semibold px-7 py-3.5 rounded-full hover:bg-background/20 transition"
              >
                Escríbenos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
