import type { GetStaticPaths, GetStaticProps } from 'next';
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

export const getStaticPaths: GetStaticPaths = async () => {
  const list = (pages as any).pages as PageData[];
  const paths = list
    .filter((p) => p.slug !== 'index')
    .map((p) => ({ params: { slug: p.slug } }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<Props> = async (ctx) => {
  const slug = ctx.params?.slug as string;
  const list = (pages as any).pages as PageData[];
  const page = list.find((p) => p.slug === slug) ?? list[0];
  return { props: { page, assets: (assets as any).assets || [] } };
};

export default function Page({ page, assets }: Props) {
  return (
    <main className="page">
      <section className="hero">
        <div>
          <h1>{page.title}</h1>
          <p className="lead">{page.sections?.[0]?.subtitle}</p>
          {page.sections?.[0]?.cta && (
            <a className="cta" href={page.sections[0].cta.href}>
              {page.sections[0].cta.label}
            </a>
          )}
        </div>
        {assets?.[1] && <img className="hero-image" src={assets[1]} alt="Hero" />}
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
