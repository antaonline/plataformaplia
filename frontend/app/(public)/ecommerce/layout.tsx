import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tienda Online en Perú con Yape, Plin y tarjeta",
  description:
    "Crea tu tienda online profesional con PLIA. Pagos con Yape, Plin, tarjeta y transferencia. Catálogo, stock, envíos y soporte 24/7 — todo incluido.",
  keywords: [
    "tienda online Peru",
    "ecommerce Lima",
    "tienda virtual Peru",
    "vender por internet Peru",
    "ecommerce con Yape",
    "tienda online con IA",
    "página web tienda Peru",
    "ecommerce emprendedor",
    "tienda online pyme",
    "PLIA ecommerce",
  ],
  alternates: { canonical: "/ecommerce" },
  openGraph: {
    title: "Tienda Online en Perú — PLIA",
    description:
      "Crea tu tienda online con pagos por Yape, Plin y tarjeta. Catálogo, stock y soporte 24/7.",
    url: "/ecommerce",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tienda Online Peru • PLIA",
    description: "Tienda online con Yape, Plin y tarjeta. Todo incluido.",
  },
};

export default function EcommerceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
