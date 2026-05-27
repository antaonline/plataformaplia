import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Consigue tu Dominio .pe o .com — Registro en Perú",
  description:
    "Registra tu dominio .pe, .com o .com.pe con PLIA. Activación inmediata, gestión 100% en español y configuración automática para tu página web.",
  keywords: [
    "comprar dominio .pe",
    "registrar dominio Peru",
    "dominio peruano",
    "dominio .com.pe",
    "dominio para mi negocio",
    "registrar dominio fácil",
    "dominio con hosting",
    "PLIA dominio",
  ],
  alternates: { canonical: "/consigue-tu-dominio" },
  openGraph: {
    title: "Consigue tu Dominio — PLIA",
    description:
      "Registra tu dominio .pe, .com o .com.pe con activación inmediata y gestión en español.",
    url: "/consigue-tu-dominio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tu Dominio con PLIA",
    description: "Dominio .pe, .com o .com.pe con activación inmediata.",
  },
};

export default function DominioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
