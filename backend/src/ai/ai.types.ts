export type AiMode = 'standard' | 'economy';

export type SiteSpec = {
  brand: {
    name: string;
    tagline: string;
    tone: string;
  };
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    heading: string;
    body: string;
  };
  sections: Array<{
    id: string;
    type: string;
    title?: string;
    subtitle?: string;
    bullets?: string[];
    cta?: { label: string; href: string };
    content?: string;
  }>;
  pages?: Array<{
    slug: string;
    title: string;
    sections: SiteSpec['sections'];
  }>;
  images: Array<{
    id: string;
    prompt: string;
    usage: string;
  }>;
};

export type AiGenerationResult = {
  spec: SiteSpec;
  images: Array<{ id: string; url: string; usage: string }>;
  html?: string;
  pages?: Array<{ slug: string; html: string }>;
  score: {
    conversion: number;
    seo: number;
    accessibility: number;
    performance: number;
    notes: string[];
  };
};
