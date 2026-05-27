import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hosting Web en Perú con dominio y SSL incluidos",
  description:
    "Hosting profesional en Perú con dominio, SSL, correos y soporte 24/7 incluidos. Activación inmediata desde S/19/mes. Ideal para emprendedores y pymes.",
  keywords: [
    "hosting Peru",
    "hosting con dominio",
    "alojamiento web Peru",
    "hosting Lima",
    "hosting económico Peru",
    "hosting WordPress Peru",
    "hosting SSL gratis",
    "hosting profesional",
    "hosting emprendedor",
    "hosting pyme Peru",
    "hosting con correos",
    "PLIA hosting",
  ],
  alternates: { canonical: "/web-hosting" },
  openGraph: {
    title: "Hosting Web en Perú con dominio y SSL incluidos — PLIA",
    description:
      "Hosting profesional con dominio, SSL, correos y soporte 24/7. Activación inmediata desde S/19/mes.",
    url: "/web-hosting",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hosting Web en Perú • PLIA",
    description:
      "Hosting profesional con dominio, SSL, correos y soporte 24/7 incluidos.",
  },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://plia.pe";

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Web Hosting",
  name: "Hosting Web PLIA",
  provider: {
    "@type": "Organization",
    name: "PLIA",
    url: siteUrl,
  },
  areaServed: { "@type": "Country", name: "Peru" },
  description:
    "Hosting profesional en Perú con dominio, SSL, correos y soporte 24/7 incluidos.",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "PEN",
    lowPrice: "19",
    highPrice: "199",
    offerCount: "3",
  },
};

export default function WebHostingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      {children}
    </>
  );
}
