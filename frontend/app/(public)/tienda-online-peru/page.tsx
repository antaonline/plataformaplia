import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShoppingCart, Package, CreditCard, Globe, ShieldCheck, Smartphone,
  Search, Headset, Server, Check, ArrowRight, X as XIcon,
  Clock, Store,
} from 'lucide-react';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://plia.pe';

export const metadata: Metadata = {
  title: 'Tienda Online en Perú — Lista para vender en 48 horas | PLIA',
  description:
    'Crea tu tienda online en Perú con catálogo, carrito de compras y pagos integrados. Dominio, hosting y soporte incluidos. Lista en 48 horas sin saber de tecnología.',
  keywords: [
    'tienda online Perú',
    'crear tienda online Perú',
    'tienda virtual Perú',
    'vender por internet Perú',
    'ecommerce Perú',
    'tienda en línea Perú',
    'tienda online Lima',
    'crear tienda en línea Perú',
    'plataforma ecommerce Perú',
  ],
  alternates: { canonical: '/tienda-online-peru' },
  openGraph: {
    title: 'Tienda Online en Perú — Lista para vender en 48 horas | PLIA',
    description:
      'Catálogo, carrito, pagos y dominio incluidos. Tu tienda online en Perú lista en 48 horas.',
    url: '/tienda-online-peru',
    type: 'website',
  },
};

const trust = ['Dominio incluido', 'Hosting veloz', 'Pagos integrados', 'Soporte en español'];

const sinTienda = [
  'Pierdes pedidos cuando no estás conectado al WhatsApp',
  'Tus precios cambian en cada conversación',
  'No puedes mostrar todo tu catálogo ordenado',
  'Los pagos son manuales: transferencia o efectivo',
  'Google no te encuentra — no existes para el buscador',
  'Escalar el negocio depende solo de tu tiempo',
];

const conTienda = [
  'Tu tienda vende sola las 24 horas, incluso mientras duermes',
  'Precios y stock siempre actualizados y visibles',
  'Catálogo completo, ordenado por categorías',
  'Cobras con tarjeta o billetera digital automáticamente',
  'Apareces en Google cuando buscan lo que vendes',
  'Creces sin depender solo de tu energía y tu celular',
];

const incluye = [
  { icon: Package, t: 'Catálogo de productos', d: 'Sube tus productos con fotos, descripciones y precios. Fácil de gestionar.' },
  { icon: ShoppingCart, t: 'Carrito de compras', d: 'Tus clientes seleccionan y compran en minutos, sin salir de tu tienda.' },
  { icon: CreditCard, t: 'Pagos integrados', d: 'Acepta tarjetas y billeteras digitales directamente en tu tienda.' },
  { icon: Globe, t: 'Dominio propio', d: 'Tu dirección única (.pe o .com) incluida y configurada desde el primer día.' },
  { icon: Server, t: 'Hosting veloz', d: 'Alojamiento rápido para que tu tienda cargue en segundos en cualquier dispositivo.' },
  { icon: ShieldCheck, t: 'Seguridad HTTPS', d: 'Certificado SSL que inspira confianza y protege los datos de tus compradores.' },
  { icon: Smartphone, t: 'Diseño responsive', d: 'Perfecta en celular. El 80 % de las compras online se hacen desde el teléfono.' },
  { icon: Search, t: 'Optimizada para Google', d: 'Configurada para aparecer cuando alguien busca tus productos en internet.' },
  { icon: Headset, t: 'Soporte en español', d: 'Un equipo peruano listo para cambios, dudas y actualizaciones.' },
];

const diferenciadores = [
  {
    icon: Store,
    t: 'Plataforma 100 % peruana',
    d: 'Sabemos cómo funciona el mercado local: los pagos, los proveedores y las necesidades reales de tu negocio.',
  },
  {
    icon: Clock,
    t: 'Lista en 48 horas',
    d: 'Sin esperar semanas, sin reuniones interminables. Tu tienda funciona antes de que termine la semana.',
  },
  {
    icon: ShieldCheck,
    t: 'Sin costos ocultos',
    d: 'Un solo plan que incluye dominio, hosting, diseño y soporte. Nada más, nada menos.',
  },
];

const sectores = [
  'Ropa y moda', 'Alimentos y bebidas', 'Accesorios', 'Electrónicos',
  'Artesanías y manualidades', 'Cosméticos y belleza', 'Suplementos', 'Cursos y libros',
  'Juguetes', 'Decoración del hogar', 'Productos para mascotas', 'Artículos deportivos',
];

const pasos = [
  { n: '01', t: 'Cuéntanos de tu tienda', d: 'Qué vendes, cuántos productos tienes y cómo quieres que se vea tu negocio online.' },
  { n: '02', t: 'Creamos tu tienda online', d: 'Diseñamos tu catálogo, configuramos los pagos y dejamos todo listo para vender.' },
  { n: '03', t: 'Publicas en 48 horas', d: 'Con dominio, hosting, seguridad y soporte. Tu tienda abierta y lista para recibir pedidos.' },
];

const faqs = [
  {
    q: '¿Necesito saber de tecnología para tener una tienda online?',
    a: 'No. Tú nos cuentas qué vendes y nosotros creamos tu tienda completa. Te la entregamos lista y te explicamos cómo actualizarla sin necesitar conocimientos técnicos.',
  },
  {
    q: '¿Cuántos productos puedo subir a mi tienda?',
    a: 'Puedes subir todos los productos que necesites. Coordinamos contigo la carga inicial y te enseñamos a gestionarlos por tu cuenta.',
  },
  {
    q: '¿Cómo recibo los pagos de mis clientes?',
    a: 'Tu tienda acepta tarjetas y billeteras digitales directamente. El dinero va a tu cuenta bancaria sin intermediarios.',
  },
  {
    q: '¿El dominio y el hosting están incluidos?',
    a: 'Sí. A diferencia de plataformas como Shopify que te cobran por separado, en PLIA el dominio, hosting y seguridad ya están en el precio.',
  },
  {
    q: '¿Puedo combinar mi tienda online con WhatsApp?',
    a: 'Claro. Muchos de nuestros clientes usan la tienda para mostrar el catálogo y cerrar ventas por WhatsApp. Funciona perfecto.',
  },
  {
    q: '¿En cuánto tiempo estará lista mi tienda?',
    a: 'En 48 horas ya tienes tu tienda funcionando con productos, pagos y dominio configurados.',
  },
];

export default function TiendaOnlinePeru() {
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Tienda online / ecommerce',
    name: 'Tienda online en Perú',
    provider: { '@type': 'Organization', name: 'PLIA', url: siteUrl },
    areaServed: { '@type': 'Country', name: 'Perú' },
    url: `${siteUrl}/tienda-online-peru`,
    description:
      'Creación de tiendas online en Perú con catálogo, carrito de compras, pagos integrados, dominio y hosting incluidos. Lista en 48 horas.',
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
      { '@type': 'ListItem', position: 2, name: 'Tienda online en Perú', item: `${siteUrl}/tienda-online-peru` },
    ],
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="bg-foreground text-background relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-[480px] h-[480px] rounded-full bg-cta/5 pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-cta/5 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 pt-36 pb-20 md:pt-44 md:pb-28 text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-cta bg-cta/10 px-3 py-1.5 rounded-full mb-6">
            Tienda online · Perú
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">
            Empieza a vender por internet<br />
            <span className="text-cta">en 48 horas</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-background/75 max-w-2xl mx-auto">
            Tu tienda con catálogo, carrito y pagos integrados.
            Dominio, hosting y soporte <strong className="text-background">todo incluido</strong> — sin saber de tecnología.
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

      {/* ── PROBLEMA / COMPARACIÓN ───────────────────────────────────── */}
      <section className="bg-[#f7f7f5] px-4 py-20 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cta-foreground mb-3">La realidad</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Sin tienda online, estás dejando ir clientes todos los días
            </h2>
            <p className="mt-3 text-muted-foreground text-lg">
              Vender solo por WhatsApp funciona hasta cierto punto. Después, te frena.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-red-100 p-8">
              <div className="inline-block text-xs font-bold uppercase tracking-widest text-red-400 bg-red-50 px-3 py-1 rounded-full mb-6">
                Solo por WhatsApp
              </div>
              <ul className="space-y-4">
                {sinTienda.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                      <XIcon size={12} className="text-red-500" />
                    </div>
                    <span className="text-[15px] text-foreground/75">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-cta/5 rounded-3xl border border-cta/20 p-8">
              <div className="inline-block text-xs font-bold uppercase tracking-widest text-cta-foreground bg-cta/15 px-3 py-1 rounded-full mb-6">
                Con tu tienda online en PLIA
              </div>
              <ul className="space-y-4">
                {conTienda.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-cta/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} className="text-cta-foreground" />
                    </div>
                    <span className="text-[15px]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── TODO INCLUIDO ────────────────────────────────────────────── */}
      <section className="px-4 py-20 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cta-foreground mb-3">Todo incluido</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Tu tienda online lo tiene todo</h2>
            <p className="mt-3 text-muted-foreground text-lg">
              Sin contratar hosting aparte, sin pagar dominio extra, sin sorpresas al final del mes.
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cta-foreground mb-3">Para tu negocio</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Hacemos tiendas online para todo tipo de negocio
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {sectores.map((s) => (
              <div key={s} className="bg-white rounded-2xl border border-border px-4 py-3.5 text-[15px] font-semibold text-center hover:border-cta/40 transition">
                {s}
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
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Tu tienda online en 3 pasos</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {pasos.map((p) => (
              <div key={p.t} className="relative">
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
          <p className="font-semibold mb-3">¿Quieres informarte antes de decidir?</p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <Link href="/blog/tienda-online-en-peru-como-empezar-a-vender" className="underline underline-offset-2 text-cta-foreground font-medium">
              Cómo empezar a vender online en Perú
            </Link>
            <Link href="/blog/cuanto-cuesta-una-pagina-web-en-peru" className="underline underline-offset-2 text-cta-foreground font-medium">
              ¿Cuánto cuesta una tienda online?
            </Link>
            <Link href="/blog/checklist-pagina-web-debe-tener-para-vender" className="underline underline-offset-2 text-cta-foreground font-medium">
              Checklist: lo que tu tienda sí debe tener
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
              Tu tienda online te está esperando
            </h2>
            <p className="mt-3 text-background/70 max-w-xl mx-auto text-lg">
              Lista en 48 horas, con todo incluido. Empieza a vender por internet hoy mismo.
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
