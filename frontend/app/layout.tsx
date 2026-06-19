import type { Metadata } from "next";
/*import { Sansation } from "next/font/google";*/
import Script from "next/script";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MetaPixel from "@/components/MetaPixel";


const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://plia.pe';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PLIA • Tu Web Fácil — Páginas web y hosting en Perú",
    template: "%s • PLIA",
  },
  description:
    "PLIA crea tu página web profesional en 24 horas. Dominio, hosting, diseño y soporte — todo incluido. La plataforma web para emprendedores peruanos.",
  keywords: [
    "PLIA",
    "Tu Web Fácil",
    "página web Peru",
    "diseño de páginas web Perú",
    "hosting Peru",
    "crear página web",
    "diseño web Lima",
    "página web profesional",
    "alojamiento web Peru",
    "dominio .pe",
    "web emprendedor",
    "tienda online Peru",
    "ecommerce Lima",
    "página web pyme",
    "hosting WordPress Peru",
    "páginas web baratas Perú",
  ],
  authors: [{ name: "PLIA", url: siteUrl }],
  creator: "PLIA",
  publisher: "PLIA",
  applicationName: "PLIA",
  category: "Technology",
  alternates: {
    canonical: "/",
  },
  icons: {
    // Next.js 14 auto-detecta app/icon.svg y app/apple-icon.svg.
    // Listamos el SVG explicitamente para reforzar y mantener el icono
    // del directorio public/ disponible (mismo archivo, cero duplicacion).
    icon: [
      { url: "/iconblack-plia-cuadrado.svg", type: "image/svg+xml" },
    ],
    shortcut: "/iconblack-plia-cuadrado.svg",
    apple: "/iconblack-plia-cuadrado.svg",
  },
  openGraph: {
    title: "PLIA • Tu Web Fácil — Páginas web y hosting en Perú",
    description:
      "Tu página web profesional lista en 24 horas. Dominio, hosting y soporte incluidos. La plataforma para emprendedores peruanos.",
    url: siteUrl,
    siteName: "PLIA",
    images: [
      {
        url: "/pliaportadaurl.png",
        width: 1200,
        height: 630,
        alt: "PLIA - Tu Web Fácil",
      },
    ],
    locale: "es_PE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PLIA • Tu Web Fácil — Páginas web y hosting en Perú",
    description:
      "Tu página web lista en 24 horas. Dominio, hosting y soporte incluidos — todo en una sola plataforma.",
    images: ["/pliaportadaurl.png"],
    creator: "@plia_pe",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PLIA",
    alternateName: "PLIA - Tu Web Fácil",
    url: siteUrl,
    logo: `${siteUrl}/iconblack-plia-cuadrado.svg`,
    image: `${siteUrl}/pliaportadaurl.png`,
    description:
      "PLIA es la plataforma peruana para crear tu página web profesional. Incluye dominio, hosting, diseño y soporte — tu web lista en 24 horas, todo incluido.",
    areaServed: { "@type": "Country", name: "Perú" },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lima",
      addressCountry: "PE",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: "+51958617185",
      email: "hola@plia.pe",
      availableLanguage: ["es"],
      areaServed: "PE",
    },
    // sameAs: agregar aquí las URLs de redes oficiales cuando estén confirmadas.
    sameAs: [],
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PLIA",
    url: siteUrl,
    inLanguage: "es-PE",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="es-PE">
      <body
        className={`antialiased`}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=Sansation:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap"
          rel="stylesheet"
        />
        <Script
          id="ld-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <Script
          id="ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <link
          rel="stylesheet"
          href="https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/classic-reset.css"
        />
        <link
          rel="stylesheet"
          href="https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/classic.css"
        />
        <link
          rel="stylesheet"
          href="/izipay-embedded.css"
        />
        <Script
          src="https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js"
          strategy="afterInteractive"
          data-public-key={process.env.NEXT_PUBLIC_MCW_PUBLIC_KEY}
        />

        <MetaPixel />
        <div className="min-h-screen flex flex-col">

            <main style={{ padding: "0px" }}>
              {children}
            </main>

        </div>

      </body>
    </html>
  );
}
