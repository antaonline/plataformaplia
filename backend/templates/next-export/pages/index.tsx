import type { GetStaticProps } from 'next';
import site from '../data/site.json';
import pages from '../data/pages.json';
import assets from '../data/assets.json';

type Section = {
  id: string;
  type: string;
  title?: string;
  subtitle?: string;
  bullets?: string[];
  cta?: { label: string; href: string };
  content?: string;
};

type PageData = {
  slug: string;
  title: string;
  sections: Section[];
};

type Props = {
  page: PageData;
  assets: string[];
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  const page = (pages as any).pages.find((p: PageData) => p.slug === 'index') ?? (pages as any).pages[0];
  return {
    props: {
      page,
      assets: (assets as any).assets || [],
    },
  };
};

export default function Home({ page, assets }: Props) {
  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">{site.brand?.tagline}</p>
          <h1>{page.title || site.brand?.name}</h1>
          <p className="lead">{page.sections?.[0]?.subtitle}</p>
          {page.sections?.[0]?.cta && (
            <a className="cta" href={page.sections[0].cta.href}>
              {page.sections[0].cta.label}
            </a>
          )}
        </div>
        {assets?.[0] && <img className="hero-image" src={assets[0]} alt="Hero" />}
      </section>

      {page.sections?.slice(1).map((section) => (
        <section key={section.id} className="section">
          <h2>{section.title}</h2>
          {section.subtitle && <p className="subtitle">{section.subtitle}</p>}
          {section.content && <p>{section.content}</p>}
          {section.bullets && (
            <ul>
              {section.bullets.map((item, idx) => (
                <li key={`${section.id}-${idx}`}>{item}</li>
              ))}
            </ul>
          )}
          {section.cta && (
            <a className="cta" href={section.cta.href}>
              {section.cta.label}
            </a>
          )}
        </section>
      ))}
    </main>
  );
}
