import type { Metadata } from 'next';
import { POSTS } from './posts';
import BlogList from './BlogList';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://plia.pe';

export const metadata: Metadata = {
  title: 'Blog — Guías de páginas web, hosting y negocios en Perú',
  description:
    'Guías claras sobre páginas web, precios, hosting, dominios y cómo hacer crecer tu negocio en internet en el Perú. Aprende a tener presencia online que sí vende.',
  keywords: [
    'blog páginas web Perú',
    'guías diseño web Perú',
    'cuánto cuesta una página web',
    'cómo crear una página web Perú',
    'hosting y dominios Perú',
  ],
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog de PLIA — Páginas web y negocios en Perú',
    description: 'Guías claras sobre páginas web, precios, hosting y cómo crecer en internet en el Perú.',
    url: '/blog',
    type: 'website',
  },
};

export default function BlogIndex() {
  const posts = [...POSTS].sort((a, b) => +new Date(b.date) - +new Date(a.date));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Blog de PLIA',
    url: `${siteUrl}/blog`,
    inLanguage: 'es-PE',
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: `${siteUrl}/blog/${p.slug}`,
      datePublished: p.date,
      description: p.description,
    })),
  };

  return (
    <div className="bg-[#f7f7f5] min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-4 pt-28 pb-10 md:pt-32 md:pb-14 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-cta-foreground bg-cta/15 px-3 py-1.5 rounded-full mb-5">
            Blog
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">
            Guías para tu página web y tu negocio
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
            Todo lo que necesitas saber sobre páginas web, precios, hosting y cómo hacer crecer tu
            negocio en internet en el Perú. Sin tecnicismos, directo al grano.
          </p>
        </div>
      </section>

      <BlogList posts={posts} />
    </div>
  );
}
