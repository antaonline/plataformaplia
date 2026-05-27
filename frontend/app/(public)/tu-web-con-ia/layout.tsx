import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crea tu Página Web con Inteligencia Artificial",
  description:
    "Tu página web profesional generada con IA en minutos. PLIA crea tu sitio completo: diseño, imágenes, textos y publicación. Sin programar, sin diseñar.",
  keywords: [
    "página web con IA",
    "crear web con inteligencia artificial",
    "generador de páginas web IA",
    "web automática Peru",
    "página web sin programar",
    "IA para emprendedores",
    "crear sitio web con IA Peru",
    "diseño web automatico",
    "web inteligencia artificial Lima",
    "PLIA IA",
  ],
  alternates: { canonical: "/tu-web-con-ia" },
  openGraph: {
    title: "Crea tu Página Web con Inteligencia Artificial — PLIA",
    description:
      "Tu sitio web completo generado por IA en minutos: diseño, textos e imágenes. Sin programar.",
    url: "/tu-web-con-ia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Página web con IA • PLIA",
    description: "Sitio web completo generado por IA en minutos.",
  },
};

export default function TuWebConIaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
