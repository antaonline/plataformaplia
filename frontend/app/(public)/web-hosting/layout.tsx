import type { Metadata } from "next";

export const metadata: Metadata = {
  // OJO: el dominio propio NO está incluido en los planes de hosting (solo
  // subdominio gratis). No prometer "dominio incluido" en ningún metadata.
  title: "Hosting Web en Perú — LiteSpeed, NVMe, SSL y soporte 24/7",
  description:
    "Hosting profesional en Perú con servidores LiteSpeed, discos NVMe, SSL, correos y soporte 24/7 incluidos. Migración gratis y activación inmediata desde S/16/mes.",
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
    title: "Hosting Web en Perú — LiteSpeed, NVMe y SSL | PLIA",
    description:
      "Hosting profesional con LiteSpeed, NVMe, SSL, correos y soporte 24/7. Migración gratis, desde S/16/mes.",
    url: "/web-hosting",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hosting Web en Perú • PLIA",
    description:
      "Hosting profesional con LiteSpeed, NVMe, SSL, correos y soporte 24/7 incluidos.",
  },
};

// NOTA: este layout envuelve también a las subpáginas del silo de hosting
// (/web-hosting/wordpress, /web-hosting/migracion), que definen su propia
// metadata y su propio JSON-LD. Por eso los schemas del PILAR viven en
// schema.ts y se renderizan desde page.tsx — si estuvieran aquí se
// duplicarían en cada subpágina.
export default function WebHostingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
