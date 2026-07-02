import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Planes y Precios de Páginas Web en Perú",
  description:
    "Planes claros y económicos para tu página web en Perú. Diseño, hosting y soporte incluidos, con pago único desde S/390 y prueba gratis de 30 días. Sin sorpresas, sin letra chica.",
  keywords: [
    "precios página web Peru",
    "planes web Peru",
    "cuánto cuesta una página web",
    "plan web emprendedor",
    "página web económica Lima",
    "tarifas diseño web Peru",
    "precios hosting Peru",
    "plan página web pyme",
    "PLIA planes",
  ],
  alternates: { canonical: "/planes" },
  openGraph: {
    title: "Planes y Precios — PLIA",
    description:
      "Planes claros con diseño, hosting y soporte incluidos. Pago único desde S/390 y prueba gratis de 30 días.",
    url: "/planes",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Planes PLIA",
    description: "Páginas web con hosting y soporte incluidos, pago único desde S/390.",
  },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://plia.pe";

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Planes PLIA — Página web profesional",
  description:
    "Páginas web profesionales con diseño, hosting y soporte incluidos, subdominio gratis y conexión de tu dominio sin costo.",
  brand: { "@type": "Brand", name: "PLIA" },
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "PEN",
    lowPrice: "390",
    highPrice: "690",
    offerCount: "2",
    seller: { "@type": "Organization", name: "PLIA", url: siteUrl },
  },
};

export default function PlanesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      {children}
    </>
  );
}
