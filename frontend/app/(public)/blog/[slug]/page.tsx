import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { POSTS, getPost } from '../posts';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://plia.pe';

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPost(params.slug);
  if (!post) return { title: 'Artículo no encontrado' };
  const url = `/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: 'article',
      publishedTime: post.date,
      images: [{ url: post.cover }],
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.description, images: [post.cover] },
  };
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });

// Estilo del contenido (tipografía Sansation heredada del sitio + tokens PLIA).
const mdComponents = {
  h2: (p: any) => <h2 className="text-2xl md:text-3xl font-black tracking-tight mt-12 mb-4" {...p} />,
  h3: (p: any) => <h3 className="text-xl font-bold mt-8 mb-3" {...p} />,
  p: (p: any) => <p className="text-[17px] leading-relaxed text-foreground/85 my-5" {...p} />,
  ul: (p: any) => <ul className="my-5 space-y-2.5 pl-1" {...p} />,
  ol: (p: any) => <ol className="my-5 space-y-2.5 list-decimal pl-6" {...p} />,
  li: (p: any) => <li className="text-[17px] leading-relaxed text-foreground/85 marker:text-cta-foreground" {...p} />,
  a: (p: any) => <a className="text-cta-foreground font-semibold underline underline-offset-2 hover:opacity-80" {...p} />,
  strong: (p: any) => <strong className="font-bold text-foreground" {...p} />,
  blockquote: (p: any) => <blockquote className="my-6 border-l-4 border-cta pl-5 py-1 text-foreground/70 italic" {...p} />,
  table: (p: any) => <div className="my-7 overflow-x-auto rounded-2xl border border-border"><table className="w-full text-left text-[15px]" {...p} /></div>,
  thead: (p: any) => <thead className="bg-muted/40" {...p} />,
  th: (p: any) => <th className="p-3.5 font-bold border-b border-border" {...p} />,
  td: (p: any) => <td className="p-3.5 border-b border-border/60 align-top" {...p} />,
};

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  const url = `${siteUrl}/blog/${post.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.cover,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: 'es-PE',
    keywords: post.keywords.join(', '),
    author: { '@type': 'Organization', name: 'PLIA', url: siteUrl },
    publisher: {
      '@type': 'Organization',
      name: 'PLIA',
      url: siteUrl,
      logo: { '@type': 'ImageObject', url: `${siteUrl}/iconblack-plia-cuadrado.svg` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };

  return (
    <article className="bg-[#f7f7f5] min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-3xl mx-auto px-4 pt-28 md:pt-32">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft size={16} /> Volver al blog
        </Link>

        <header className="mt-6 mb-8">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-cta-foreground bg-cta/15 px-3 py-1.5 rounded-full">
            {post.category}
          </span>
          <h1 className="mt-5 text-3xl md:text-5xl font-black tracking-tight leading-[1.08]">{post.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{post.description}</p>
          <p className="mt-4 text-sm text-muted-foreground">{fmtDate(post.date)} · {post.readingMinutes} min de lectura</p>
        </header>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={post.cover} alt={post.title} className="w-full aspect-[16/8] object-cover rounded-3xl shadow-lg mb-10" />
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-16">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
          {post.content}
        </ReactMarkdown>

        {/* CTA final */}
        <div className="mt-14 rounded-[2rem] bg-foreground text-background px-8 py-10 text-center">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">¿Listo para tu página web?</h2>
          <p className="mt-2 text-background/70">Lista en 24 horas, con dominio, hosting y soporte incluidos.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/planes" className="bg-cta text-cta-foreground font-semibold px-7 py-3 rounded-full hover:opacity-90 transition">Ver planes</Link>
            <Link href="/contacto" className="bg-background/10 border border-background/20 font-semibold px-7 py-3 rounded-full hover:bg-background/20 transition">Escríbenos</Link>
          </div>
        </div>
      </div>
    </article>
  );
}
